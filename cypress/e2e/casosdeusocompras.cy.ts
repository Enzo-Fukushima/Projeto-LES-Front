describe("Fluxo completo de compra com cupons e múltiplos cartões", () => {
  const clienteId = 1;
  const livroId = 12;
  const cartId = 123;

  beforeEach(() => {
    cy.viewport(1280, 800);

    window.localStorage.setItem(
      "bookstore_user",
      JSON.stringify({ id: clienteId, nome: "Felipe Lopes" })
    );

    // === 🧱 Mocks principais
    cy.intercept("GET", "**/livros", [
      {
        id: livroId,
        titulo: "Harry Potter e a Pedra Filosofal",
        preco: 89.9,
        estoque: 10,
        imagemUrl: "/placeholder.svg",
      },
    ]).as("listBooks");

    cy.intercept("GET", `**/carrinhos/cliente/*`, {
      id: cartId,
      itens: [],
    }).as("getCartEmpty");

    cy.intercept("POST", `**/carrinhos/*/itens`, {
      id: cartId,
      itens: [{ livroId, quantidade: 1, precoUnitario: 89.9 }],
    }).as("addItem");
  });

  it("deve concluir a compra aplicando cupom e pagando com dois cartões (mockados)", () => {
    // Carrinho com item
    cy.intercept("GET", `**/carrinhos/cliente/${clienteId}`, {
      statusCode: 200,
      body: {
        id: cartId,
        clienteId,
        itens: [
          {
            livroId,
            titulo: "Harry Potter e a Pedra Filosofal",
            quantidade: 1,
            precoUnitario: 89.9,
          },
        ],
      },
    }).as("getCartWithItem");

    // 💳 Cartões já mockados (2 cartões)
    cy.intercept("GET", `**/clientes/${clienteId}/cartoes`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          numeroCartao: "4111111111111111",
          numero: "****1111",
          bandeira: "VISA",
          nomeTitular: "FELIPE TESTE",
          validade: "12/28",
        },
        {
          id: 2,
          numeroCartao: "5555555555554444",
          numero: "****4444",
          bandeira: "MASTERCARD",
          nomeTitular: "FELIPE TESTE",
          validade: "11/28",
        },
      ],
    }).as("getCardsWithTwo");

    // 🔹 Mock do endereço para aparecer já na seleção
    cy.intercept("GET", `**/clientes/${clienteId}/enderecos`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          logradouro: "Rua dos Testes",
          numero: "100",
          cidade: "São Paulo",
          estado: "SP",
          cep: "12345-678",
          tipoEndereco: "ENTREGA",
        },
      ],
    }).as("getAddressesWithData");

    // Criação de endereço
    cy.intercept("POST", "**/enderecos", {
      id: 1,
      logradouro: "Rua dos Testes",
      numero: "100",
      cidade: "São Paulo",
      estado: "SP",
      cep: "12345-678",
      tipoEndereco: "ENTREGA",
    }).as("createAddress");

    // Validação de cupons
    cy.intercept("POST", "**/cupons/validar", (req) => {
      const { codigo } = req.body;
      if (codigo === "DESCONTO10") {
        req.reply({
          statusCode: 200,
          body: { codigo, percentual: 10, valido: true },
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { message: "Cupom inválido" },
        });
      }
    }).as("validateCoupon");

    // Checkout final
    cy.intercept("POST", "**/pedidos/checkout", {
      statusCode: 200,
      body: { pedidoId: 999 },
    }).as("checkout");

    // ====== 🛒 Adicionar livro ao carrinho
    cy.visit("http://localhost:3000");
    cy.wait("@listBooks");
    cy.contains("Harry Potter e a Pedra Filosofal").should("be.visible");
    cy.contains("Adicionar ao Carrinho").click();
    cy.wait("@addItem");

    // ====== 🧾 Ir para o carrinho
    cy.visit("http://localhost:3000/cart");
    cy.wait("@getCartWithItem");

    cy.contains("Finalizar Compra").click();
    cy.wait("@getAddressesWithData");
    cy.wait("@getCardsWithTwo");

    // ====== 💸 Aplicar cupom
    cy.contains(/aplicar cupom/i).click();
    cy.get('input[placeholder*="Digite o cupom"]').type("DESCONTO10");
    cy.contains("Validar").click();
    cy.wait("@validateCoupon");
    cy.contains("Cupom aplicado com sucesso").should("be.visible");

    // ====== 📦 Selecionar endereço e cartões
    cy.contains("Rua dos Testes")
      .closest(".flex.items-start.space-x-3")
      .find('button[role="radio"]')
      .click({ force: true });

    cy.contains("****1111").click({ force: true });
    cy.contains("****4444").click({ force: true });

    cy.contains("button", "Continuar").should("not.be.disabled").click();

    // ====== 🚚 Escolher frete
    cy.contains("Opções de Entrega", { timeout: 10000 }).should("be.visible");
    cy.get('button[role="radio"]').first().click({ force: true });
    cy.contains("button", /Continuar/i).click();

    // ====== 🎉 Finalizar compra
    cy.contains("Revisão do Pedido", { timeout: 10000 }).should("be.visible");
    cy.contains("Finalizar Compra").click();
    cy.wait("@checkout");
    cy.url().should("eq", "http://localhost:3000/");
  });
});

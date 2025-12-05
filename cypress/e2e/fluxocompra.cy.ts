// cypress/e2e/fluxocompra.cy.ts

describe("Fluxo completo de compra", () => {
  const clienteId = 1;
  const livroId = 12;
  const cartId = 123;
  const precoUnitario = 89.9;

  beforeEach(() => {
    cy.viewport(1280, 800);
    window.localStorage.setItem("bookstore_user", JSON.stringify({ id: clienteId, nome: "Felipe Lopes" }));

    // Mocks base (para home/carrinho)
    cy.intercept("GET", "**/livros", [{ id: livroId, titulo: "Harry Potter", preco: precoUnitario, estoque: 10 }]).as("listBooks");
    cy.intercept("GET", `**/carrinhos/cliente/*`, { id: cartId, itens: [], }).as("getCartEmpty");
    cy.intercept("POST", `**/carrinhos/*/itens`, { id: cartId, itens: [{ livroId, quantidade: 1, precoUnitario }], }).as("addItem");
    
    // Mocks de atualização
    cy.intercept("PUT", `**/carrinhos/${cartId}/itens`, (req) => {
      req.reply({ id: cartId, itens: [{ livroId, quantidade: 2, precoUnitario }], });
    }).as("updateItem");
    cy.intercept("DELETE", `**/carrinhos/${cartId}/itens/*`, { id: cartId, itens: [], }).as("removeItem");
    
    // Mocks de checkout
    cy.intercept("POST", "**/enderecos", { statusCode: 201, body: { id: 1 } }).as("createAddress");
    cy.intercept("POST", "**/cartoes", { statusCode: 201, body: { id: 1 } }).as("createCard");
    cy.intercept("POST", "**/pedidos/checkout", { statusCode: 200, body: { pedidoId: 999 } }).as("checkout");
  });

  // CENÁRIO 1: Fluxo completo (adicionar, atualizar, remover)
  it("deve adicionar um livro, alterar quantidade e remover item", () => {
    cy.visit("http://localhost:3000");
    cy.wait("@listBooks");
    cy.contains("Adicionar ao Carrinho").click();
    cy.wait("@addItem");

    // Mock GET do carrinho com 1 item
    cy.intercept("GET", `**/carrinhos/cliente/*`, { id: cartId, itens: [{ livroId, quantidade: 1, precoUnitario }], }).as("getCartWithItem");
    cy.visit("http://localhost:3000/cart");
    cy.wait("@getCartWithItem");

    // Atualiza quantidade
    cy.intercept("GET", `**/carrinhos/cliente/*`, { id: cartId, itens: [{ livroId, quantidade: 2, precoUnitario }], }).as("getCartAfterUpdate");
    cy.get('[data-testid="cart-item"]').within(() => {
      cy.get('[aria-label="Increment quantity"]').click();
    });

    cy.wait("@updateItem");
    cy.get('[data-testid="cart-item"] input[type="number"]').should("have.value", "2");

    // Remove item
    cy.intercept("GET", `**/carrinhos/cliente/*`, { id: cartId, itens: [], }).as("getCartEmptyAfterRemove");
    cy.get('[data-testid="cart-item"]').within(() => {
      cy.get('[aria-label="Remove item"]').click();
    });

    cy.wait("@removeItem");
    cy.contains("Seu carrinho está vazio").should("exist");
  });

  // CENÁRIO 3: Checkout completo
  it("deve realizar o checkout completo com sucesso (criação de endereço/cartão mockada)", () => {
    cy.intercept("GET", `**/carrinhos/cliente/${clienteId}`, { statusCode: 200, body: { id: cartId, clienteId, itens: [{ livroId, quantidade: 1, precoUnitario }], }, }).as("getCartWithItem");
    cy.intercept("GET", `**/clientes/${clienteId}/enderecos`, { statusCode: 200, body: [], }).as("getAddressesEmpty");
    cy.intercept("GET", `**/clientes/${clienteId}/cartoes`, { statusCode: 200, body: [], }).as("getCardsEmpty");

    cy.visit("http://localhost:3000/cart");
    cy.wait("@getCartWithItem");

   // Clica em "Finalizar Compra"
    cy.contains("Finalizar Compra", { timeout: 10000 }).click();
    cy.wait("@getAddressesEmpty");
    cy.wait("@getCardsEmpty");

    // 🏠 PASSO 1: Adiciona endereço
    cy.contains("Adicionar Novo Endereço").click();
    cy.get("#cep").type("12345-678");
    cy.get("#logradouro").type("Rua dos Testes");
    cy.get("#numero").type("100");
    cy.get("#bairro").type("Centro");
    cy.get("#cidade").type("São Paulo");

    // ✅ ATUALIZA o mock ANTES de salvar para pegar as próximas requisições
    cy.intercept("GET", `**/clientes/${clienteId}/enderecos`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          tipoEndereco: "ENTREGA",
          logradouro: "Rua dos Testes",
          numero: "100",
          cidade: "São Paulo",
          estado: "SP",
          pais: "Brasil",
          cep: "12345-678",
        },
      ],
    }).as("getAddressesWithData");
    cy.contains("Salvar Endereço").click();
    cy.wait("@createAddress");
    
    // PASSO 2: Adiciona cartão (simulando a submissão do formulário)
    cy.contains("Adicionar Novo Cartão").click();
    cy.get("#numero").type("4111111111111111");
    cy.get("#nomeTitular").type("FELIPE TESTE");
    cy.get("#validade").type("1228");
    cy.get("#cvv").type("123");

    // ✅ ATUALIZA o mock ANTES de salvar
    cy.intercept("GET", `**/clientes/${clienteId}/cartoes`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          numeroCartao: "4111111111111111",
          numero: "****1111",
          nomeTitular: "FELIPE TESTE",
          validade: "12/28",
          bandeira: "VISA",
        },
      ],
    }).as("getCardsWithData");
    cy.contains("Salvar Cartão").click();
    cy.wait("@createCard");

    // Aguarda voltar para a tela de seleção
    cy.contains("Adicionar Novo Endereço", { timeout: 10000 }).should(
      "be.visible"
    );

    // 🎯 PASSO 3: Seleciona endereço e cartão na tela de seleção
    // Aguarda os dados carregarem - verifica que voltou para a tela de seleção
    cy.contains("Rua dos Testes", { timeout: 10000 }).should("be.visible");

    // Aguarda um momento para garantir que a UI está pronta
    cy.wait(1000);

    // Seleciona o primeiro endereço
    // Encontra o container do endereço e clica no RadioGroupItem dentro dele
    cy.contains("Rua dos Testes")
      .closest(".flex.items-start.space-x-3") // Container do item de endereço
      .find('button[role="radio"]') // RadioGroupItem é renderizado como button
      .click({ force: true });

    // Seleciona o primeiro cartão
   
    cy.get('[data-cy="cartao-1"]').click() // Container do item de cartão
      

    // Aguarda o botão "Continuar" estar habilitado
    cy.contains("button", "Continuar").should("not.be.disabled", {
      timeout: 10000,
    });

    // ✅ Clica em "Continuar" para ir para a etapa de frete
    cy.contains("button", "Continuar").click();

    // 🚚 PASSO 4: Seleciona uma opção de frete (já vem mockada pelo freteService)
    // Aguarda as opções de frete carregarem
    

    // Aguarda um pouco para garantir que as opções renderizaram
    cy.wait(1000);

    // Aguarda um momento para a seleção ser processada
    cy.wait(500);

    cy.get('[data-cy="finalizar"]').click()
    // Verifica se foi redirecionado para a home
    cy.url().should("eq", "http://localhost:3000/");
  });
});
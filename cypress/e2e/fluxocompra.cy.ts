// cypress/e2e/fluxocompra.cy.ts
describe("Fluxo completo de compra", () => {
  const clienteId = 1;
  const livroId = 12;
  const cartId = 123;

  beforeEach(() => {
    cy.viewport(1280, 800);

    // Mock login: usuário logado
    window.localStorage.setItem(
      "bookstore_user",
      JSON.stringify({ id: clienteId, nome: "Felipe Lopes" })
    );

    // Mock da listagem de livros
    cy.intercept("GET", "**/livros", [
      {
        id: livroId,
        titulo: "Harry Potter e a Pedra Filosofal",
        preco: 89.9,
        estoque: 10,
        imagemUrl: "/placeholder.svg",
      },
    ]).as("listBooks");

    // Mock GET inicial do carrinho (vazio)
    cy.intercept("GET", `**/carrinhos/cliente/*`, {
      id: cartId,
      itens: [],
    }).as("getCartEmpty");

    // Mock POST ao adicionar item ao carrinho
    cy.intercept("POST", `**/carrinhos/*/itens`, {
      id: cartId,
      itens: [{ livroId, quantidade: 1, precoUnitario: 89.9 }],
    }).as("addItem");

    // Mock PUT de atualização de quantidade
    cy.intercept("PUT", `**/carrinhos/${cartId}/itens`, (req) => {
      req.reply({
        id: cartId,
        itens: [{ livroId, quantidade: 2, precoUnitario: 89.9 }],
      });
    }).as("updateItem");

    // Mock DELETE do item do carrinho
    cy.intercept("DELETE", `**/carrinhos/${cartId}/itens/*`, {
      id: cartId,
      itens: [],
    }).as("removeItem");
  });

  // =======================================================
  // 💥 CENÁRIO 1: Fluxo completo (adicionar, atualizar, remover)
  // =======================================================
  it("deve adicionar um livro, alterar quantidade e remover item", () => {
    cy.visit("http://localhost:3000");
    cy.wait("@listBooks");

    cy.contains("Harry Potter e a Pedra Filosofal").should("be.visible");
    cy.contains("Adicionar ao Carrinho").click();
    cy.wait("@addItem");

    // Mock GET do carrinho atualizado com 1 item
    cy.intercept("GET", `**/carrinhos/cliente/*`, {
      id: cartId,
      itens: [{ livroId, quantidade: 1, precoUnitario: 89.9 }],
    }).as("getCartWithItem");

    cy.visit("http://localhost:3000/cart");
    cy.wait("@getCartWithItem");

    // Atualiza quantidade
    cy.intercept("GET", `**/carrinhos/cliente/*`, {
      id: cartId,
      itens: [{ livroId, quantidade: 2, precoUnitario: 89.9 }],
    }).as("getCartAfterUpdate");

    cy.get('[data-testid="cart-item"]').within(() => {
      cy.get('[aria-label="Increment quantity"]').click();
    });

    cy.wait("@updateItem");
    cy.wait("@getCartAfterUpdate");

    // Verifica quantidade
    cy.get('[data-testid="cart-item"] input[type="number"]').should(
      "have.value",
      "2"
    );

    // Remove item
    cy.intercept("GET", `**/carrinhos/cliente/*`, {
      id: cartId,
      itens: [],
    }).as("getCartEmptyAfterRemove");

    cy.get('[data-testid="cart-item"]').within(() => {
      cy.get('[aria-label="Remove item"]').click();
    });

    cy.wait("@removeItem");
    cy.wait("@getCartEmptyAfterRemove");

    cy.contains("Seu carrinho está vazio").should("exist");
  });

  // =======================================================
  // 💥 CENÁRIO 2: Erro ao adicionar item (400)
  // =======================================================
  it("deve exibir erro ao tentar adicionar item com falha na API", () => {
    cy.visit("http://localhost:3000");
    cy.wait("@listBooks");

    // Intercept para simular erro 400 ao adicionar item
    cy.intercept("POST", "**/carrinhos/*/itens", {
      statusCode: 400,
      body: { message: "Erro ao adicionar item." },
    }).as("addItemFail");

    // Clica no botão de adicionar
    cy.contains("Adicionar ao Carrinho").click();
    cy.wait("@addItemFail");
  });

// =======================================================
// 💳 CENÁRIO 3: Checkout completo (sucesso)
// =======================================================
it("deve realizar o checkout completo com sucesso", () => {
  const clienteId = 1;
  const livroId = 12;

  // Mock do usuário logado
  cy.window().then((win) => {
    win.localStorage.setItem(
      "bookstore_user",
      JSON.stringify({ id: clienteId, nome: "Felipe Lopes" })
    );
  });

  // Intercept GET categorias
  cy.intercept("GET", "**/categorias", {
    statusCode: 200,
    body: [
      { id: 1, nome: "Ficção" },
      { id: 2, nome: "Romance" },
    ],
  }).as("getCategories");

  // Intercept GET livros
  cy.intercept("GET", "**/livros**", {
    statusCode: 200,
    body: [
      {
        id: livroId,
        titulo: "Harry Potter e a Pedra Filosofal",
        preco: 89.9,
        estoque: 10,
        imagem_url: "/placeholder.svg",
        autor: "J.K. Rowling",
        categoria_id: 1,
        editora: "Rocco",
      },
    ],
  }).as("listBooks");

  // Intercept GET carrinho vazio
  cy.intercept("GET", `**/carrinhos/cliente/${clienteId}*`, {
    statusCode: 200,
    body: {
      id: 123,
      clienteId: clienteId,
      itens: [],
    },
  }).as("getCartEmpty");

  // Intercept POST adicionar item
  cy.intercept("POST", "**/carrinhos/*/itens", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        id: 123,
        clienteId: clienteId,
        itens: [
          {
            livroId: livroId,
            quantidade: req.body.quantidade || 1,
            precoUnitario: 89.9,
            titulo: "Harry Potter e a Pedra Filosofal",
            autor: "J.K. Rowling",
            imagemUrl: "/placeholder.svg",
            editora: "Rocco",
          },
        ],
      },
    });
  }).as("addItem");

  // Intercept GET livro individual
  cy.intercept("GET", `**/livros/${livroId}`, {
    statusCode: 200,
    body: {
      id: livroId,
      titulo: "Harry Potter e a Pedra Filosofal",
      preco: 89.9,
      estoque: 10,
      imagem_url: "/placeholder.svg",
      autor: "J.K. Rowling",
      editora: "Rocco",
    },
  }).as("getBook");

  // Intercept GET carrinho com itens
  cy.intercept("GET", `**/carrinhos/cliente/${clienteId}*`, {
    statusCode: 200,
    body: {
      id: 123,
      clienteId: clienteId,
      itens: [
        {
          livroId: livroId,
          quantidade: 1,
          precoUnitario: 89.9,
          titulo: "Harry Potter e a Pedra Filosofal",
          autor: "J.K. Rowling",
          imagemUrl: "/placeholder.svg",
          editora: "Rocco",
        },
      ],
    },
  }).as("getCartWithItem");

  // Intercept GET endereços vazio
  cy.intercept("GET", `**/clientes/${clienteId}/enderecos*`, {
    statusCode: 200,
    body: [],
  }).as("getAddressesEmpty");

  // Intercept POST criar endereço
  cy.intercept("POST", "**/enderecos", (req) => {
    req.reply({
      statusCode: 201,
      body: {
        id: 1,
        ...req.body,
        clienteId: clienteId,
      },
    });
  }).as("createAddress");

  // Intercept GET endereços após criar
  cy.intercept("GET", `**/clientes/${clienteId}/enderecos*`, {
    statusCode: 200,
    body: [
      {
        id: 1,
        tipoEndereco: "ENTREGA",
        tipoResidencia: "CASA",
        tipoLogradouro: "RUA",
        logradouro: "Rua dos Testes",
        numero: "100",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        cep: "12345-678",
        pais: "Brasil",
        clienteId: clienteId,
        principal: true,
      },
    ],
  }).as("getAddresses");

  // Intercept GET cartões vazio
  cy.intercept("GET", `**/clientes/${clienteId}/cartoes*`, {
    statusCode: 200,
    body: [],
  }).as("getCardsEmpty");

  // Intercept POST criar cartão
  cy.intercept("POST", "**/cartoes", (req) => {
    req.reply({
      statusCode: 201,
      body: {
        id: 1,
        numero: `****${req.body.numeroCartao.slice(-4)}`,
        nomeTitular: req.body.nomeImpresso,
        validade: req.body.validade,
        bandeira: req.body.bandeira,
        clienteId: clienteId,
      },
    });
  }).as("createCard");

  // Intercept GET cartões após criar
  cy.intercept("GET", `**/clientes/${clienteId}/cartoes*`, {
    statusCode: 200,
    body: [
      {
        id: 1,
        numero: "****1111",
        nomeTitular: "FELIPE TESTE",
        validade: "12/28",
        bandeira: "VISA",
        clienteId: clienteId,
      },
    ],
  }).as("getCards");

  // Intercept GET fretes
  cy.intercept("GET", "**/fretes*", {
    statusCode: 200,
    body: [
      {
        id: "1",
        name: "Frete Rápido",
        description: "Entrega em 5 dias úteis",
        estimatedDays: "5 dias úteis",
        price: 15.0,
      },
      {
        id: "2",
        name: "Frete Grátis",
        description: "Entrega em 15 dias úteis",
        estimatedDays: "15 dias úteis",
        price: 0,
      },
    ],
  }).as("getShipping");

  // Intercept POST checkout
  cy.intercept("POST", "**/pedidos/checkout", {
    statusCode: 200,
    body: { pedidoId: 999 },
  }).as("checkout");

  // Visita a página
  cy.visit("http://localhost:3000");
  cy.wait("@listBooks");
  cy.wait("@getCartEmpty");

  // ✅ SELETOR SIMPLIFICADO - Clica no primeiro botão "Adicionar ao Carrinho"
  cy.contains("button", "Adicionar ao Carrinho")
    .first()
    .should("be.visible")
    .click();

  cy.wait("@addItem", { timeout: 10000 });
  cy.contains("Produto adicionado", { timeout: 5000 }).should("be.visible");

  // Vai para o carrinho
  cy.visit("http://localhost:3000/cart");
  cy.wait("@getCartWithItem");
  cy.wait("@getBook");

  cy.contains("Harry Potter e a Pedra Filosofal").should("be.visible");

  // Finaliza compra
  cy.contains("button", "Finalizar Compra").click();
  cy.url().should("include", "/checkout");
  cy.wait("@getAddressesEmpty");
  cy.wait("@getCardsEmpty");

  // Adiciona endereço
  cy.contains("button", "Adicionar Novo Endereço").click();
  cy.get("#cep", { timeout: 5000 }).should("be.visible").type("12345-678");
  cy.get("#logradouro").type("Rua dos Testes");
  cy.get("#numero").type("100");
  cy.get("#bairro").type("Centro");
  cy.get("#cidade").type("São Paulo");
  
  // Seleciona estado
  cy.get("label").contains("Estado").parent().find("button").click();
  cy.contains('[role="option"]', "São Paulo").click();

  cy.contains("button", "Salvar Endereço").click();
  cy.wait("@createAddress");
  cy.wait("@getAddresses");
  cy.contains("Endereço salvo com sucesso!", { timeout: 5000 }).should("exist");

  // Adiciona cartão
  cy.contains("button", "Adicionar Novo Cartão").click();
  cy.get("#numero", { timeout: 5000 }).should("be.visible").clear().type("4111111111111111");
  cy.get("#nomeTitular").type("FELIPE TESTE");
  cy.get("#validade").type("1228");
  
  // Seleciona bandeira
  cy.get("label").contains("Bandeira Cartão").parent().find("button").click();
  cy.contains('[role="option"]', "VISA").click();
  
  cy.get("#cvv").type("123");

  cy.contains("button", "Salvar Cartão").click();
  cy.wait("@createCard");
  cy.wait("@getCards");
  cy.contains("Cartão salvo com sucesso!", { timeout: 5000 }).should("exist");

  // Seleciona endereço e cartão
  cy.get('input[type="radio"]').first().check({ force: true });
  cy.get('input[type="radio"]').eq(1).check({ force: true });
  cy.contains("button", "Continuar").click();

  // Seleciona frete
  cy.wait("@getShipping");
  
  // Clica no radio button do frete
  cy.contains("Frete Rápido")
    .parent()
    .find('input[type="radio"]')
    .check({ force: true });
  
  cy.contains("button", "Continuar para Revisão").click();

  // Finaliza compra
  cy.contains("Revisão do Pedido").should("be.visible");
  cy.contains("button", "Finalizar Compra").click();
  cy.wait("@checkout");

  cy.contains("Pedido finalizado com sucesso!", { timeout: 5000 }).should("exist");
});
  
});

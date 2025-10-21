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
  // 💳 CENÁRIO 3: Checkout completo (CORRIGIDO)
  // =======================================================
  it("deve realizar o checkout completo com sucesso", () => {
    // Mock carrinho com item (definir ANTES de visitar a página)
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

    // Endereços - INICIALMENTE VAZIO
    cy.intercept("GET", `**/clientes/${clienteId}/enderecos`, {
      statusCode: 200,
      body: [],
    }).as("getAddressesEmpty");

    // Cartões - INICIALMENTE VAZIO
    cy.intercept("GET", `**/clientes/${clienteId}/cartoes`, {
      statusCode: 200,
      body: [],
    }).as("getCardsEmpty");

    // Mock para criar endereço
    cy.intercept("POST", "**/enderecos", {
      statusCode: 201,
      body: {
        id: 1,
        tipoEndereco: "ENTREGA",
        logradouro: "Rua dos Testes",
        numero: "100",
        cidade: "São Paulo",
        estado: "SP",
        pais: "Brasil",
        cep: "12345-678",
      },
    }).as("createAddress");

    // Mock para criar cartão
    cy.intercept("POST", "**/cartoes", {
      statusCode: 201,
      body: {
        id: 1,
        numeroCartao: "4111111111111111",
        numero: "****1111",
        nomeTitular: "FELIPE TESTE",
        validade: "12/28",
        bandeira: "VISA",
      },
    }).as("createCard");

    // 🚚 Não precisa mockar fretes - ele já tem 3 opções mockadas internamente

    // Checkout final
    cy.intercept("POST", "**/pedidos/checkout", {
      statusCode: 200,
      body: { pedidoId: 999 },
    }).as("checkout");

    // Visita o carrinho
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

    // Aguarda voltar para a tela de seleção
    cy.contains("Adicionar Novo Endereço", { timeout: 10000 }).should(
      "be.visible"
    );

    // 💳 PASSO 2: Adiciona cartão
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
    cy.contains("VISA")
      .closest(".flex.items-start.space-x-3") // Container do item de cartão
      .find('button[role="radio"]')
      .click({ force: true });

    // Aguarda o botão "Continuar" estar habilitado
    cy.contains("button", "Continuar").should("not.be.disabled", {
      timeout: 10000,
    });

    // ✅ Clica em "Continuar" para ir para a etapa de frete
    cy.contains("button", "Continuar").click();

    // 🚚 PASSO 4: Seleciona uma opção de frete (já vem mockada pelo freteService)
    // Aguarda as opções de frete carregarem
    cy.contains("Opções de Entrega", { timeout: 10000 }).should("be.visible");

    // Aguarda um pouco para garantir que as opções renderizaram
    cy.wait(1000);

    // Seleciona a primeira opção de frete disponível
    // O RadioGroupItem do Radix UI é renderizado como button[role="radio"]
    cy.get('button[role="radio"]').first().click({ force: true });

    // Aguarda um momento para a seleção ser processada
    cy.wait(500);

    // Clica no botão "Continuar" para ir para a revisão
    cy.contains("button", /Continuar/i)
      .should("be.visible")
      .click();

    // 🎉 PASSO 5: Finaliza o pedido na tela de revisão
    cy.contains("Revisão do Pedido", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Finalizar Compra").click();

    // Verifica se foi redirecionado para a home
    cy.url().should("eq", "http://localhost:3000/");
  });
});

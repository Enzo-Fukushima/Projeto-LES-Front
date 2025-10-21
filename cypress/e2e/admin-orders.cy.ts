describe("Fluxo completo: Home → Admin → Pedidos (localhost)", () => {
  const adminUser = { id: 1, nome: "Admin Teste", role: "ADMIN" };

  beforeEach(() => {
    cy.viewport(1280, 800);
    window.localStorage.setItem("bookstore_user", JSON.stringify(adminUser));

    // Mock da API de pedidos
    cy.intercept("GET", "http://localhost:8080/api/pedidos", {
      fixture: "pedidos.json",
    }).as("getPedidos");

    // Mock da atualização de status
    cy.intercept(
      "PATCH",
      "http://localhost:8080/api/pedidos/*/status",
      (req) => {
        req.reply({
          statusCode: 200,
          body: { ...req.body, status: req.body.status },
        });
      }
    ).as("updateStatus");

    // Inicia o fluxo de navegação até a tela de pedidos
    cy.visit("http://localhost:3000/");
    cy.get("main, header, h1, h2, button").should("exist");

    // Painel Admin
    cy.contains(/admin/i, { matchCase: false }).should("exist").click();
    cy.url().should("include", "/admin");

    // Aba de pedidos
    cy.contains(/pedidos/i, { matchCase: false })
      .should("exist")
      .click();
    cy.url().should("include", "/admin/orders");

    cy.wait("@getPedidos");
  });

  it("deve exibir a lista de pedidos corretamente", () => {
    cy.get("h2").should("contain.text", "Pedidos");
    cy.get("table").should("exist");
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("deve filtrar pedidos por status", () => {
    cy.get("button[role='combobox']").first().click({ force: true });
    cy.get("[role='option']")
      .contains(/Processando/i)
      .click({ force: true });

    cy.get("tbody tr").each(($row) => {
      cy.wrap($row).contains(/processando/i);
    });
  });

  it("deve buscar pedidos pelo nome do cliente", () => {
    cy.get("input[placeholder*='Buscar']").type("João", { delay: 50 });
    cy.get("tbody tr").should("have.length", 1);
    cy.contains(/Cliente: João/i).should("exist");
  });

  it("deve alterar o status de um pedido para 'Enviado'", () => {
    // Abre o select do primeiro pedido
    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("button[role='combobox']").click({ force: true });
      });

    // Seleciona "Enviado"
    cy.get("[role='option']")
      .contains(/Enviado/i)
      .click({ force: true });

    // Aguarda o PATCH do status
    cy.wait("@updateStatus").its("response.statusCode").should("eq", 200);

    // Verifica visualmente na tabela
    cy.get("tbody tr")
      .first()
      .contains(/Enviado/i)
      .should("exist");
  });

  it("deve exibir mensagem quando não houver pedidos", () => {
    cy.intercept("GET", "http://localhost:8080/api/pedidos", []).as(
      "getEmptyPedidos"
    );

    cy.visit("http://localhost:3000/");
    cy.contains(/admin/i).click();
    cy.contains(/pedidos/i).click();

    cy.wait("@getEmptyPedidos");
    cy.contains(/nenhum pedido encontrado/i).should("exist");
  });
});

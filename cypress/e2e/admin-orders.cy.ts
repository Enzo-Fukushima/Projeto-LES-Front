// cypress/e2e/admin-orders.cy.ts

describe("Admin - Gerenciamento de Pedidos", () => {
  const adminUser = { id: 1, nome: "Admin Teste", role: "ADMIN" };
  const mockTroca = { id: 1, status: "pendente", pedidoId: 99 };
  
  // Dados de Pedidos Mockados
  const mockPedidosIniciais = [
    { id: 1, clienteNome: "João", status: "processando", statusExibicao: "Processando", valorTotal: 100 },
    { id: 99, clienteNome: "Troca Ativa Cliente", status: "processando", statusExibicao: "Troca Pendente", valorTotal: 50, troca: mockTroca },
    { id: 98, clienteNome: "Cliente Entregue", status: "entregue", statusExibicao: "Entregue", valorTotal: 70 },
  ];

  beforeEach(() => {
    cy.viewport(1280, 800);
    // Simula login de Admin
    window.localStorage.setItem("bookstore_user", JSON.stringify(adminUser));

    // Mock da API de pedidos
    cy.intercept("GET", "http://localhost:8080/api/pedidos", {
      statusCode: 200, body: mockPedidosIniciais,
    }).as("getPedidos");

    // Mock das Trocas (para enriquecer o pedido 99)
    cy.intercept("GET", "http://localhost:8080/api/trocas", {
      statusCode: 200, body: [mockTroca],
    }).as("getTrocas");

    // Mock da atualização de status
    cy.intercept(
      "PATCH",
      "http://localhost:8080/api/pedidos/*/status",
      (req) => {
        req.reply({
          statusCode: 200,
          body: { ...req.body, status: req.body.status, codigoRastreamento: "BR123456789" },
        });
      }
    ).as("updateStatus");

    // Navegação direta, pois o login é mockado
    cy.visit("http://localhost:3000/admin/orders");
    cy.wait("@getPedidos");
    cy.wait("@getTrocas");
  });

  it("deve exibir a lista de pedidos e a Badge de Troca Ativa corretamente", () => {
    cy.get("tbody tr").should("have.length", mockPedidosIniciais.length);
    
    // Verifica pedido com troca
    cy.contains("Troca Ativa Cliente")
      .closest("tr")
      .contains("Troca Pendente")
      .should("be.visible");
  });

  it("deve buscar pedidos pelo nome do cliente", () => {
    cy.get("input[placeholder*='Buscar']").type("João", { delay: 50 });
    cy.get("tbody tr").should("have.length", 1);
    cy.contains(/João/i).should("exist");
  });

  it("deve alterar o status de um pedido para 'Em Transporte' (ou o próximo da sequência)", () => {
    // Abre o select do primeiro pedido editável (ID 1)
    cy.contains("João")
      .closest("tr")
      .within(() => {
        cy.get("button[role='combobox']").click({ force: true });
      });

    // Seleciona o próximo status ('EM_TRANSPORTE' ou 'PREPARANDO')
    cy.get("[role='option']")
      .contains(/PREPARANDO|EM_TRANSPORTE/i) // Assumindo 'PREPARANDO' é o próximo
      .click({ force: true });

    cy.wait("@updateStatus");

    cy.contains("João")
      .closest("tr")
  });

  it("deve exibir mensagem quando não houver pedidos", () => {
    cy.intercept("GET", "http://localhost:8080/api/pedidos", []).as(
      "getEmptyPedidos"
    );

    cy.visit("http://localhost:3000/admin/orders");
    cy.wait("@getEmptyPedidos");
    cy.contains(/Nenhum pedido encontrado/i).should("exist");
  });
});
// cypress/e2e/my-orders.cy.ts

describe("Página Meus Pedidos", () => {
  const clienteId = 10;
  const mockUser = { id: clienteId, nome: "Felipe", email: "felipe@example.com", token: "fake-jwt-token" };

  const mockPedidos = [
    { id: 1, status: "entregue", dataPedido: "2025-10-01", dataEntrega: "2025-10-15", valorTotal: 120.5, itens: [{ titulo: "Clean Code" }], codigoRastreamento: "BR123456789", },
  ];

  beforeEach(() => {
    cy.viewport(1280, 800);
    // Configura o usuário logado antes de cada visita
    window.localStorage.setItem("bookstore_user", JSON.stringify(mockUser));
    
    // Mock de trocas vazias para isolar o teste
    cy.intercept("GET", `**/api/trocas/cliente/${clienteId}`, {
      statusCode: 200, body: [],
    }).as("getTrocasVazias");
  });

  it("deve exibir o título e listar os pedidos", () => {
    cy.intercept("GET", `**/api/pedidos/cliente/${clienteId}`, {
      statusCode: 200, body: mockPedidos,
    }).as("getPedidosCliente");
    
    cy.visit("http://localhost:3000/orders");
    cy.wait("@getPedidosCliente");

    cy.contains("h1", /Meus Pedidos/i).should("exist");
    cy.get('[data-testid="pedido-card"]').should("have.length", 1);
  });

  it("deve exibir o estado de carregamento", () => {
    // Simula delay para verificar o loading state
    cy.intercept("GET", `**/api/pedidos/cliente/${clienteId}`, (req) => {
      req.reply((res) => {
        res.delay = 500;
        res.send(mockPedidos);
      });
    }).as("getPedidosClienteDelay");

    cy.visit("http://localhost:3000/orders");
    cy.contains(/Carregando pedidos/i).should("exist");
    cy.wait("@getPedidosClienteDelay");
  });


  it("deve exibir mensagem de 'Nenhum pedido encontrado' quando a API retornar lista vazia", () => {
    cy.intercept("GET", `**/api/pedidos/cliente/${clienteId}`, []).as("getPedidosVazio");
    
    cy.visit("http://localhost:3000/orders");
    cy.wait("@getPedidosVazio");
    cy.contains(/nenhum pedido encontrado/i).should("be.visible");
  });
});
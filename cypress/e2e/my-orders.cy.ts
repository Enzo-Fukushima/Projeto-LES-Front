describe("Página Meus Pedidos", () => {
  const mockUser = {
    id: 10,
    nome: "Felipe",
    email: "felipe@teste.com",
    token: "fake-token",
  };

  const mockPedidos = [
    {
      id: 1,
      status: "entregue",
      dataPedido: "2025-10-01",
      dataEntrega: "2025-10-15",
      valorTotal: 120.5,
      valorFrete: 10,
      itens: [
        {
          livroId: 101,
          titulo: "Clean Code",
          quantidade: 1,
          precoUnitario: 110.5,
          subtotal: 110.5,
        },
      ],
      codigoRastreamento: "BR123456789",
    },
  ];

  beforeEach(() => {
    const mockUser = {
      id: 10,
      nome: "Felipe",
      email: "felipe@example.com",
      token: "fake-jwt-token",
    };

    cy.viewport(1280, 800);

    cy.intercept("GET", "**/api/pedidos/cliente/10", {
      statusCode: 200,
      body: mockPedidos,
    }).as("getPedidosCliente");

    cy.visit("http://localhost:3000/orders", {
      onBeforeLoad(win) {
        win.localStorage.setItem("bookstore_user", JSON.stringify(mockUser));
      },
    });
  });

  it("deve exibir o título e cabeçalho corretamente", () => {
    cy.contains("h1", /Meus Pedidos/i).should("exist");
    cy.contains(/Acompanhe o status dos seus pedidos/i).should("exist");
  });

  it("deve exibir o estado de carregamento e depois listar os pedidos", () => {
    cy.intercept("GET", "**/api/pedidos/cliente/10", (req) => {
      req.reply((res) => {
        res.delay = 500;
        res.send(mockPedidos);
      });
    }).as("getPedidosClienteDelay");

    cy.visit("http://localhost:3000/orders");
    cy.contains(/Carregando pedidos/i).should("exist");
    cy.wait("@getPedidosClienteDelay");
    cy.get('[data-testid="pedido-card"]').should("have.length", 1);
  });

  it("deve exibir o status e informações básicas de um pedido", () => {
    cy.wait("@getPedidosCliente");
    cy.get('[data-testid="pedido-card"]')
      .first()
      .within(() => {
        cy.contains(/Pedido/i).should("exist");
        cy.contains(/Total:/i).should("exist");
        cy.contains(/Entregue/i).should("exist");
      });
  });

  it("deve permitir solicitar troca se o pedido for entregue há menos de 30 dias", () => {
    cy.wait("@getPedidosCliente");
    cy.get('[data-testid="pedido-card"]')
      .first()
      .within(() => {
        cy.contains(/Solicitar Troca/i).should("exist");
      });
  });

  // cypress/e2e/my-orders-empty.cy.ts

  describe("Página de pedidos vazia", () => {
    beforeEach(() => {
      cy.viewport(1280, 800);

      // Ignorar ChunkLoadError do Next.js
      Cypress.on("uncaught:exception", (err) => {
        if (err.message.includes("ChunkLoadError")) return false;
      });

      const mockUser = {
        id: 10,
        nome: "Felipe",
        email: "felipe@example.com",
        token: "fake-jwt-token",
      };

      window.localStorage.setItem("bookstore_user", JSON.stringify(mockUser));

      cy.intercept("GET", "**/pedidos/cliente/10", []).as("getPedidosVazio");
      cy.intercept("GET", "**/carrinhos/cliente/10", { items: [] });

      cy.visit("http://localhost:3000/orders");
    });

    it("deve exibir mensagem de 'Nenhum pedido encontrado' quando a API retornar lista vazia", () => {
      cy.wait("@getPedidosVazio");
      cy.contains(/nenhum pedido encontrado/i).should("be.visible");
    });
  });
});

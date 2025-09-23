// cypress/e2e/clientes.cy.ts
describe("Clientes - Inativar/Ativar", () => {
  it("deve inativar e ativar um cliente com sucesso", () => {
    // Mock da listagem inicial
    cy.visit("http://localhost:3000/admin/customers");
    cy.intercept("GET", "**/clientes", [
      {
        id: 1,
        nome: "Felipe Lopes",
        email: "felipe@email.com",
        telefone: "(11) 99999-9999",
        ativo: true,
      },
    ]).as("listClientes");

    // Mock da requisição de inativar
    cy.intercept("PUT", "**/clientes/1/inativar", { statusCode: 200 }).as(
      "inativarCliente"
    );

    // Mock da requisição de ativar
    cy.intercept("PUT", "**/clientes/1/ativar", { statusCode: 200 }).as(
      "ativarCliente"
    );

    cy.wait("@listClientes");

    // Abrir menu de ações
    cy.contains("button", "Abrir menu").click(); // ou [aria-label="Abrir menu"]

    // Clicar em "Desativar"
    cy.contains("Desativar").click();
    cy.wait("@inativarCliente");

    // Verifica se o status mudou para Inativo
    cy.contains("Inativo").should("exist");

    // Reabrir menu de ações
    cy.contains("button", "Abrir menu").click();

    cy.contains("button", "Abrir menu").click();

    // Clicar em "Ativar"
    cy.contains("Ativar").click();
    cy.wait("@ativarCliente");

    // Verifica se voltou para Ativo
    cy.contains("Ativo").should("exist");
  });
});

describe("Clientes - Editar", () => {
  it("deve editar os dados de um cliente com sucesso", () => {
    // Mock para buscar cliente
    cy.intercept("GET", "**/clientes/1", {
      id: 1,
      nome: "Felipe Lopes",
      email: "felipe@email.com",
      cpf: "12345678900",
      ddd: "11",
      numeroTelefone: "999999999",
      ativo: true,
      tipoTelefone: "CELULAR",
      ranking: 10,
    }).as("getCliente");

    // Mock da atualização
    cy.intercept("PUT", "**/clientes/1", { statusCode: 200 }).as(
      "updateCliente"
    );

    cy.visit("http://localhost:3000/admin/customers/1/edit");

    cy.wait("@getCliente");

    // Alterar nome
    cy.get("#nome").clear().type("Felipe Testado");

    // Alterar email
    cy.get("#email").clear().type("novo@email.com");

    // Alterar telefone
    cy.get("#numeroTelefone").clear().type("988887777");

    cy.intercept("GET", "**/clientes", [
      {
        id: 1,
        nome: "Felipe Lopes",
        email: "felipe@email.com",
        telefone: "(11) 99999-9999",
        ativo: true,
      },
    ]).as("listClientes");

    // Salvar
    cy.contains("Salvar Alterações").click();

    cy.wait("@updateCliente")
      .its("request.body")
      .should((body) => {
        expect(body.nome).to.eq("Felipe Testado");
        expect(body.email).to.eq("novo@email.com");
        expect(body.numeroTelefone).to.eq("988887777");
      });
  });
});

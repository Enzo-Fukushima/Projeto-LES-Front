describe("template spec", () => {
  it("passes", () => {
    // Visita a página inicial
    cy.visit("http://localhost:3000");

    // Seleciona o botão de login pelo texto visível "Entrar"
    cy.contains("a", "Entrar").should("exist").click();

    // Preenche o login
    cy.get("#email").type("MarieC@gmail.com");
    cy.get("#password").type("Ab@12345");

    // Clica no botão de login pelo Tailwind escapado
    cy.get("button.bg-primary").should("exist").click();

    // Espera a página carregar os itens (use timeout se necessário)
    //cy.get("[data-cy=add-to-cart-16]").click();
    cy.get("[data-cy=carrinho]").should("exist").click();
    cy.get("[data-cy=finalizar]").should("exist").click();
    cy.get("#address-3").click();
    cy.get('[data-cy="cartao-8"]').click();
    cy.get('[data-cy="cartao-9"]').click();
    cy.get("#amount-8").clear().type("44.95");
    cy.get("#amount-9").type("44.95");
    cy.get('[data-cy="continuar"]').click();
  });
});

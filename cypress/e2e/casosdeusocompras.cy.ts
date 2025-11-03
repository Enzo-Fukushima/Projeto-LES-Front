describe("Fluxo completo de compra com cupons e múltiplos cartões", () => {
  it("Fluxo de compras 2 cartões 1 cupom de 10%", () => {
    // Visita a página inicial
    cy.visit("http://localhost:3000");

    // Seleciona o botão de login pelo texto visível "Entrar"
    cy.contains("a", "Entrar").should("exist").click();

    // Preenche o login
    cy.get("#email").type("joaoP@email.com");
    cy.get("#password").type("Ab@12345");

    // Clica no botão de login pelo Tailwind escapado
    cy.get("button.bg-primary").should("exist").click();

    // Espera a página carregar os itens (use timeout se necessário)
    //cy.get("[data-cy=add-to-cart-16]").click();
    cy.get("[data-cy=carrinho]").should("exist").click();
    cy.get("[data-cy=finalizar]").should("exist").click();
    cy.get("#address-1").click();
    cy.get('[data-cy="cartao-5"]').click();
    cy.get('[data-cy="cartao-6"]').click();
    cy.get("#amount-5").clear().type("49.95");
    cy.get("#amount-6").type("49.95");
    cy.get('[data-cy="continuar"]').click();
    cy.get('[data-cy="inputCupom"]').type("CUPOM1");
    cy.get('[data-cy="aplicar"]').click();
    cy.get('[data-cy="finalizar"]').click();
  });
});

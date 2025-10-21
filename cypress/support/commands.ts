Cypress.Commands.add("mockLogin", () => {
  // Simula usuário logado no localStorage
  cy.window().then((win) => {
    win.localStorage.setItem(
      "bookstore_user",
      JSON.stringify({ id: 1, nome: "Felipe Lopes" })
    );
  });
});

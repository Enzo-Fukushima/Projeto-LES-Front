describe("template spec", () => {
  // it("passes", () => {
  //   // Visita a página inicial
  //   cy.visit("http://localhost:3000");

  //   // Seleciona o botão de login pelo texto visível "Entrar"
  //   cy.contains("a", "Entrar").should("exist").click();

  //   // Preenche o login
  //   cy.get("#email").type("MarieC@gmail.com");
  //   cy.get("#password").type("Ab@12345");

  //   // Clica no botão de login pelo Tailwind escapado
  //   cy.get("button.bg-primary").should("exist").click();

  //   // Espera a página carregar os itens (use timeout se necessário)
  //   //cy.get("[data-cy=add-to-cart-16]").click();
  //   cy.get("[data-cy=carrinho]").should("exist").click();
  //   cy.get("[data-cy=finalizar]").should("exist").click();
  //   cy.get("#address-3").click();
  //   cy.get('[data-cy="cartao-8"]').click();
  //   cy.get('[data-cy="cartao-9"]').click();
  //   cy.get("#amount-8").clear().type("49.95");
  //   cy.get("#amount-9").type("49.95");
  //   cy.get('[data-cy="continuar"]').click();
  //   cy.get('[data-cy="inputCupom"]').type("CUPOM1");
  //   cy.get('[data-cy="aplicar"]').click();
  //   cy.get('[data-cy="finalizar"]').click();
  // });

  it("teste adicionar endereço e cartão", () => {
    cy.visit("http://localhost:3000");

    // Seleciona o botão de login pelo texto visível "Entrar"
    cy.contains("a", "Entrar").should("exist").click();

    // Preenche o login
    cy.get("#email").type("MarieC@gmail.com");
    cy.get("#password").type("Ab@12345");

    // Clica no botão de login pelo Tailwind escapado
    cy.get("button.bg-primary").should("exist").click();
    cy.get("[data-cy=carrinho]").should("exist").click();
    cy.get("[data-cy=finalizar]").should("exist").click();

    //adicionar endereço novo
    // cy.get("[data-cy=adicionarendereco]").should("exist").click();
    // cy.get("[data-cy=tipologradouro]").should("exist").click();
    // cy.get("[data-cy=avenida]").should("exist").click();
    // cy.get("#cep").type("11111111");
    // cy.get("#logradouro").clear().type("Av.dos testes");
    // cy.get('[name="endereco_cobranca.apelido"]').type("Teste");
    // cy.get("#numero").type("21");
    // cy.get("#bairro").clear().type("jardim dos testes");
    // cy.get('[data-cy="estado"]').click();
    // cy.get('[data-cy="rj"]').click();
    // cy.get("#cidade").clear().type("friburgo");
    // cy.get(".bg-primary").should("exist").click();

    //adicionar um cartão novo
    cy.get("[data-cy=adicionarcartao]").should("exist").click();
    cy.get("#numero").type("121212121212121212");
    cy.get("#nomeTitular").type("Teste");
    cy.get('[data-cy="bandeira"]').click();
    cy.get('[data-cy="master"]').click();
    cy.get("#cvv").type("123");
    cy.get("#validade").type("0227");
    cy.get(".bg-primary").should("exist").click();
  });
});

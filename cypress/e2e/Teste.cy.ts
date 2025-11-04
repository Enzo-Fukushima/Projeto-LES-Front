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
  // it("teste adicionar endereço e cartão", () => {
  //   cy.visit("http://localhost:3000");
  //   // Seleciona o botão de login pelo texto visível "Entrar"
  //   cy.contains("a", "Entrar").should("exist").click();
  //   // Preenche o login
  //   cy.get("#email").type("MarieC@gmail.com");
  //   cy.get("#password").type("Ab@12345");
  //   // Clica no botão de login pelo Tailwind escapado
  //   cy.get("button.bg-primary").should("exist").click();
  //   // cy.get("[data-cy=carrinho]").should("exist").click();
  //   // cy.get("[data-cy=finalizar]").should("exist").click();
  //   //adicionar endereço novo
  //   // cy.get("[data-cy=adicionarendereco]").should("exist").click();
  //   // cy.get("[data-cy=tipologradouro]").should("exist").click();
  //   // cy.get("[data-cy=avenida]").should("exist").click();
  //   // cy.get("#cep").type("11111333");
  //   // cy.get("#logradouro").clear().type("Av.dos testes");
  //   // cy.get('[name="endereco_cobranca.apelido"]').type("Teste");
  //   // cy.get("#numero").type("21");
  //   // cy.get("#bairro").clear().type("jardim dos testes");
  //   // cy.get('[data-cy="estado"]').click();
  //   // cy.get('[data-cy="rj"]').click();
  //   // cy.get("#cidade").clear().type("friburgo");
  //   //cy.get(".bg-primary").should("exist").click();
  //   //adicionar um cartão novo
  //   // cy.get("[data-cy=adicionarcartao]").should("exist").click();
  //   // cy.get("#numero").type("311212121212121212");
  //   // cy.get("#nomeTitular").type("Teste");
  //   // cy.get('[data-cy="bandeira"]').click();
  //   // cy.get('[data-cy="master"]').click();
  //   // cy.get("#cvv").type("123");
  //   // cy.get("#validade").type("0227");
  //   // cy.get(".bg-primary").should("exist").click();
  // });
  // it("teste Troca cliente", () => {
  //   cy.visit("http://localhost:3000");
  //   // Seleciona o botão de login pelo texto visível "Entrar"
  //   cy.contains("a", "Entrar").should("exist").click();
  //   // Preenche o login
  //   cy.get("#email").type("MarieC@gmail.com");
  //   cy.get("#password").type("Ab@12345");
  //   // Clica no botão de login pelo Tailwind escapado
  //   cy.get("button.bg-primary").should("exist").click();
  //   cy.get('[data-cy="usuario"]').click();
  //   cy.get('[data-cy="pedidos"]').click();
  //   cy.get('[data-cy="troca-11"]').click();
  //   cy.get('[data-cy="item-16"]').click();
  //   cy.get('#reason-16').type("Rasgo na capa");
  //   cy.get('#general-reason').type("Defeito no produto");
  //   cy.get('.pt-4 > .bg-primary').click();
  // });
  // it("teste Admin confirmar pagamento", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.get('[data-cy="admin"]').click();
  //   cy.get('[href="/admin/orders"]').click()
  //   cy.get('[data-cy="status-12"]').click();
  //   cy.get('[data-cy="preparando"]').should("exist")
  // });
  //  it("teste Admin colocar em_transporte", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.get('[data-cy="admin"]').click();
  //   cy.get('[href="/admin/orders"]').click()
  //   cy.get('[data-cy="status-12"]').click();
  //   cy.get('[data-cy="em_transporte"]').should("exist")
  // });
  //  it("teste Admin confirmar entregue", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.get('[data-cy="admin"]').click();
  //   cy.get('[href="/admin/orders"]').click();
  //   cy.get('[data-cy="status-12"]').click();
  //   cy.get('[data-cy="entregue"]').should("exist")
  // });
  // it("teste Admin confirmar entregue", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.get('[data-cy="admin"]').click();
  //   cy.get('[href="/admin/exchanges"]').click();
  //   //cy.get('[data-cy="troca-4"]').click();
  //   cy.get('[data-cy="confirmaTroca-4"]').click();
  //   cy.get('[data-cy="confirmarRecebimento-4"]').click();
  // });
  // it("teste Admin confirmar troca", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.get('[data-cy="admin"]').click();
  //   cy.get('[href="/admin/exchanges"]').click();
  //   //cy.get('[data-cy="troca-5"]').click();
  //   cy.get('[data-cy="confirmaTroca-5"]').click();
  //   cy.get('[data-cy="confirmarRecebimento-5"]').click();
  // });
  //   describe("Fluxo de Compras com 1 ou 2 Cartões e Cupons", () => {
  //   beforeEach(() => {
  //     // Acessa o sistema e faz login antes de cada teste
  //     cy.visit("http://localhost:3000");
  //     cy.contains("a", "Entrar").should("exist").click();
  //     cy.get("#email").type("joaoP@email.com");
  //     cy.get("#password").type("Ab@12345");
  //     cy.get("button.bg-primary").should("exist").click();
  //     // Adiciona um produto ao carrinho e vai para o checkout
  //     cy.get("[data-cy=add-to-cart-16]").click();
  //     cy.get("[data-cy=carrinho]").should("exist").click();
  //     cy.get("[data-cy=finalizar]").should("exist").click();
  //     cy.get("#address-1").click();
  //   });
  //   // UC01 – 1 Cartão, sem cupom
  //   it("UC01 - Finalizar compra com 1 cartão e sem cupom", () => {
  //     cy.get('[data-cy="cartao-5"]').click();
  //     cy.get("#amount-5").clear().type("99.90");
  //     cy.get('[data-cy="continuar"]').click();
  //     cy.get('[data-cy="finalizar"]').click();
  //   });
  //   // UC02 – 2 Cartões, sem cupom
  //   it("UC02 - Finalizar compra com 2 cartões e sem cupom", () => {
  //     cy.get('[data-cy="cartao-5"]').click();
  //     cy.get('[data-cy="cartao-6"]').click();
  //     cy.get("#amount-5").clear().type("49.95");
  //     cy.get("#amount-6").type("49.95");
  //     cy.get('[data-cy="continuar"]').click();
  //     cy.get('[data-cy="finalizar"]').click();
  //   });
  //   // UC03 – 1 Cartão + CUPOM1 (10%)
  //   it("UC03 - Finalizar compra com 1 cartão e CUPOM1 (10%)", () => {
  //     cy.get('[data-cy="cartao-5"]').click();
  //     cy.get("#amount-5").clear().type("99.90");
  //     cy.get('[data-cy="continuar"]').click();
  //     cy.get('[data-cy="inputCupom"]').type("CUPOM1");
  //     cy.get('[data-cy="aplicar"]').click();
  //     cy.get('[data-cy="finalizar"]').click();
  //   });
  //   // UC04 – 2 Cartões + CUPOM1 (10%)
  //   it("UC04 - Finalizar compra com 2 cartões e CUPOM1 (10%)", () => {
  //     cy.get('[data-cy="cartao-5"]').click();
  //     cy.get('[data-cy="cartao-6"]').click();
  //     cy.get("#amount-5").clear().type("60.00");
  //     cy.get("#amount-6").type("39.90");
  //     cy.get('[data-cy="continuar"]').click();
  //     cy.get('[data-cy="inputCupom"]').type("CUPOM1");
  //     cy.get('[data-cy="aplicar"]').click();
  //     cy.get('[data-cy="finalizar"]').click();
  //   });
  //   // UC05 – 1 Cartão + CUPOM2 (R$20 fixo)
  //   it("UC05 - Finalizar compra com 1 cartão e CUPOM2 (R$20 fixo)", () => {
  //     cy.get('[data-cy="cartao-5"]').click();
  //     cy.get("#amount-5").clear().type("99.90");
  //     cy.get('[data-cy="continuar"]').click();
  //     cy.get('[data-cy="inputCupom"]').type("CUPOM2");
  //     cy.get('[data-cy="aplicar"]').click();
  //     cy.get('[data-cy="finalizar"]').click();
  //   });
  //   // UC06 – 2 Cartões + CUPOM2 (R$20 fixo)
  //   it("UC06 - Finalizar compra com 2 cartões e CUPOM2 (R$20 fixo)", () => {
  //     cy.get('[data-cy="cartao-5"]').click();
  //     cy.get('[data-cy="cartao-6"]').click();
  //     cy.get("#amount-5").clear().type("49.95");
  //     cy.get("#amount-6").type("49.95");
  //     cy.get('[data-cy="continuar"]').click();
  //     cy.get('[data-cy="inputCupom"]').type("CUPOM2");
  //     cy.get('[data-cy="aplicar"]').click();
  //     cy.get('[data-cy="finalizar"]').click();
  //   });
  // });
});

describe('Register Form', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/register');
    });

    it('should fill and submit the registration form', () => {
        // Mock da API antes do submit
        cy.intercept('POST', '**/clientes', {
        statusCode: 200
        }).as('createCliente');

        const timestamp = Date.now();

        // Informações pessoais
        cy.get('#nome').type('Felipe Lopes');
        cy.get('#email').type(`test.${timestamp}@example.com`);
        cy.get('#telefone').type('(11) 99999-9999');
        cy.get('#cpf').type(timestamp.toString().slice(-11));
        cy.get('#data_nascimento').type('1990-01-01');

        // Gênero (Select Radix)
        cy.get('[data-testid="select-genero"]').click();
        cy.contains('[role="option"]', 'Masculino').click({ force: true });

        // Senha
        cy.get('#senha').type('SenhaForte123!');
        cy.get('#confirmar_senha').type('SenhaForte123!');

        // Endereço de cobrança
        cy.get('#endereco_cobranca\\.cep').type('12345-678');

        // Tipo de residência
        cy.get('[data-testid="select-tipo-residencia"]').click();
        cy.contains('[role="option"]', 'Casa').click({ force: true });

        // Tipo de logradouro
        cy.get('[data-testid="select-tipo-logradouro"]').click();
        cy.contains('[role="option"]', 'RUA').click({ force: true });

        cy.get('#endereco_cobranca\\.logradouro').type('Rua Teste');
        cy.get('#endereco_cobranca\\.numero').type('123');
        cy.get('#endereco_cobranca\\.apelido').type('casa');
        cy.get('#endereco_cobranca\\.bairro').type('Bairro Teste');
        cy.get('#endereco_cobranca\\.cidade').type('São Paulo');
        cy.get('#endereco_cobranca\\.estado').type('SP');
        cy.get('#endereco_cobranca\\.pais').type('Brasil');

        cy.get('#mesmo_endereco').check();

        // Submit
        cy.get('button[type="submit"]').click();

        // Esperar a requisição
        cy.wait('@createCliente');
    });

  it('exibe erro quando o backend retorna 400', () => {
    const timestamp = Date.now();
    
    cy.intercept('POST', '**/clientes', {
      statusCode: 400,
    
    }).as('createClienteErro');

    cy.visit('http://localhost:3000/register');

    // Preencher o formulário
    cy.get('#nome').type('Felipe Lopes');
    cy.get('#email').type('joao24@email.com');
    cy.get('#telefone').type('(11) 99999-9999');
    cy.get('#cpf').type(timestamp.toString().slice(-11));
    cy.get('#data_nascimento').type('1990-01-01');

    cy.get('[data-testid="select-genero"]').click();
    cy.contains('[role="option"]', 'Masculino').click({ force: true });

    cy.get('#senha').type('SenhaForte123!');
    cy.get('#confirmar_senha').type('SenhaForte123!');

    cy.get('#endereco_cobranca\\.cep').type('12345-678');
    cy.get('[data-testid="select-tipo-residencia"]').click();
    cy.contains('[role="option"]', 'Casa').click({ force: true });

    cy.get('[data-testid="select-tipo-logradouro"]').click();
    cy.contains('[role="option"]', 'RUA').click({ force: true });

    cy.get('#endereco_cobranca\\.logradouro').type('Rua Teste');
    cy.get('#endereco_cobranca\\.numero').type('123');
    cy.get('#endereco_cobranca\\.apelido').type('casa');
    cy.get('#endereco_cobranca\\.bairro').type('Bairro Teste');
    cy.get('#endereco_cobranca\\.cidade').type('São Paulo');
    cy.get('#endereco_cobranca\\.estado').type('SP');
    cy.get('#endereco_cobranca\\.pais').type('Brasil');

    cy.get('#mesmo_endereco').check();

    // Submit depois de preencher tudo
    cy.get('button[type="submit"]').click();

    // Esperar a requisição interceptada
    cy.wait('@createClienteErro');
});
});

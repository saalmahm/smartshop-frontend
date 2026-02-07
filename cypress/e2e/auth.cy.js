/* global describe, it, cy */
describe('Authentification', () => {
  it('devrait se connecter en tant qu\'admin et accéder au dashboard', () => {
    cy.visit('/login');
    
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin'); 
    cy.get('button[type="submit"]').click();
    
    // Vérification de la redirection
    cy.url().should('include', '/admin/dashboard');
    
    //en cas de succès
    cy.contains('h1', 'Dashboard admin').should('be.visible');
  });

  it('devrait afficher une erreur en cas de mauvais identifiants', () => {
    cy.visit('/login');
    cy.get('input[name="username"]').type('wrong_user');
    cy.get('input[name="password"]').type('wrong_password');
    cy.get('button[type="submit"]').click();
    
    // en cas de mauvais identifiants
    cy.contains("Nom d'utilisateur ou mot de passe incorrect.").should('be.visible');
  });
});
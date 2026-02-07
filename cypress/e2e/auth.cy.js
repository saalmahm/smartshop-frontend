describe('Authentification', () => {
  it('devrait se connecter en tant qu\'admin et accéder au dashboard', () => {
    cy.visit('/login');
    
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin'); 
    cy.get('button[type="submit"]').click();
    
    // Vérification de la redirection
    cy.url().should('include', '/admin/dashboard');
    
    // CORRECTION : Le titre exact dans AdminDashboardPage.jsx est "Dashboard admin"
    cy.contains('h1', 'Dashboard admin').should('be.visible');
  });

  it('devrait afficher une erreur en cas de mauvais identifiants', () => {
    cy.visit('/login');
    cy.get('input[name="username"]').type('wrong_user');
    cy.get('input[name="password"]').type('wrong_password');
    cy.get('button[type="submit"]').click();
    
    // CORRECTION : Le message exact dans LoginPage.jsx est "Nom d'utilisateur ou mot de passe incorrect."
    cy.contains("Nom d'utilisateur ou mot de passe incorrect.").should('be.visible');
  });
});
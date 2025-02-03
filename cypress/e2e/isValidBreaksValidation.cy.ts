describe('isValidBreaksValidation', () => {
  it('it should validate the debounced field validation', () => {
    cy.visit('http://localhost:3000/isValidBreaksValidation');

    cy.get('input[name="password"]').type('1234').blur();

    cy.get('input[name="password"] + p').contains('error');
  });

  it('should still work if the isValid field state is used', () => {
    cy.visit('http://localhost:3000/isValidBreaksValidation?useIsValid=true');

    cy.get('input[name="password"]').type('1234').blur();

    cy.get('input[name="password"] + p').contains('error');
  });
});

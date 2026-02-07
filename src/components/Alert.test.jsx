import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const Alert = ({ message }) => <div role="alert">{message}</div>;

test('affiche le message d\'alerte', () => {
  render(<Alert message="Succès !" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Succès !');
});
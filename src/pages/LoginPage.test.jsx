// src/pages/LoginPage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { authApi } from '../api/authApi';
import LoginPage from './LoginPage';

jest.mock('../api/authApi');

describe('LoginPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('affiche les erreurs de validation frontend si on soumet sans remplir', async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByText(/Nom d’utilisateur obligatoire/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Mot de passe obligatoire/i),
    ).toBeInTheDocument();
  });

  test('appelle authApi.login avec les bonnes valeurs', async () => {
    authApi.login.mockResolvedValue('Logged in as ADMIN');

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'admin123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin123',
      });
    });
  });

  test('affiche un message pour identifiants invalides (401)', async () => {
    authApi.login.mockRejectedValue({
      response: {
        status: 401,
        data: {
          status: 401,
          error: 'Unauthorized',
          message: 'Invalid credentials',
          path: '/auth/login',
        },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByText(/Nom d’utilisateur ou mot de passe incorrect/i),
    ).toBeInTheDocument();
  });
});
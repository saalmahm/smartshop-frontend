jest.mock('./apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import { clientApi } from './clientApi';
import apiClient from './apiClient';

test('récupère la liste des clients', async () => {
  const clients = [{ id: 1, name: 'Jean Dupont' }];

  //simule la réponse de l’API
  apiClient.get.mockResolvedValue({ data: clients });

  const result = await clientApi.getClients();

  expect(result).toEqual(clients);
  // vérifie que l’URL contient bien "/clients"
  expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/clients'));
});
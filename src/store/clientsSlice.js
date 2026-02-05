import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientApi } from '../api/clientApi';

const initialState = {
  items: [],          // liste des clients
  status: 'idle',     // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const data = await clientApi.getClients();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Impossible de charger la liste des clients.";
      return rejectWithValue(message);
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClients(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Erreur lors du chargement des clients.';
      });
  },
});

export const { clearClients } = clientsSlice.actions;
export default clientsSlice.reducer;
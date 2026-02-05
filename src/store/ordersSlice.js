import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../api/orderApi';

const initialState = {
  items: [],          // liste des commandes (admin)
  currentOrder: null, // détail d'une commande
  status: 'idle',
  error: null,
};

export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderApi.getAdminOrders();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Impossible de charger la liste des commandes.";
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderApi.getOrderById(orderId);
      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Impossible de charger le détail de la commande.";
      return rejectWithValue(message);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // liste
      .addCase(fetchAdminOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || 'Erreur lors du chargement des commandes.';
      })
      // détail
      .addCase(fetchOrderById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || 'Erreur lors du chargement du détail commande.';
      });
  },
});

export const { clearOrders, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
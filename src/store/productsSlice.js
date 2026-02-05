import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../api/productApi';

const initialState = {
  items: [],          // produits (admin ou catalogue selon usage)
  status: 'idle',
  error: null,
};

export const fetchAdminProducts = createAsyncThunk(
  'products/fetchAdminProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productApi.getAdminProducts();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Impossible de charger la liste des produits admin.";
      return rejectWithValue(message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || 'Erreur lors du chargement des produits.';
      });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../api/paymentApi';

const initialState = {
  lastPayment: null,     // dernier paiement créé
  status: 'idle',        // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await paymentApi.createPayment(payload);
      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Impossible d'enregistrer le paiement.";
      return rejectWithValue(message);
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearLastPayment(state) {
      state.lastPayment = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || "Erreur lors de l'enregistrement du paiement.";
      });
  },
});

export const { clearLastPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import clientsReducer from './clientsSlice';
import productsReducer from './productsSlice';
import ordersReducer from './ordersSlice';
import paymentsReducer from './paymentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    products: productsReducer,
    orders: ordersReducer,
    payments: paymentsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
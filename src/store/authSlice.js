// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

const initialState = {
  isAuthenticated: false,
  user: null,      // ex: profil client
  role: null,      // 'ADMIN' | 'CLIENT' | null
  status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Restaure la session depuis le backend (CLIENT uniquement via /me/profile)
export const fetchSession = createAsyncThunk(
  'auth/fetchSession',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authApi.getMyProfile();
      // Ici on sait que c’est un CLIENT
      return { user: profile, role: 'CLIENT' };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        return rejectWithValue('UNAUTHENTICATED');
      }
      return rejectWithValue('UNKNOWN_ERROR');
    }
  }
);

// Logout
export const performLogout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return;
    } catch (error) {
      return rejectWithValue('LOGOUT_FAILED');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // À appeler après un login réussi côté LoginPage
    setAuthenticated(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user || null;
      state.role = action.payload.role || null;
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSession
      .addCase(fetchSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role; // 'CLIENT'
        state.error = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.status = 'failed';
        // Si non authentifié, on reste en état "déconnecté"
        if (action.payload === 'UNAUTHENTICATED') {
          state.isAuthenticated = false;
          state.user = null;
          state.role = null;
        } else {
          state.error = action.payload || 'Erreur lors de la récupération de la session';
        }
      })
      // logout
      .addCase(performLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { setAuthenticated, clearAuth } = authSlice.actions;
export default authSlice.reducer;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSession } from './store/authSlice';
import LoginPage from './pages/LoginPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Tentative de restauration de session (CLIENT)
    dispatch(fetchSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
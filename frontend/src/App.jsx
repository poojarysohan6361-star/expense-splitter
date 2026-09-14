import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { useAuth } from './hooks/useAuth.js';

function Dashboard({ user, onLogout }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Expense Splitter</h1>
      <p>Logged in as {user.name} ({user.email})</p>
      <button onClick={onLogout}>Log out</button>
      <p>Groups, expenses and balances get built here next.</p>
    </div>
  );
}

function App() {
  // Single source of truth for auth state. Login/Signup receive the
  // functions as props instead of each calling useAuth() themselves —
  // otherwise each page would get its own independent copy of `user`.
  const { user, login, signup, logout, isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={login} />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup onSignup={signup} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/HomePage';
import FinUI from './components/FinUI';
import FitUI from './components/FitUI';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_name');
    if (token) {
      setIsLoggedIn(true);
      setUserName(storedUser || '');
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUserName(user.username);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Home userName={userName} onLogout={handleLogout} />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/fin"
          element={isLoggedIn ? <FinUI /> : <Navigate to="/" />}
        />
        <Route
          path="/fit"
          element={isLoggedIn ? <FitUI /> : <Navigate to="/" />}
        />
        {/* Add other protected routes here */}
      </Routes>
    </Router>
  );
}

export default App;

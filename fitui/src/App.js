import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/HomePage';
import FinUI from './components/FinUI';
import FitUI from './components/FitUI';
import Signup from './components/Signup';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_name');
    setIsLoading(true);

    if (token) {
      axios.post(`${apiUrl}/api/validate-token`, { token }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
        .then(response => {
          if (response.data.valid) {
            setIsLoggedIn(true);
            setUserName(storedUser || '');
          } else {
            axios.post(`${apiUrl}/api/renew-token`, { token }, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            })
              .then(refreshResponse => {
                if (refreshResponse.data.token) {
                  localStorage.setItem('auth_token', refreshResponse.data.token);
                  setIsLoggedIn(true);
                  setUserName(storedUser || '');
                } else {
                  localStorage.clear();
                  setIsLoggedIn(false);
                  setUserName('');
                }
              })
              .catch(() => {
                localStorage.clear();
                setIsLoggedIn(false);
                setUserName('');
              })
              .finally(() => setIsLoading(false));
          }
        })
        .catch(() => {
          localStorage.clear();
          setIsLoggedIn(false);
          setUserName('');
          setIsLoading(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
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
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '30vh' }}>
          <ClipLoader color="#36d7b7" loading={isLoading} size={60} />
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Home userName={userName} onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} setErrorMessage={() => {}} />
              )
            }
          />
          <Route
            path="/fin"
            element={
              isLoggedIn ? (
                <FinUI onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} setErrorMessage={() => {}} />
              )
            }
          />
          <Route
            path="/fit"
            element={
              isLoggedIn ? (
                <FitUI onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} setErrorMessage={() => {}} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              <Signup onSignupSuccess={setUserName} setErrorMessage={() => {}} />
            }
          />

          {/* Catch-all route to redirect to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;

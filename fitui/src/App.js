import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/HomePage';
import FinUI from './components/FinUI';
import FitUI from './components/FitUI';
import Signup from './components/Signup';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
const apiUrl = process.env.REACT_APP_API_URL;


useEffect(() => {
  const token = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('user_name');

  if (token) {
    // Validate the token with the backend
    axios.post(`${apiUrl}/api/validate-token`, { token }
      , {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(response => {
        if (response.data.valid) {
          // Token is valid, set user info
          setIsLoggedIn(true);
          setUserName(storedUser || '');
        } else {
          // Token is invalid, attempt to refresh it
          axios.post(`${apiUrl}/api/renew-token`, { token },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          )
            .then(refreshResponse => {
              if (refreshResponse.data.newToken) {
                // Store the new token and set user info
                localStorage.setItem('auth_token', refreshResponse.data.newToken);
                setIsLoggedIn(true);
                setUserName(storedUser || '');
              } else {
                // No new token, log out
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_name');
                setIsLoggedIn(false);
                setUserName('');
              }
            })
            .catch(() => {
              // Error refreshing token, log out
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_name');
              setIsLoggedIn(false);
              setUserName('');
            });
        }
      })
      .catch(() => {
        // Error validating token, log out
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        setIsLoggedIn(false);
        setUserName('');
      });
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
              <Login onLoginSuccess={handleLoginSuccess} setErrorMessage={() => {}} />
            )
          }
        />
        <Route
          path="/fin"
          element={isLoggedIn ? <FinUI onLogout={handleLogout} /> : <Login onLoginSuccess={handleLoginSuccess} setErrorMessage={() => {}} />
        }
        />
        <Route
          path="/fit"
          element={isLoggedIn ? <FitUI onLogout={handleLogout} /> :  <Login onLoginSuccess={handleLoginSuccess} setErrorMessage={() => {}} />
        }
        />
        {/* Add other protected routes here */}


<Route path="/signup" element={<Signup onSignupSuccess={setUserName} setErrorMessage={() => {}} />} />

      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import { Input, LoginForm, LoginButton } from '../styles/Styledcomponents';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';

// If using public folder:
const logoSrc = 'https://img.icons8.com/?size=100&id=58926&format=png&color=000000';

// If using imported image:
// import logoSrc from '../assets/logo.png';

const apiUrl = process.env.REACT_APP_API_URL;

const Login = ({ onLoginSuccess, setErrorMessage }) => {
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/login`, loginCredentials, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true 
            });

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', user._id);
      localStorage.setItem('user_name', user.username);

      onLoginSuccess(user);
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  style={{
      display: 'inline-grid',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      alignContent: 'center',
    }}>
    <div
      style={{
        display: 'inline-flex',
        gap: '12px',
        marginLeft: '10px',
      }}
 
>
  {/* 🔥 Logo */}
  <img
    src={logoSrc}
    alt="App Logo"
    style={{ width: '80px', marginBottom: '10px' }}
  />

  {/* 🖋️ App Title */}
  <h1
    style={{
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
      fontWeight: '700',
      fontSize: '28px',
      marginBottom: '30px',
      letterSpacing: '-0.5px',
      color: '#222',
    }}
  >
  lifesaver
  </h1>
  </div>

      <LoginForm onSubmit={handleLogin}>
        <Input
          style={{ width: '300px' }}
          type="email"
          name="email"
          placeholder="Email"
          value={loginCredentials.email}
          onChange={handleLoginInputChange}
          required
        />
        <Input
          style={{ width: '300px' }}
          type="password"
          name="password"
          placeholder="Password"
          value={loginCredentials.password}
          onChange={handleLoginInputChange}
          required
        />
        <LoginButton
          style={{ width: '300px', marginLeft: '10px' }}
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner /> : 'Login'}
        </LoginButton>

        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </LoginForm>
      </div>
    
  );
};

export default Login;

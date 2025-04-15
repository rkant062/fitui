// components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Input, LoginForm, LoginButton } from '../styles/Styledcomponents';

const apiUrl = process.env.REACT_APP_API_URL;

const Login = ({ onLoginSuccess, setErrorMessage }) => {
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/login`, loginCredentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', user._id);
      localStorage.setItem('user_name', user.username);

      onLoginSuccess(user); // Pass user data back to parent
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ display: 'inline-grid', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', alignContent: 'center' }}>
    <LoginForm onSubmit={handleLogin}>
      <Input
        style ={{ width: '300px' }}
        type="email"
        name="email"
        placeholder="Email"
        value={loginCredentials.email}
        onChange={handleLoginInputChange}
        required
      />
      <Input
      style ={{ width: '300px' }}
        type="password"
        name="password"
        placeholder="Password"
        value={loginCredentials.password}
        onChange={handleLoginInputChange}
        required
      />
      <LoginButton 
      style={{ width: '300px', marginLeft: '10px' }}
      type="submit">Login</LoginButton>
    </LoginForm>
    </div>
  );
};

export default Login;

// components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Input, LoginForm, LoginButton } from '../styles/Styledcomponents';
import Spinner from './Spinner';

const apiUrl = process.env.REACT_APP_API_URL;
const logoSrc = 'https://img.icons8.com/?size=100&id=58926&format=png&color=000000';

const Signup = ({ onSignupSuccess, setErrorMessage }) => {
  const [signupCredentials, setSignupCredentials] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/create-user`, signupCredentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', user._id);
      localStorage.setItem('user_name', user.username);

      onSignupSuccess(user);
    } catch (error) {
      console.error('Signup failed:', error);
      setErrorMessage('Signup failed. Try a different email or password.');
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
    <div
      style={{
        display: 'inline-grid',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        alignContent: 'center',
      }}
    >
      <LoginForm onSubmit={handleSignup}>
        <Input
          style={{ width: '300px' }}
          type="text"
          name="username"
          placeholder="Username"
          value={signupCredentials.username}
          onChange={handleSignupInputChange}
          required
        />
        <Input
          style={{ width: '300px' }}
          type="email"
          name="email"
          placeholder="Email"
          value={signupCredentials.email}
          onChange={handleSignupInputChange}
          required
        />
        <Input
          style={{ width: '300px' }}
          type="password"
          name="password"
          placeholder="Password"
          value={signupCredentials.password}
          onChange={handleSignupInputChange}
          required
        />
        <LoginButton
          style={{ width: '300px', marginLeft: '10px' }}
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner /> : 'Sign Up'}
        </LoginButton>
      </LoginForm>
    </div>
    </div>
  );
};

export default Signup;

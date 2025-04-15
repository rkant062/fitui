// components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Input, LoginForm, LoginButton } from '../styles/Styledcomponents';
import Spinner from './Spinner';

const apiUrl = process.env.REACT_APP_API_URL;

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
      const response = await axios.post(`${apiUrl}/api/signup`, signupCredentials, {
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
  );
};

export default Signup;

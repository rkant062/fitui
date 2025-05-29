// components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Input, LoginForm, LoginButton } from '../styles/Styledcomponents';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const apiUrl = process.env.REACT_APP_API_URL;
const logoSrc = 'https://img.icons8.com/?size=100&id=58926&format=png&color=000000';

const Signup = ({ onSignupSuccess, setErrorMessage }) => {
  const [signupCredentials, setSignupCredentials] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

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

      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Signup failed:', error);
      setErrorMessage('Signup failed. Try a different email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      {showConfetti && <Confetti />}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '30px'
      }}>
        <img
          src={logoSrc}
          alt="App Logo"
          style={{ width: '80px' }}
        />
        <h1 style={{
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
          fontWeight: '700',
          fontSize: '28px',
          letterSpacing: '-0.5px',
          color: '#222',
          margin: 0
        }}>
          lifesaver
        </h1>
      </div>

      <LoginForm onSubmit={handleSignup} style={{ width: '100%', maxWidth: '300px' }}>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={signupCredentials.username}
          onChange={handleSignupInputChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={signupCredentials.email}
          onChange={handleSignupInputChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={signupCredentials.password}
          onChange={handleSignupInputChange}
          required
        />
        <LoginButton
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

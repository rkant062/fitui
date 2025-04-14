import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f0f4f8, #dff2f9);
  font-family: 'Segoe UI', sans-serif;
  color: #333;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 3rem;
  align-items: center;
`;

const Greeting = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  margin: 0;
`;

const LogoutButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: background 0.3s ease;

  &:hover {
    background: #e63946;
  }
`;

const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  padding: 2rem 3rem;
`;

const Tile = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
  }
`;

const TileEmoji = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const TileTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
`;

const Home = ({ userName, onLogout }) => {
  const navigate = useNavigate();

  return (
    <Page>
      <TopBar>
        <Greeting>Hello, {userName} 👋</Greeting>
        <LogoutButton onClick={onLogout}>Logout</LogoutButton>
      </TopBar>

      <TileGrid>
        <Tile onClick={() => navigate('/fit')}>
          <TileEmoji>🏋️‍♂️</TileEmoji>
          <TileTitle>Fitness Tracker</TileTitle>
        </Tile>
        <Tile onClick={() => navigate('/fin')}>
          <TileEmoji>💰</TileEmoji>
          <TileTitle>Finance Tracker</TileTitle>
        </Tile>
        {/* Add more tiles below as needed */}
        <Tile>
          <TileEmoji>📓</TileEmoji>
          <TileTitle>Journal</TileTitle>
        </Tile>
        <Tile>
          <TileEmoji>🧠</TileEmoji>
          <TileTitle>Mindfulness</TileTitle>
        </Tile>
      </TileGrid>
    </Page>
  );
};

export default Home;

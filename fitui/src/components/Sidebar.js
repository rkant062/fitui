// Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FiActivity, FiBarChart2, FiHome, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
const SidebarContainer = styled.div`
  background-color: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  width: ${({ isCollapsed }) => (isCollapsed ? '60px' : '200px')};
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100%;
    height: 60px;
    bottom: 0;
    top: auto;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    z-index: 999;
  }
`;

const SidebarItem = styled(NavLink)`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  color: #cbd5e0;
  text-decoration: none;
  font-size: 16px;
  transition: background 0.3s ease;

  &.active {
    background-color: #374151;
    color: #fff;
    font-weight: bold;
  }

  &:hover {
    background-color: #2d3748;
  }

  svg {
    margin-right: 10px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    font-size: 12px;
    padding: 8px;
    svg {
      margin: 0 0 4px 0;
    }
  }
`;

const Sidebar = ({ isCollapsed }) => {
const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');s

    // Redirect to login page
    navigate('/login');
  };

  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      <SidebarItem to="/" exact>
        <FiHome />
        <span>Home</span>
      </SidebarItem>
      <SidebarItem to="/fitui">
        <FiActivity />
        <span>Fit UI</span>
      </SidebarItem>
      <SidebarItem to="/finui">
        <FiBarChart2 />
        <span>Fin UI</span>
      </SidebarItem>
      <SidebarItem to="/login">
        <FiLogOut />
        <span>Logout</span>
      </SidebarItem>
    </SidebarContainer>
  );
};

export default Sidebar;
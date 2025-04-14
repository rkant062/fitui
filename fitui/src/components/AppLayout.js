import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiLogOut, FiHome, FiActivity, FiDollarSign } from 'react-icons/fi';

const Layout = styled.div`
  display: flex;
  height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const Sidebar = styled.div`
  width: ${({ collapsed }) => (collapsed ? '60px' : '220px')};
  background: #1e293b;
  color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: 60px;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }
`;

const SidebarToggle = styled.button`
  background: none;
  color: white;
  border: none;
  font-size: 1.5rem;
  margin: 0.5rem 1rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: #fff;
  text-decoration: none;
  transition: background 0.2s;

  &.active {
    background: #334155;
  }

  &:hover {
    background: #334155;
  }

  svg {
    margin-right: ${({ $collapsed }) => ($collapsed ? '0' : '1rem')};
    font-size: 1.2rem;
  }

  span {
    display: ${({ $collapsed }) => ($collapsed ? 'none' : 'inline')};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0.5rem;

    svg {
      margin: 0;
    }

    span {
      display: block;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  background: #f8fafc;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
`;

const AppLayout = ({ children, onLogout }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout>
      <Sidebar collapsed={collapsed}>
        <SidebarToggle onClick={() => setCollapsed(!collapsed)}>
          <FiMenu />
        </SidebarToggle>

        <SidebarItem to="/" $collapsed={collapsed}>
          <FiHome />
          <span>Home</span>
        </SidebarItem>

        <SidebarItem to="/fit" $collapsed={collapsed}>
          <FiActivity />
          <span>Fit UI</span>
        </SidebarItem>

        <SidebarItem to="/fin" $collapsed={collapsed}>
          <FiDollarSign />
          <span>Fin UI</span>
        </SidebarItem>

        <SidebarItem as="div" onClick={onLogout} $collapsed={collapsed} style={{ cursor: 'pointer' }}>
          <FiLogOut />
          <span>Logout</span>
        </SidebarItem>
      </Sidebar>

      <Content>
        {children}
      </Content>
    </Layout>
  );
};

export default AppLayout;

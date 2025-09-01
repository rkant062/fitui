import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitBlog from './pages/SubmitBlog';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import FeaturedBlogs from './pages/FeaturedBlogs';
import MusicPage from './pages/MusicPage';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import './App.css';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>breww&read - Coffee Culture & Lifestyle Blog</title>
        <meta name="description" content="Discover amazing stories about coffee culture, travel, tech, and lifestyle. Join our community of writers and readers." />
      </Helmet>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/blogs/featured" element={<FeaturedBlogs />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit-blog" element={<SubmitBlog />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <FloatingMusicPlayer />
          </div>
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

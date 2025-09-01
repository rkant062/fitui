import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Popper,
  Paper,
  ListItemButton,
  ListItemIcon,
  Fade,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Clear as ClearIcon,
  Article as ArticleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    if (query.trim()) {
      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300); // 300ms delay
    } else {
      setSearchResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      const response = await api.get(`/blogs?search=${encodeURIComponent(query)}&limit=5`);
      setSearchResults(response.data.blogs);
      setSearchOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchResultClick = (blog) => {
    navigate(`/blog/${blog.slug}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSearchOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Clear search when navigating
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  const menuId = 'primary-search-account-menu';
  const isMenuOpen = Boolean(anchorEl);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
        <ListItemIcon>
          <DashboardIcon fontSize="small" />
        </ListItemIcon>
        Dashboard
      </MenuItem>
      <MenuItem component={Link} to="/submit-blog" onClick={handleMenuClose}>
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        Submit Blog
      </MenuItem>
      {isAdmin && (
        <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
          <ListItemIcon>
            <AdminIcon fontSize="small" />
          </ListItemIcon>
          Admin Panel
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  const drawer = (
    <Box>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            color: '#8B4513',
          }}
        >
          breww.in
        </Typography>
      </Box>
      <List>
        <ListItem button component={Link} to="/" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Home" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/?category=travel" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Travel" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/?category=tech" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Tech" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/?category=trivia" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Trivia" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/?category=Coffee & Culture" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="☕ Coffee & Culture" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/?category=Mind Brew" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="🧠 Mind Brew" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/?category=Local Roasts" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="🌱 Local Roasts" sx={{ color: '#8B4513' }} />
        </ListItem>
        <ListItem button component={Link} to="/music" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="🎧 Music" sx={{ color: '#8B4513' }} />
        </ListItem>
        {user && (
          <>
            <Divider />
            <ListItem button component={Link} to="/dashboard" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/submit-blog" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Submit Blog" />
            </ListItem>
            {isAdmin && (
              <ListItem button component={Link} to="/admin" onClick={() => setMobileOpen(false)}>
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #D2B48C 0%, #DEB887 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            className="brand-logo"
            sx={{
              mr: 3,
              display: { xs: 'none', sm: 'block' },
              color: '#8B4513',
              textDecoration: 'none',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              '&:hover': {
                opacity: 0.9,
                transform: 'scale(1.02)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            breww.in
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Button
                color="inherit"
                component={Link}
                to="/?category=travel"
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.85rem',
                  color: 'rgba(139, 69, 19, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    color: '#8B4513',
                  },
                }}
              >
                Travel
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/?category=tech"
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.85rem',
                  color: 'rgba(139, 69, 19, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    color: '#8B4513',
                  },
                }}
              >
                Tech
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/?category=trivia"
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.85rem',
                  color: 'rgba(139, 69, 19, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    color: '#8B4513',
                  },
                }}
              >
                Trivia
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/?category=Coffee & Culture"
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.85rem',
                  color: 'rgba(139, 69, 19, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    color: '#8B4513',
                  },
                }}
              >
                ☕ Coffee & Culture
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/?category=Mind Brew"
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.85rem',
                  color: 'rgba(139, 69, 19, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    color: '#8B4513',
                  },
                }}
              >
                🧠 Mind Brew
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/music"
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '0.85rem',
                  color: 'rgba(139, 69, 19, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    color: '#8B4513',
                  },
                }}
              >
                🎧 Music
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex' }}>
                <TextField
                  size="small"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {searchLoading ? (
                          <CircularProgress size={20} />
                        ) : searchQuery ? (
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        ) : (
                          <SearchIcon />
                        )}
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'grey.50',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'grey.100',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                  }}
                  sx={{ minWidth: 250 }}
                />
              </Box>

              {/* Search Results Dropdown */}
              <Popper
                open={searchOpen && searchResults.length > 0}
                anchorEl={document.querySelector('input[placeholder="Search blogs..."]')}
                placement="bottom-start"
                style={{ zIndex: 1300, width: '100%' }}
                transition
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper
                      elevation={8}
                      sx={{
                        mt: 1,
                        maxHeight: 400,
                        overflow: 'auto',
                        width: '100%',
                        minWidth: 300,
                      }}
                    >
                      <List>
                        {searchResults.map((blog) => (
                          <ListItemButton
                            key={blog._id}
                            onClick={() => handleSearchResultClick(blog)}
                            sx={{
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'grey.50',
                              },
                            }}
                          >
                            <ListItemIcon>
                              <ArticleIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={blog.title}
                              secondary={`${blog.category} • ${blog.author?.firstName} ${blog.author?.lastName}`}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: 500,
                              }}
                              secondaryTypographyProps={{
                                variant: 'caption',
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                color="inherit"
                onClick={toggleDarkMode}
                sx={{ ml: 1 }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    src={user.avatar}
                  >
                    {user.firstName?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{ textTransform: 'none' }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            background: 'linear-gradient(135deg, #D2B48C 0%, #DEB887 100%)',
            color: 'white',
          },
        }}
      >
        {drawer}
      </Drawer>

      {renderMenu}
    </>
  );
};

export default Navbar; 
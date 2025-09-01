import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Person as PersonIcon,
  Schedule as PendingIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

const AdminPanel = () => {
  const { user } = useAuth();
  const { darkMode } = useAppTheme();
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingBlogs();
    }
  }, [user]);

  const fetchPendingBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs/admin/pending');
      setPendingBlogs(response.data.pending);
    } catch (error) {
      setError('Failed to fetch pending blogs');
      console.error('Fetch pending blogs error:', error);
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Breww-it</title>
        <meta name="description" content="Admin panel for reviewing blog submissions" />
      </Helmet>

      <Container sx={{ py: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: '1200px',
            mx: 'auto',
            background: darkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: darkMode ? '1px solid #404040' : '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                mr: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Admin Panel
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review and manage pending blog submissions
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingIcon sx={{ mr: 1 }} />
              Pending Reviews ({pendingBlogs.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingBlogs.length === 0 ? (
            <Alert severity="info">
              No pending blog submissions to review.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {pendingBlogs.map((blog) => (
                <Grid item xs={12} md={6} key={blog._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: darkMode ? '#2a2a2a' : '#f8f9fa',
                      border: darkMode ? '1px solid #404040' : '1px solid #e0e0e0',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {blog.author?.firstName?.[0] || <PersonIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {blog.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            by {blog.author?.firstName} {blog.author?.lastName}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {blog.excerpt || blog.content.substring(0, 150)}...
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                          label={blog.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                        {blog.tags?.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                        {blog.tags?.length > 3 && (
                          <Chip label={`+${blog.tags.length - 3}`} size="small" />
                        )}
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        Submitted: {formatDate(blog.createdAt)}
                      </Typography>

                      {blog.isPrivate && (
                        <Chip 
                          label="Private" 
                          size="small" 
                          color="warning" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                      >
                        View & Review
                      </Button>
                      
                      <Chip
                        label={blog.status?.toUpperCase() || 'PENDING'}
                        color={
                          blog.status === 'published' ? 'success' :
                          blog.status === 'pending' ? 'warning' :
                          blog.status === 'rejected' ? 'error' : 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>


    </>
  );
};

export default AdminPanel; 
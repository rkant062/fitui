import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as PendingIcon,
  CheckCircle as PublishedIcon,
  Cancel as RejectedIcon,
  Drafts as DraftIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useAppTheme();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, blog: null });

  useEffect(() => {
    if (user) {
      fetchUserBlogs();
    }
  }, [user]);

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/my-blogs');
      setBlogs(response.data.blogs);
    } catch (error) {
      setError('Failed to fetch your blogs');
      console.error('Fetch user blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!deleteDialog.blog) return;

    try {
      await api.delete(`/blogs/${deleteDialog.blog._id}`);
      setBlogs(prev => prev.filter(blog => blog._id !== deleteDialog.blog._id));
      setDeleteDialog({ open: false, blog: null });
    } catch (error) {
      setError('Failed to delete blog');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <DraftIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'published':
        return <PublishedIcon />;
      case 'rejected':
        return <RejectedIcon />;
      default:
        return <DraftIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending':
        return 'warning';
      case 'published':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Pending Review';
      case 'published':
        return 'Published';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Drafts
        return blog.status === 'draft';
      case 2: // Pending
        return blog.status === 'pending';
      case 3: // Published
        return blog.status === 'published';
      case 4: // Rejected
        return blog.status === 'rejected';
      default:
        return true;
    }
  });

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Please log in to view your dashboard.</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Breww-it</title>
        <meta name="description" content="Manage your blog posts and profile" />
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mr: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DashboardIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your blog posts and track their status
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/submit-blog')}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                },
              }}
            >
              Create New Blog
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`All (${blogs.length})`} />
              <Tab label={`Drafts (${blogs.filter(b => b.status === 'draft').length})`} />
              <Tab label={`Pending (${blogs.filter(b => b.status === 'pending').length})`} />
              <Tab label={`Published (${blogs.filter(b => b.status === 'published').length})`} />
              <Tab label={`Rejected (${blogs.filter(b => b.status === 'rejected').length})`} />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredBlogs.length === 0 ? (
            <Alert severity="info">
              {activeTab === 0 
                ? "You haven't created any blog posts yet. Click 'Create New Blog' to get started!"
                : `No ${getStatusText(filteredBlogs[0]?.status || 'blogs')} found.`
              }
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredBlogs.map((blog) => (
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
                        <Chip
                          icon={getStatusIcon(blog.status)}
                          label={getStatusText(blog.status)}
                          color={getStatusColor(blog.status)}
                          size="small"
                          sx={{ mr: 2 }}
                        />
                        {blog.isPrivate && (
                          <Chip label="Private" size="small" color="warning" />
                        )}
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {blog.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {blog.excerpt || blog.content.substring(0, 100)}...
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                          label={blog.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                        {blog.tags?.slice(0, 2).map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                        {blog.tags?.length > 2 && (
                          <Chip label={`+${blog.tags.length - 2}`} size="small" />
                        )}
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(blog.createdAt)}
                        {blog.publishedAt && (
                          <span> • Published: {formatDate(blog.publishedAt)}</span>
                        )}
                      </Typography>

                      {blog.status === 'published' && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Views: {blog.views || 0} • Likes: {blog.likes?.length || 0}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Box>
                        {blog.status === 'published' && (
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/submit-blog?edit=${blog._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, blog })}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, blog: null })}
      >
        <DialogTitle>Delete Blog</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.blog?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, blog: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteBlog} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard; 
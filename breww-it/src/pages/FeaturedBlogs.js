import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BlogCard from '../components/BlogCard';

const FeaturedBlogs = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs/featured');
      setFeatured(response.data.featured);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      setError('Failed to load featured blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Featured Blogs - breww&read</title>
        <meta name="description" content="Discover our featured blog posts and stories" />
      </Helmet>

      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
          >
            Back to Home
          </Button>

          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Featured Stories
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Discover our most popular and engaging blog posts
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {featured.length === 0 ? (
          <Alert severity="info">
            No featured blogs available at the moment. Check back later!
          </Alert>
        ) : (
          <Grid 
            container 
            spacing={3}
            sx={{
              '& .MuiGrid-item': {
                display: 'flex',
              }
            }}
          >
            {featured.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <BlogCard blog={blog} featured />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default FeaturedBlogs; 
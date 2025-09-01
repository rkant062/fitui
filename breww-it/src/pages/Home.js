import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Skeleton,
  Tabs,
  Tab,
  Pagination,
  Alert,
} from '@mui/material';
import api from '../utils/api';
import BlogCard from '../components/BlogCard';
import WeeklyBrew from '../components/WeeklyBrew';
import FutureModules from '../components/FutureModules';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
  });

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  const [activeTab, setActiveTab] = useState(category || 'all');

  useEffect(() => {
    fetchBlogs();
    fetchFeatured();
  }, [category, search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(category && { category }),
        ...(search && { search }),
      });

      const response = await api.get(`/blogs?${params}`);
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const response = await api.get('/blogs/featured');
      setFeatured(response.data.featured);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ category: newValue === 'all' ? '' : newValue, page: 1 });
  };

  const handlePageChange = (event, value) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: value });
  };

  // Show loading skeleton only on initial load
  if (loading && blogs.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        {/* Hero Section Skeleton */}
        {!category && !search && (
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={40} sx={{ mb: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" height={48} sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {[...Array(3)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ height: 500, width: '100%' }}>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" height={32} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={20} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* Category Tabs Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={48} />
        </Box>

        {/* Blogs Grid Skeleton */}
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: 450, width: '100%' }}>
                <Skeleton variant="rectangular" height={180} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>breww&read - Discover Amazing Stories</title>
        <meta name="description" content="Explore the latest stories in coffee culture, travel, tech, and lifestyle. Join our community of writers and readers." />
        <meta name="keywords" content="blog, coffee, travel, tech, lifestyle, stories, writing, breww&read" />
      </Helmet>

      <Container sx={{ py: 4 }}>
        {/* Hero Section */}
        {!category && !search && (
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome to <span className="brand-logo">breww&read</span>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Discover amazing stories from around the world
            </Typography>
            
            {/* This Week's Brew Section */}
            <WeeklyBrew />
            
            {/* Featured Blogs */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Featured Stories
              </Typography>
              {featured.length > 0 ? (
                <Grid 
                  container 
                  spacing={3}
                  sx={{
                    '& .MuiGrid-item': {
                      display: 'flex',
                    }
                  }}
                >
                  {featured.slice(0, 3).map((blog) => (
                    <Grid item xs={12} sm={6} md={4} key={blog._id}>
                      <BlogCard blog={blog} featured />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {[...Array(3)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: 500, width: '100%' }}>
                        <Skeleton variant="rectangular" height={200} />
                        <CardContent>
                          <Skeleton variant="text" height={32} />
                          <Skeleton variant="text" height={20} />
                          <Skeleton variant="text" height={20} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        )}

        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All" value="all" />
            <Tab label="Travel" value="travel" />
            <Tab label="Tech" value="tech" />
            <Tab label="Trivia" value="trivia" />
            <Tab label="Coffee & Culture" value="Coffee & Culture" />
            <Tab label="Mind Brew" value="Mind Brew" />
            <Tab label="Local Roasts" value="Local Roasts" />
            <Tab label="Breww Wanderer" value="Breww Wanderer" />
            <Tab label="Creator's Corner" value="Creator's Corner" />
            <Tab label="Start Something" value="Start Something" />
          </Tabs>
          {loading && blogs.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Typography variant="caption" color="text.secondary">
                Loading {activeTab === 'all' ? 'all' : activeTab} posts...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Search Results Alert */}
        {search && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Search results for: <strong>"{search}"</strong>
            <Button
              size="small"
              onClick={() => setSearchParams({})}
              sx={{ ml: 2 }}
            >
              Clear Search
            </Button>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Blogs Grid */}
        <Box sx={{ position: 'relative' }}>
          {loading && blogs.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              </Box>
            </Box>
          )}
          
          <Grid 
            container 
            spacing={3}
            sx={{
              '& .MuiGrid-item': {
                display: 'flex',
              }
            }}
          >
            {blogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={blog._id}>
                <BlogCard blog={blog} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Empty State */}
        {!loading && blogs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {search ? 'No blogs found for your search' : 'No blogs available'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {search 
                ? 'Try adjusting your search terms'
                : 'Check back later for new content'
              }
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.total}
              page={pagination.current}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}

        {/* Future Modules Section - Only show on home page */}
        {!category && !search && <FutureModules />}
      </Container>
    </>
  );
};

export default Home; 
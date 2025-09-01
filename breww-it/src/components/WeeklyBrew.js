import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Rating,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Badge,
} from '@mui/material';
import {
  Article as ArticleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Directions as DirectionsIcon,
  Wifi as WifiIcon,
  LocalCafe as CafeIcon,
  Coffee as CoffeeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Recommend as RecommendIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const WeeklyBrew = () => {
  const [weeklyBrew, setWeeklyBrew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCafeIndex, setCurrentCafeIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [trendingNews, setTrendingNews] = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isNewsHovered, setIsNewsHovered] = useState(false);

  const fetchTrendingNews = async () => {
    try {
      const response = await api.get('/blogs/trending-news');
      if (response.data.success) {
        setTrendingNews(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trending news:', error);
      // Set fallback data
      setTrendingNews([
        {
          id: 1,
          title: "Coffee Culture Trends 2024",
          summary: "Discover the latest trends shaping the global coffee industry.",
          image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
          source: "Coffee Daily",
          publishedAt: new Date(),
          category: "Trends",
          readTime: "3 min read",
          trendingScore: 95
        }
      ]);
    }
  };

  useEffect(() => {
    fetchWeeklyBrew();
    fetchTrendingNews();
  }, []);

  // Auto-slideshow effect for cafes
  useEffect(() => {
    if (weeklyBrew?.nearbyCafes?.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentCafeIndex((prev) => (prev + 1) % weeklyBrew.nearbyCafes.length);
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [weeklyBrew?.nearbyCafes?.length, isHovered]);

  // Auto-slideshow effect for news
  useEffect(() => {
    if (trendingNews.length > 1 && !isNewsHovered) {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % trendingNews.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [trendingNews.length, isNewsHovered]);

  const fetchWeeklyBrew = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/blogs/weekly-brew');
      setWeeklyBrew(response.data);
    } catch (error) {
      console.error('Error fetching weekly brew:', error);
      setWeeklyBrew({
        featuredArticle: {
          _id: 'error-fallback',
          title: "Welcome to breww&read!",
          slug: "welcome-to-breww-read",
          excerpt: "We're brewing up some amazing content for you. Check back soon for our first stories!",
          category: "Coffee & Culture",
          author: {
            firstName: "The",
            lastName: "Team",
            username: "brewwread",
            avatar: ""
          },
          createdAt: new Date(),
          isPlaceholder: true
        },
        nearbyCafes: [
          {
            name: "Blue Bottle Coffee",
            address: "123 Main St, Downtown",
            distance: "0.3 km",
            rating: 4.8,
            specialties: ["Single Origin", "Cold Brew", "Pastries"],
            hours: "6:00 AM - 7:00 PM",
            vibe: "Modern & Minimalist"
          },
          {
            name: "The Roasted Bean",
            address: "456 Arts District Blvd",
            distance: "0.7 km", 
            rating: 4.6,
            specialties: ["Artisan Roasts", "Espresso", "Local Pastries"],
            hours: "7:00 AM - 6:00 PM",
            vibe: "Cozy & Artistic"
          },
          {
            name: "Café Mornings",
            address: "789 Riverside Ave",
            distance: "1.2 km",
            rating: 4.5,
            specialties: ["Pour Over", "Breakfast", "WiFi Friendly"],
            hours: "6:30 AM - 8:00 PM", 
            vibe: "Work-Friendly"
          },
          {
            name: "Brew & Books",
            address: "321 Library Square",
            distance: "1.8 km",
            rating: 4.7,
            specialties: ["Reading Nook", "Quiet Space", "Book Pairings"],
            hours: "8:00 AM - 9:00 PM",
            vibe: "Quiet & Literary"
          }
        ],
        cafeSpotlight: {
          name: "Blue Bottle Coffee",
          address: "123 Main St, Downtown",
          distance: "0.3 km",
          rating: 4.8,
          specialties: ["Single Origin", "Cold Brew", "Pastries"],
          hours: "6:00 AM - 7:00 PM",
          vibe: "Modern & Minimalist",
          description: "A modern coffee experience with single-origin beans and minimalist design"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#8B4513' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!weeklyBrew) return null;

  const { featuredArticle, nearbyCafes = [], cafeSpotlight } = weeklyBrew;

  const nextCafe = () => {
    setCurrentCafeIndex((prev) => (prev + 1) % nearbyCafes.length);
  };

  const prevCafe = () => {
    setCurrentCafeIndex((prev) => (prev - 1 + nearbyCafes.length) % nearbyCafes.length);
  };

  const nextNews = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % trendingNews.length);
  };

  const prevNews = () => {
    setCurrentNewsIndex((prev) => (prev - 1 + trendingNews.length) % trendingNews.length);
  };

  // Find the best rated cafe for the recommended badge
  const bestCafe = nearbyCafes.length > 0 ? nearbyCafes.reduce((best, current) => 
    current.rating > best.rating ? current : best
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #faf8f5 0%, #f5f1eb 100%)',
          borderRadius: 4,
          border: '1px solid rgba(139, 69, 19, 0.1)',
          mb: 4,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 600,
              color: '#8B4513',
              mb: 1,
            }}
          >
            This Week's Brew ☕
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#6B5B73',
              opacity: 0.8,
              fontStyle: 'italic',
            }}
          >
            Curated content and local coffee spots for your perfect brew moment
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Featured Article */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(139, 69, 19, 0.1)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ArticleIcon sx={{ color: '#8B4513', mr: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 600,
                        color: '#8B4513',
                      }}
                    >
                      💬 Featured Article
                    </Typography>
                  </Box>

                  {featuredArticle.isPlaceholder ? (
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
                        {featuredArticle.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6B5B73', mb: 2 }}>
                        {featuredArticle.excerpt}
                      </Typography>
                      <Chip
                        label={featuredArticle.category}
                        sx={{
                          backgroundColor: 'rgba(139, 69, 19, 0.1)',
                          color: '#8B4513',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  ) : (
                    <Link
                      to={`/blog/${featuredArticle.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
                        {featuredArticle.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#6B5B73', mb: 2 }}>
                        {featuredArticle.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={featuredArticle.author.avatar}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        >
                          {featuredArticle.author.firstName[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: '#8B4513', fontWeight: 500 }}>
                          by {featuredArticle.author.firstName} {featuredArticle.author.lastName}
                        </Typography>
                      </Box>
                      <Chip
                        label={featuredArticle.category}
                        sx={{
                          backgroundColor: 'rgba(139, 69, 19, 0.1)',
                          color: '#8B4513',
                          fontWeight: 500,
                        }}
                      />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Café Spotlight */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card
                elevation={0}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                  height: '100%',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(139, 69, 19, 0.1)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                  },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Recommended Badge */}
                {nearbyCafes.length > 0 && nearbyCafes[currentCafeIndex] && nearbyCafes[currentCafeIndex].name === "Blue Bottle Coffee" && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                    }}
                  >
                    <Chip
                      icon={<RecommendIcon />}
                      label="Recommended"
                      size="small"
                      sx={{
                        backgroundColor: '#FF6B35',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: 'white',
                          fontSize: '0.8rem',
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Navigation Buttons */}
                {nearbyCafes.length > 1 && (
                  <>
                    <IconButton
                      onClick={prevCafe}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#8B4513',
                        zIndex: 2,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: 'rgba(139, 69, 19, 0.1)',
                        },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={nextCafe}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#8B4513',
                        zIndex: 2,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: 'rgba(139, 69, 19, 0.1)',
                        },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
                <CardContent sx={{ p: 2, pt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CafeIcon sx={{ color: '#8B4513', mr: 1 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Playfair Display, serif',
                          fontWeight: 600,
                          color: '#8B4513',
                        }}
                      >
                        🌍 Café Spotlight
                      </Typography>
                    </Box>
                    {nearbyCafes.length > 1 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#8B4513', opacity: 0.7 }}>
                          {currentCafeIndex + 1} of {nearbyCafes.length}
                        </Typography>
                        {!isHovered && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#8B4513',
                              opacity: 0.6,
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 0.6 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0.6 },
                              },
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>

                  {nearbyCafes.length > 0 ? (
                    <motion.div
                      key={currentCafeIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50' }}>
                        {nearbyCafes[currentCafeIndex].name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ color: '#8B4513', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#6B5B73' }}>
                          {nearbyCafes[currentCafeIndex].address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StarIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                        <Rating value={nearbyCafes[currentCafeIndex].rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ color: '#6B5B73', ml: 1 }}>
                          {nearbyCafes[currentCafeIndex].rating} • {nearbyCafes[currentCafeIndex].distance}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#6B5B73', mb: 2, fontStyle: 'italic' }}>
                        {nearbyCafes[currentCafeIndex].vibe}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {nearbyCafes[currentCafeIndex].specialties?.map((specialty, idx) => (
                          <Chip
                            key={idx}
                            label={specialty}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 69, 19, 0.1)',
                              color: '#8B4513',
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ color: '#8B4513', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: '#6B5B73' }}>
                            {nearbyCafes[currentCafeIndex].hours}
                          </Typography>
                        </Box>
                        <Tooltip title="Get Directions">
                          <IconButton size="small" sx={{ color: '#8B4513' }}>
                            <DirectionsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </motion.div>
                  ) : (
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50' }}>
                        {cafeSpotlight.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ color: '#8B4513', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#6B5B73' }}>
                          {cafeSpotlight.address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StarIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                        <Rating value={cafeSpotlight.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ color: '#6B5B73', ml: 1 }}>
                          {cafeSpotlight.rating} • {cafeSpotlight.distance}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#6B5B73', mb: 2 }}>
                        {cafeSpotlight.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {cafeSpotlight.specialties?.map((specialty, index) => (
                          <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 69, 19, 0.1)',
                              color: '#8B4513',
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ color: '#8B4513', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: '#6B5B73' }}>
                            {cafeSpotlight.hours}
                          </Typography>
                        </Box>
                        <Tooltip title="Get Directions">
                          <IconButton size="small" sx={{ color: '#8B4513' }}>
                            <DirectionsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </CardContent>

                {/* Dot Indicators */}
                {nearbyCafes.length > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, gap: 1 }}>
                    {nearbyCafes.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => setCurrentCafeIndex(index)}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: index === currentCafeIndex ? '#8B4513' : 'rgba(139, 69, 19, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: '#8B4513',
                            transform: 'scale(1.2)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Card>
            </motion.div>
          </Grid>

          {/* Spill the Beans - Trending News */}
          <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card
              elevation={0}
              onMouseEnter={() => setIsNewsHovered(true)}
              onMouseLeave={() => setIsNewsHovered(false)}
              sx={{
                height: '100%',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(139, 69, 19, 0.1)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Navigation Buttons */}
              {trendingNews.length > 1 && (
                <>
                  <IconButton
                    onClick={prevNews}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#8B4513',
                      zIndex: 2,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={nextNews}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#8B4513',
                      zIndex: 2,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </>
              )}

              <CardContent sx={{ p: 2, pt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArticleIcon sx={{ color: '#8B4513', mr: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 600,
                        color: '#2C3E50',
                        background: 'linear-gradient(45deg, #8B4513, #A0522D)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      ☕ Spill the Beans
                    </Typography>
                  </Box>
                  {trendingNews.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#8B4513', opacity: 0.7 }}>
                        {currentNewsIndex + 1} of {trendingNews.length}
                      </Typography>
                      {!isNewsHovered && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#8B4513',
                            opacity: 0.6,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 0.6 },
                              '50%': { opacity: 1 },
                              '100%': { opacity: 0.6 },
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {trendingNews.length > 0 ? (
                  <motion.div
                    key={currentNewsIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                      {/* News Image */}
                      <Box
                        sx={{
                          width: 120,
                          height: 80,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundImage: `url(${trendingNews[currentNewsIndex]?.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />

                      {/* News Content */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', lineHeight: 1.3 }}>
                          {trendingNews[currentNewsIndex]?.title}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: '#6B5B73', mb: 2, lineHeight: 1.5 }}>
                          {trendingNews[currentNewsIndex]?.summary}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={trendingNews[currentNewsIndex]?.category}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(139, 69, 19, 0.1)',
                              color: '#8B4513',
                              fontSize: '0.7rem',
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#8B4513', opacity: 0.7 }}>
                            {trendingNews[currentNewsIndex]?.source}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B5B73' }}>
                            {trendingNews[currentNewsIndex]?.readTime}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: '#8B4513', fontWeight: 600 }}>
                              {trendingNews[currentNewsIndex]?.trendingScore}% trending
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                ) : (
                  <Typography variant="body2" sx={{ color: '#6B5B73', fontStyle: 'italic' }}>
                    Loading trending news...
                  </Typography>
                )}
              </CardContent>

              {/* Dot Indicators */}
              {trendingNews.length > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, gap: 1 }}>
                  {trendingNews.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentNewsIndex(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: index === currentNewsIndex ? '#8B4513' : 'rgba(139, 69, 19, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#8B4513',
                          transform: 'scale(1.2)',
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Card>
          </motion.div>
          </Grid>
        </Grid>

      </Paper>
    </motion.div>
  );
};

export default WeeklyBrew;
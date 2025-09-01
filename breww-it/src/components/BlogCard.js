import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip,
  Button,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const BlogCard = ({ blog, featured = false }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'travel':
        return '#2ecc71';
      case 'tech':
        return '#3498db';
      case 'trivia':
        return '#e74c3c';
      case 'Coffee & Culture':
        return '#8B4513';
      case 'Mind Brew':
        return '#6B46C1';
      case 'Local Roasts':
        return '#DC2626';
      case 'Breww Wanderer':
        return '#059669';
      case 'Creator\'s Corner':
        return '#EA580C';
      case 'Start Something':
        return '#7C3AED';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card
        sx={{
          height: featured ? 500 : 450,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-4px)',
          },
        }}
        component={Link}
        to={`/blog/${blog.slug}`}
        style={{ textDecoration: 'none' }}
      >
        <CardMedia
          component="img"
          height={featured ? 200 : 180}
          image={blog.featuredImage || 'https://via.placeholder.com/400x200?text=Blog+Image'}
          alt={blog.title}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Category, Badge and Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={blog.category?.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: getCategoryColor(blog.category),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
              {blog.isNewPost && (
                <Chip
                  label="Just Brewed!"
                  size="small"
                  sx={{
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant={featured ? "h5" : "h6"}
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {blog.title}
          </Typography>

          {/* Excerpt */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
              flexGrow: 1,
            }}
          >
            {blog.excerpt}
          </Typography>

          {/* Author and Engagement */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={blog.author?.avatar}
                sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
              >
                {blog.author?.firstName?.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {blog.author?.firstName} {blog.author?.lastName}
              </Typography>
            </Box>

            {/* Engagement Metrics */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={`Brew-Length Read: ${blog.readTime} min`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {blog.readTime} min ☕
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={`${blog.views || 0} views`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {blog.views || 0}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={`${blog.likes?.length || 0} likes`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FavoriteIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: blog.isLiked ? 'error.main' : 'text.secondary' 
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {blog.likes?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={`${blog.comments?.length || 0} comments`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {blog.comments?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Box>

          {/* Brew Mood and Pairs Well With Tags */}
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap', pt: 1 }}>
            {blog.brewMood && (
              <Chip
                label={`Brew Mood: ${blog.brewMood}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.6rem', 
                  height: 20,
                  borderColor: '#8B4513',
                  color: '#8B4513',
                  '& .MuiChip-label': {
                    fontWeight: 500,
                  }
                }}
              />
            )}
            {blog.pairsWellWith && (
              <Chip
                label={`Pairs Well With: ${blog.pairsWellWith}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.6rem', 
                  height: 20,
                  borderColor: '#6B46C1',
                  color: '#6B46C1',
                  '& .MuiChip-label': {
                    fontWeight: 500,
                  }
                }}
              />
            )}
          </Box>

          {/* Regular Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {blog.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.6rem', height: 20 }}
                />
              ))}
              {blog.tags.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{blog.tags.length - 2} more
                </Typography>
              )}
            </Box>
          )}

          {/* Engagement Button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FavoriteIcon />}
              sx={{
                borderColor: '#8B4513',
                color: '#8B4513',
                fontSize: '0.7rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#A0522D',
                  backgroundColor: 'rgba(139, 69, 19, 0.04)',
                },
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle engagement
                console.log('Pour some love clicked!');
              }}
            >
              ❤️ Pour Some Love
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlogCard; 
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Alert,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import ReadingAnimation from '../components/ReadingAnimation';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showReadingAnimation, setShowReadingAnimation] = useState(false);
  const [currentReadingWord, setCurrentReadingWord] = useState(0);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${slug}`);
      setBlog(response.data);
      // Check if user has liked this blog
      if (isAuthenticated && user) {
        setIsLiked(response.data.likes?.includes(user._id));
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Blog not found or error loading content');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to like this blog',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await api.post(`/blogs/${blog._id}/like`);
      setBlog(prev => ({
        ...prev,
        likes: response.data.likes
      }));
      setIsLiked(!isLiked);
      setSnackbar({
        open: true,
        message: isLiked ? 'Removed from likes' : 'Added to likes',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error liking blog:', error);
      setSnackbar({
        open: true,
        message: 'Failed to like blog. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to comment',
        severity: 'warning'
      });
      return;
    }
    
    try {
      const response = await api.post(`/blogs/${blog._id}/comment`, {
        content: comment
      });
      setBlog(prev => ({
        ...prev,
        comments: response.data.comments
      }));
      setComment('');
      setSnackbar({
        open: true,
        message: 'Comment added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add comment. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleApprove = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setSnackbar({
        open: true,
        message: 'Only admins can approve blogs',
        severity: 'warning'
      });
      return;
    }

    try {
      setApproving(true);
      const response = await api.put(`/blogs/${blog._id}/approve`);
      setBlog(prev => ({
        ...prev,
        status: 'published'
      }));
      setSnackbar({
        open: true,
        message: 'Blog approved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error approving blog:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve blog. Please try again.',
        severity: 'error'
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setSnackbar({
        open: true,
        message: 'Only admins can reject blogs',
        severity: 'warning'
      });
      return;
    }

    try {
      setRejecting(true);
      const response = await api.put(`/blogs/${blog._id}/reject`);
      setBlog(prev => ({
        ...prev,
        status: 'rejected'
      }));
      setSnackbar({
        open: true,
        message: 'Blog rejected successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error rejecting blog:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject blog. Please try again.',
        severity: 'error'
      });
    } finally {
      setRejecting(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'travel':
        return '#2ecc71';
      case 'tech':
        return '#3498db';
      case 'trivia':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseReading = () => {
    setShowReadingAnimation(false);
    setCurrentReadingWord(0);
    // Scroll back to top of content with a slight delay for smooth transition
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 500);
  };

  // Auto-scroll to keep highlighted word visible
  useEffect(() => {
    if (showReadingAnimation && contentRef.current) {
      const highlightedElements = contentRef.current.querySelectorAll('[data-highlighted="true"]');
      if (highlightedElements.length > 0) {
        const highlightedElement = highlightedElements[0];
        const rect = highlightedElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const controlPanelHeight = 100; // Height of control panel + some buffer
        
        // Check if the highlighted word is below the visible area or too close to bottom
        if (rect.bottom > windowHeight - controlPanelHeight || rect.top < 100) {
          setTimeout(() => {
            highlightedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, 100); // Small delay for smoother animation
        }
      }
    }
  }, [currentReadingWord, showReadingAnimation]);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="text" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Blog not found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle || blog.title} - Breww-it</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        <meta name="keywords" content={blog.tags?.join(', ')} />
      </Helmet>

      <Container sx={{ 
        py: 6,
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1200px',
        mx: 'auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
          >
            Back to Home
          </Button>

          {/* Featured Image */}
          {blog.featuredImage && (
            <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <img
                src={blog.featuredImage}
                alt={blog.title}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          )}

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            {/* Category and Date */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip
                label={blog.category?.toUpperCase()}
                size="medium"
                sx={{
                  backgroundColor: getCategoryColor(blog.category),
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatDate(blog.createdAt)}
              </Typography>
            </Box>

            {/* Title */}
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {blog.title}
            </Typography>

            {/* Excerpt */}
            {blog.excerpt && (
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                {blog.excerpt}
              </Typography>
            )}

            {/* Author Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={blog.author?.avatar}
                sx={{ width: 48, height: 48 }}
              >
                {blog.author?.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {blog.author?.firstName} {blog.author?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {blog.author?.bio || 'Blog author'}
                </Typography>
              </Box>
            </Box>

            {/* Engagement Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Tooltip title={`${blog.views || 0} views`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VisibilityIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {blog.views || 0}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={`${blog.likes?.length || 0} likes`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FavoriteIcon sx={{ color: 'error.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {blog.likes?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={`${blog.comments?.length || 0} comments`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CommentIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {blog.comments?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            {/* Admin Approval Section */}
            {isAuthenticated && user?.role === 'admin' && blog.status === 'pending' && (
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                backgroundColor: '#fff3cd', 
                borderRadius: 2, 
                border: '1px solid #ffeaa7',
                borderLeft: '4px solid #f39c12'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#856404', fontWeight: 600 }}>
                  ⚠️ Pending Approval
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#856404' }}>
                  This blog is waiting for admin approval. Review the content and take action.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleApprove}
                    disabled={approving}
                    sx={{
                      backgroundColor: '#27ae60',
                      '&:hover': {
                        backgroundColor: '#229954',
                      },
                      '&:disabled': {
                        backgroundColor: '#95a5a6',
                      }
                    }}
                  >
                    {approving ? 'Approving...' : 'Approve Blog'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleReject}
                    disabled={rejecting}
                    sx={{
                      backgroundColor: '#e74c3c',
                      '&:hover': {
                        backgroundColor: '#c0392b',
                      },
                      '&:disabled': {
                        backgroundColor: '#95a5a6',
                      }
                    }}
                  >
                    {rejecting ? 'Rejecting...' : 'Reject Blog'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Status Badge for Admins */}
            {isAuthenticated && user?.role === 'admin' && blog.status && (
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={blog.status.toUpperCase()}
                  color={
                    blog.status === 'published' ? 'success' :
                    blog.status === 'pending' ? 'warning' :
                    blog.status === 'rejected' ? 'error' : 'default'
                  }
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Read Button */}
          {!showReadingAnimation && (
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => setShowReadingAnimation(true)}
                sx={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                  '&:hover': {
                    backgroundColor: '#ff5252',
                    boxShadow: '0 6px 25px rgba(255, 107, 107, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Reading
              </Button>
            </Box>
          )}

          {/* Reading Animation Controls */}
          {showReadingAnimation && (
            <ReadingAnimation
              content={blog.content}
              onClose={handleCloseReading}
              onWordChange={setCurrentReadingWord}
            />
          )}

          {/* Content */}
          <Box 
            ref={contentRef}
            sx={{ 
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              position: 'relative',
              pb: showReadingAnimation ? 8 : 0, // Add padding when reading controls are active
              '& .content-paragraph': {
                fontSize: '1.125rem',
                lineHeight: 1.8,
                letterSpacing: '0.01em',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                textAlign: 'justify',
                textJustify: 'inter-word',
              }
            }}
          >
            {(() => {
              const paragraphs = blog.content.split('\n\n');
              let wordCounter = 0;
              
              return paragraphs.map((paragraph, index) => (
                <Typography 
                  key={index} 
                  variant="body1" 
                  className="content-paragraph"
                  sx={{
                    fontSize: '1.125rem',
                    lineHeight: 1.8,
                    letterSpacing: '0.01em',
                    color: '#1a1a1a',
                    mb: 3,
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    '&:first-of-type': {
                      fontSize: '1.25rem',
                      lineHeight: 1.7,
                      color: '#2c3e50',
                      fontWeight: 500,
                    }
                  }}
                >
                  {showReadingAnimation ? (
                    paragraph.split(/\s+/).map((word, wordIndex) => {
                      const isCurrentWord = wordCounter === currentReadingWord;
                      wordCounter++;
                      return (
                        <motion.span
                          key={wordIndex}
                          data-highlighted={isCurrentWord ? "true" : "false"}
                          style={{
                            display: 'inline-block',
                            padding: '2px 4px',
                            margin: '0 1px',
                            borderRadius: '4px',
                            backgroundColor: isCurrentWord ? '#ff6b6b' : 'transparent',
                            transition: 'all 0.3s ease',
                            fontWeight: isCurrentWord ? 700 : 400,
                            fontSize: isCurrentWord ? '1.3rem' : '1.125rem',
                            transform: isCurrentWord ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isCurrentWord 
                              ? '0 0 15px rgba(255, 107, 107, 0.4)' 
                              : 'none',
                          }}
                        >
                          {word}
                        </motion.span>
                      );
                    })
                  ) : (
                    paragraph
                  )}
                </Typography>
              ));
            })()}
          </Box>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {blog.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          {/* Engagement Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Engage with this post
            </Typography>
            
            {/* Like Button */}
            <Button
              variant={isLiked ? "contained" : "outlined"}
              startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              sx={{ mr: 2 }}
            >
              {isLiked ? 'Liked' : 'Like'}
            </Button>
          </Box>

          {/* Comments Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Comments ({blog.comments?.length || 0})
            </Typography>

            {/* Add Comment */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleComment}
                disabled={!comment.trim()}
              >
                Post Comment
              </Button>
            </Box>

            {/* Comments List */}
            {blog.comments && blog.comments.length > 0 ? (
              <List>
                {blog.comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar>
                        {comment.user?.firstName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {comment.user?.firstName} {comment.user?.lastName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {comment.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Box>
        </motion.div>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BlogDetail; 
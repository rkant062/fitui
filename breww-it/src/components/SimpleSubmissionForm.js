import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import api from '../utils/api';

const SimpleSubmissionForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const submitData = {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        category: 'Creator\'s Corner', // Default category for user submissions
        status: 'pending', // All user submissions go to pending for moderation
      };

      await api.post('/blogs', submitData);
      
      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        tags: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit your brew');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        background: 'linear-gradient(135deg, #F5E6D3 0%, #FFF8F0 100%)',
        border: '1px solid #A0522D',
        borderRadius: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ 
          fontFamily: 'Playfair Display, serif',
          color: '#8B4513',
          fontWeight: 600
        }}>
          Submit Your Brew to <span className="brand-logo">breww&read</span> ✍️
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Share your thoughts with the community. All submissions are manually moderated.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thanks for sharing your brew! Your submission is under review and will be published soon.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Your Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="What's your story about?"
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Share your breww thoughts..."
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          required
          multiline
          rows={8}
          placeholder="Write your thoughts here... What's on your mind today?"
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="coffee, thoughts, lifestyle, inspiration"
          helperText="Add tags to help others discover your post"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{
            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
            },
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          {loading ? 'Submitting...' : 'Submit Your Brew'}
        </Button>
      </form>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(139, 69, 19, 0.05)', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Note:</strong> All submissions are reviewed by our team before publishing. 
          We'll notify you once your post is live!
        </Typography>
      </Box>
    </Paper>
  );
};

export default SimpleSubmissionForm;

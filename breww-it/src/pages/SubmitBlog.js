import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Card,
  Divider,
  CircularProgress,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Tag as TagIcon,
  Article as ArticleIcon,
  Link as LinkIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import api from '../utils/api';
import SimpleSubmissionForm from '../components/SimpleSubmissionForm';

const recommendedTags = [
  { label: 'Travel', color: '#FFB3BA', textColor: '#8B0000' },
  { label: 'Tech', color: '#BAE1FF', textColor: '#003366' },
  { label: 'Trivia', color: '#BAFFC9', textColor: '#006600' },
  { label: 'Coffee', color: '#FFE4B5', textColor: '#8B4513' },
  { label: 'Culture', color: '#E6E6FA', textColor: '#4B0082' },
  { label: 'History', color: '#F0E68C', textColor: '#8B6914' },
  { label: 'Science', color: '#98FB98', textColor: '#006400' },
  { label: 'Art', color: '#FFC0CB', textColor: '#8B0000' },
  { label: 'Food', color: '#FFDAB9', textColor: '#8B4513' },
  { label: 'Music', color: '#DDA0DD', textColor: '#4B0082' },
  { label: 'Sports', color: '#90EE90', textColor: '#006400' },
  { label: 'Business', color: '#F5DEB3', textColor: '#8B6914' },
];

const steps = [
  {
    label: 'Content Creation',
    description: 'Write your blog title, content, and add images',
    icon: <ArticleIcon />,
  },
  {
    label: 'Organization',
    description: 'Add category, tags, and SEO settings',
    icon: <TagIcon />,
  },
  {
    label: 'Publishing Settings',
    description: 'Choose visibility and submit for review',
    icon: <SettingsIcon />,
  },
];

const SubmitBlog = () => {
  const { user } = useAuth();
  const { darkMode } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [useSimpleForm, setUseSimpleForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    brewMood: '',
    pairsWellWith: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    isPrivate: false,
    status: 'draft',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagAdd = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Content Creation
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
        }
        if (!formData.content.trim()) {
          newErrors.content = 'Content is required';
        }
        if (formData.content.length < 100) {
          newErrors.content = 'Content must be at least 100 characters';
        }
        break;
      case 1: // Organization
        if (!formData.category) {
          newErrors.category = 'Category is required';
        }
        break;
      case 2: // Publishing Settings
        // No validation needed for this step
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        ...formData,
        status: formData.isPrivate ? 'draft' : 'pending', // Private posts stay as draft, public go to pending
        author: user._id,
      };

      await api.post('/blogs', submitData);
      
      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: [],
        brewMood: '',
        pairsWellWith: '',
        featuredImage: '',
        metaTitle: '',
        metaDescription: '',
        isPrivate: false,
        status: 'draft',
      });
      setErrors({});
      setActiveStep(0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/blogs', {
        ...formData,
        status: 'draft',
        author: user._id,
      });
      
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Please log in to submit a blog post.</Alert>
      </Container>
    );
  }

  // Show simple form if selected
  if (useSimpleForm) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setUseSimpleForm(false)}
            sx={{ mb: 2 }}
          >
            ← Back to Advanced Form
          </Button>
        </Box>
        <SimpleSubmissionForm />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit Blog - breww&read</title>
        <meta name="description" content="Share your story with the world. Submit your blog post to breww&read." />
      </Helmet>

      <Container sx={{ py: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: '1000px',
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
              <ArticleIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Create Your Blog Post
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Follow the steps below to create and submit your blog post
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setUseSimpleForm(true)}
                sx={{
                  borderColor: '#8B4513',
                  color: '#8B4513',
                  '&:hover': {
                    borderColor: '#A0522D',
                    backgroundColor: 'rgba(139, 69, 19, 0.04)',
                  }
                }}
              >
                Use Simple Form Instead
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: activeStep >= index ? '#667eea' : '#e0e0e0',
                        color: activeStep >= index ? 'white' : '#666',
                      }}
                    >
                      {activeStep > index ? <CheckCircleIcon /> : step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {index === 0 && (
                      <Stack spacing={3}>
                        <TextField
                          fullWidth
                          label="Blog Title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          error={!!errors.title}
                          helperText={errors.title}
                          placeholder="Enter a compelling title for your blog post..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '1.25rem',
                              fontWeight: 500,
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Blog Content"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          error={!!errors.content}
                          helperText={errors.content || `${formData.content.length} characters`}
                          multiline
                          rows={12}
                          placeholder="Write your blog content here... Use markdown for formatting."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: 'monospace',
                              fontSize: '1rem',
                              lineHeight: 1.6,
                            },
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Excerpt"
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          multiline
                          rows={3}
                          placeholder="A brief summary of your blog post (optional)"
                          helperText="This will appear in blog previews and search results"
                        />

                        <TextField
                          fullWidth
                          label="Featured Image URL"
                          name="featuredImage"
                          value={formData.featuredImage}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          helperText="Add a featured image URL for your blog post"
                        />
                      </Stack>
                    )}

                    {index === 1 && (
                      <Stack spacing={3}>
                        <FormControl fullWidth error={!!errors.category}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            label="Category"
                          >
                            <MenuItem value="travel">Travel</MenuItem>
                            <MenuItem value="tech">Tech</MenuItem>
                            <MenuItem value="trivia">Trivia</MenuItem>
                            <MenuItem value="Coffee & Culture">Coffee & Culture</MenuItem>
                            <MenuItem value="Mind Brew">Mind Brew</MenuItem>
                            <MenuItem value="Local Roasts">Local Roasts</MenuItem>
                            <MenuItem value="Breww Wanderer">Breww Wanderer</MenuItem>
                            <MenuItem value="Creator's Corner">Creator's Corner</MenuItem>
                            <MenuItem value="Start Something">Start Something</MenuItem>
                          </Select>
                          {errors.category && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                              {errors.category}
                            </Typography>
                          )}
                        </FormControl>

                        {/* Brew Mood and Pairs Well With */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Brew Mood</InputLabel>
                            <Select
                              name="brewMood"
                              value={formData.brewMood}
                              onChange={handleInputChange}
                              label="Brew Mood"
                            >
                              <MenuItem value="">Select a mood</MenuItem>
                              <MenuItem value="Cold Brew">Cold Brew</MenuItem>
                              <MenuItem value="Rainy Day">Rainy Day</MenuItem>
                              <MenuItem value="Jazz">Jazz</MenuItem>
                              <MenuItem value="Morning Energy">Morning Energy</MenuItem>
                              <MenuItem value="Chill">Chill</MenuItem>
                              <MenuItem value="Focused">Focused</MenuItem>
                              <MenuItem value="Creative">Creative</MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl fullWidth>
                            <InputLabel>Pairs Well With</InputLabel>
                            <Select
                              name="pairsWellWith"
                              value={formData.pairsWellWith}
                              onChange={handleInputChange}
                              label="Pairs Well With"
                            >
                              <MenuItem value="">Select an activity</MenuItem>
                              <MenuItem value="Lo-fi">Lo-fi</MenuItem>
                              <MenuItem value="Travel">Travel</MenuItem>
                              <MenuItem value="Short Reads">Short Reads</MenuItem>
                              <MenuItem value="Deep Thoughts">Deep Thoughts</MenuItem>
                              <MenuItem value="Work">Work</MenuItem>
                              <MenuItem value="Study">Study</MenuItem>
                              <MenuItem value="Relaxation">Relaxation</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <TagIcon sx={{ mr: 1 }} />
                            Tags
                          </Typography>
                          
                          {/* Selected Tags */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Selected Tags:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {formData.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  onDelete={() => handleTagRemove(tag)}
                                  size="small"
                                  sx={{
                                    backgroundColor: recommendedTags.find(t => t.label.toLowerCase() === tag.toLowerCase())?.color || '#e0e0e0',
                                    color: recommendedTags.find(t => t.label.toLowerCase() === tag.toLowerCase())?.textColor || '#000000',
                                    '& .MuiChip-deleteIcon': {
                                      color: 'inherit',
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>

                          {/* Tag Input */}
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Add custom tag and press Enter"
                            onKeyPress={handleTagInput}
                            sx={{ mb: 2 }}
                          />

                          {/* Recommended Tags */}
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Recommended Tags:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {recommendedTags.map((tag) => (
                              <Chip
                                key={tag.label}
                                label={tag.label}
                                onClick={() => handleTagAdd(tag.label)}
                                size="small"
                                sx={{
                                  backgroundColor: tag.color,
                                  color: tag.textColor,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: tag.color,
                                    opacity: 0.8,
                                  },
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        <Divider />

                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinkIcon sx={{ mr: 1 }} />
                          SEO Settings
                        </Typography>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            size="small"
                            label="SEO Title"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleInputChange}
                            placeholder="SEO-optimized title (optional)"
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="SEO Description"
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="SEO description for search engines (optional)"
                          />
                        </Stack>
                      </Stack>
                    )}

                    {index === 2 && (
                      <Stack spacing={3}>
                        <Card sx={{ p: 3, background: darkMode ? '#2a2a2a' : '#f8f9fa' }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <VisibilityIcon sx={{ mr: 1 }} />
                            Visibility Settings
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">Choose your blog's visibility:</FormLabel>
                            <RadioGroup
                              name="isPrivate"
                              value={formData.isPrivate}
                              onChange={handleInputChange}
                            >
                              <FormControlLabel
                                value={false}
                                control={<Radio />}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PublicIcon sx={{ mr: 1, color: '#4CAF50' }} />
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        Public
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Submit for admin review and publish to the community
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                              <FormControlLabel
                                value={true}
                                control={<Radio />}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LockIcon sx={{ mr: 1, color: '#FF9800' }} />
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        Private
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Save as draft for your personal use only
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                            </RadioGroup>
                          </FormControl>
                        </Card>

                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Public posts:</strong> Will be reviewed by our admin team before publishing. 
                            You'll be notified once approved or if any changes are needed.
                          </Typography>
                        </Alert>

                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Private posts:</strong> Will be saved as drafts and only visible to you. 
                            You can edit them later and change to public when ready.
                          </Typography>
                        </Alert>
                      </Stack>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : (activeStep === steps.length - 1 ? <SendIcon /> : null)}
                        sx={{
                          background: activeStep === steps.length - 1 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: activeStep === steps.length - 1 
                              ? 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                              : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          },
                        }}
                      >
                        {loading ? 'Submitting...' : (activeStep === steps.length - 1 ? 'Submit for Review' : 'Next')}
                      </Button>
                      {activeStep < steps.length - 1 && (
                        <Button
                          variant="text"
                          onClick={handleSaveDraft}
                          disabled={loading}
                          startIcon={<SaveIcon />}
                        >
                          Save Draft
                        </Button>
                      )}
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message={
          formData.isPrivate 
            ? "Blog saved as draft successfully!" 
            : "Blog submitted for review successfully!"
        }
      />
    </>
  );
};

export default SubmitBlog; 
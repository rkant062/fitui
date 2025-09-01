import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

// Placeholder components for future modules
const CafeFinderTool = () => (
  <Card sx={{ height: '100%', opacity: 0.7 }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Café Finder Tool
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Discover local coffee shops and roasters near you
      </Typography>
      <Chip label="Coming Soon" color="primary" size="small" />
    </CardContent>
  </Card>
);

const BrewTimerTool = () => (
  <Card sx={{ height: '100%', opacity: 0.7 }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <TimerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Brew Timer Tool
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Perfect your coffee brewing with our timer
      </Typography>
      <Chip label="Coming Soon" color="primary" size="small" />
    </CardContent>
  </Card>
);

const UserProfilePages = () => (
  <Card sx={{ height: '100%', opacity: 0.7 }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Writer Profiles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Dedicated pages for our community writers
      </Typography>
      <Chip label="Coming Soon" color="primary" size="small" />
    </CardContent>
  </Card>
);

const MerchIntegration = () => (
  <Card sx={{ height: '100%', opacity: 0.7 }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <ShoppingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Merch Store
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Coffee-themed merchandise and accessories
      </Typography>
      <Chip label="Coming Soon" color="primary" size="small" />
    </CardContent>
  </Card>
);

const GamifiedEngagement = () => (
  <Card sx={{ height: '100%', opacity: 0.7 }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <TrophyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Breww Beans
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Earn points and unlock achievements
      </Typography>
      <Chip label="Coming Soon" color="primary" size="small" />
    </CardContent>
  </Card>
);

const FutureModules = () => {
  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ 
        textAlign: 'center', 
        mb: 4,
        fontFamily: 'Playfair Display, serif',
        color: '#8B4513'
      }}>
        Coming Soon to <span className="brand-logo">breww&read</span> ☕
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ 
        textAlign: 'center', 
        mb: 4,
        maxWidth: 600,
        mx: 'auto'
      }}>
        We're brewing up some exciting new features to enhance your coffee and reading experience.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CafeFinderTool />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <BrewTimerTool />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <UserProfilePages />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MerchIntegration />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GamifiedEngagement />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', opacity: 0.7 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                More Features
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Have ideas? We'd love to hear them!
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  borderColor: '#8B4513',
                  color: '#8B4513',
                  '&:hover': {
                    borderColor: '#A0522D',
                    backgroundColor: 'rgba(139, 69, 19, 0.04)',
                  }
                }}
              >
                Suggest Feature
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FutureModules;

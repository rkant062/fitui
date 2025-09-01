import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  OpenInNew as OpenInNewIcon,
  MusicNote as MusicNoteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Extended Hollow Coves discography
const hollowCovesDiscography = [
  {
    id: "4iVcW5A2soSQrdd6N8Sqy1",
    title: "Coastline",
    album: "Moments",
    year: "2019",
    duration: "3:54",
    mood: "Chill",
    description: "Perfect for a peaceful morning brew",
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/4iVcW5A2soSQrdd6N8Sqy1",
    isPopular: true
  },
  {
    id: "7maJOI3QMu0",
    title: "The Woods",
    album: "Moments",
    year: "2019",
    duration: "3:59",
    mood: "Focused",
    description: "Ideal for deep reading sessions",
    coverArt: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/7maJOI3QMu0",
    isPopular: true
  },
  {
    id: "5X7Zg8ZcZ1Z",
    title: "Blessings",
    album: "Moments",
    year: "2019",
    duration: "3:25",
    mood: "Morning Energy",
    description: "Start your day with gratitude",
    coverArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/5X7Zg8ZcZ1Z",
    isPopular: true
  },
  {
    id: "3X8Zg8ZcZ1Z",
    title: "Home",
    album: "Moments",
    year: "2019",
    duration: "3:18",
    mood: "Chill",
    description: "Cozy vibes for your reading nook",
    coverArt: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/3X8Zg8ZcZ1Z",
    isPopular: false
  },
  {
    id: "2Y9Zg8ZcZ1Z",
    title: "Evermore",
    album: "Moments",
    year: "2019",
    duration: "3:45",
    mood: "Focused",
    description: "Contemplative melodies for quiet moments",
    coverArt: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/2Y9Zg8ZcZ1Z",
    isPopular: false
  },
  {
    id: "1X8Zg8ZcZ1Z",
    title: "Ran Away",
    album: "Moments",
    year: "2019",
    duration: "3:32",
    mood: "Morning Energy",
    description: "Upbeat vibes for productive mornings",
    coverArt: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/1X8Zg8ZcZ1Z",
    isPopular: false
  }
];

const MusicPage = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('All');
  const [playingTrack, setPlayingTrack] = useState(null);

  const moods = ['All', 'Chill', 'Focused', 'Morning Energy'];

  const filteredTracks = selectedMood === 'All' 
    ? hollowCovesDiscography 
    : hollowCovesDiscography.filter(track => track.mood === selectedMood);

  const handlePlayTrack = (track) => {
    setPlayingTrack(track.id);
    // In a real implementation, this would start playing the track
    setTimeout(() => setPlayingTrack(null), 2000); // Simulate play state
  };

  const openInSpotify = (track) => {
    window.open(track.spotifyUrl, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Music - breww&read</title>
        <meta name="description" content="Discover Hollow Coves music perfect for your coffee moments" />
      </Helmet>

      <Container sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
          >
            Back to Home
          </Button>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
              color: '#8B4513'
            }}>
              🎧 Coffee Vibes
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Hollow Coves Collection
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Discover the perfect soundtrack for your coffee moments. These carefully curated tracks 
              from Hollow Coves create the ideal atmosphere for reading, working, or simply enjoying your brew.
            </Typography>
          </Box>

          {/* Mood Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4, flexWrap: 'wrap' }}>
            {moods.map((mood) => (
              <Chip
                key={mood}
                label={mood}
                onClick={() => setSelectedMood(mood)}
                variant={selectedMood === mood ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: selectedMood === mood ? '#8B4513' : 'transparent',
                  color: selectedMood === mood ? 'white' : '#8B4513',
                  borderColor: '#8B4513',
                  '&:hover': {
                    backgroundColor: selectedMood === mood ? '#A0522D' : 'rgba(139, 69, 19, 0.1)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Tracks Grid */}
        <Grid container spacing={3}>
          {filteredTracks.map((track, index) => (
            <Grid item xs={12} sm={6} md={4} key={track.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={track.coverArt}
                      alt={track.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    {track.isPopular && (
                      <Chip
                        label="Popular"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: '#FF6B6B',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    >
                      <IconButton
                        onClick={() => handlePlayTrack(track)}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        {playingTrack === track.id ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {track.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {track.album} • {track.year}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                      {track.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={track.mood}
                        size="small"
                        sx={{
                          backgroundColor: '#8B4513',
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {track.duration}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<OpenInNewIcon />}
                      onClick={() => openInSpotify(track)}
                      sx={{
                        backgroundColor: '#1DB954',
                        '&:hover': {
                          backgroundColor: '#1ed760',
                        },
                      }}
                    >
                      Play on Spotify
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 6, p: 4, backgroundColor: '#F5E6D3', borderRadius: 3 }}>
          <MusicNoteIcon sx={{ fontSize: 48, color: '#8B4513', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: '#8B4513',
            fontWeight: 600
          }}>
            Love the Vibes?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Follow Hollow Coves on Spotify to discover more of their beautiful acoustic music 
            that perfectly complements your coffee moments.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open('https://open.spotify.com/artist/7IA5Zxo9Fk1VsvIdgSl2dt', '_blank')}
            sx={{
              backgroundColor: '#1DB954',
              '&:hover': {
                backgroundColor: '#1ed760',
              },
            }}
          >
            Follow on Spotify
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default MusicPage;

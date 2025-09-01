import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Chip,
  Tooltip,
  Button,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  MusicNote as MusicNoteIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Hollow Coves Spotify tracks
const hollowCovesTracks = [
  {
    id: "4iVcW5A2soSQrdd6N8Sqy1", // Coastline
    title: "Coastline",
    artist: "Hollow Coves",
    album: "Moments",
    duration: "3:54",
    mood: "Chill",
    description: "Perfect for a peaceful morning brew",
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/4iVcW5A2soSQrdd6N8Sqy1"
  },
  {
    id: "7maJOI3QMu0", // The Woods
    title: "The Woods",
    artist: "Hollow Coves",
    album: "Moments",
    duration: "3:59",
    mood: "Focused",
    description: "Ideal for deep reading sessions",
    coverArt: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/7maJOI3QMu0"
  },
  {
    id: "5X7Zg8ZcZ1Z", // Blessings
    title: "Blessings",
    artist: "Hollow Coves",
    album: "Moments",
    duration: "3:25",
    mood: "Morning Energy",
    description: "Start your day with gratitude",
    coverArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/5X7Zg8ZcZ1Z"
  },
  {
    id: "3X8Zg8ZcZ1Z", // Home
    title: "Home",
    artist: "Hollow Coves",
    album: "Moments",
    duration: "3:18",
    mood: "Chill",
    description: "Cozy vibes for your reading nook",
    coverArt: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop",
    spotifyUrl: "https://open.spotify.com/track/3X8Zg8ZcZ1Z"
  }
];

const SpotifyPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpotifyMessage, setShowSpotifyMessage] = useState(false);

  const track = hollowCovesTracks[currentTrack];

  // Handle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause logic would go here
      setIsPlaying(false);
    } else {
      // Show message to open Spotify
      setShowSpotifyMessage(true);
      setTimeout(() => setShowSpotifyMessage(false), 3000);
    }
  };

  // Handle track change
  const changeTrack = (direction) => {
    const newTrack = direction === 'next' 
      ? (currentTrack + 1) % hollowCovesTracks.length
      : (currentTrack - 1 + hollowCovesTracks.length) % hollowCovesTracks.length;
    
    setCurrentTrack(newTrack);
    setIsPlaying(false);
  };

  // Open track in Spotify
  const openInSpotify = () => {
    window.open(track.spotifyUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)', // Spotify green
          color: 'white',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <MusicNoteIcon sx={{ fontSize: 28, mr: 2 }} />
            <Typography variant="h5" sx={{ 
              fontFamily: 'Playfair Display, serif',
              fontWeight: 600,
              flexGrow: 1
            }}>
              🎧 Hollow Coves on Spotify
            </Typography>
          </Box>

          {/* Track Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              component="img"
              src={track.coverArt}
              alt={track.title}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                objectFit: 'cover',
                mr: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {track.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                {track.artist} • {track.album}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={track.mood}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
                <Chip
                  label={track.duration}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Tooltip title="Previous Track">
              <IconButton onClick={() => changeTrack('prev')} sx={{ color: 'white' }}>
                ⏮️
              </IconButton>
            </Tooltip>

            <Tooltip title={isPlaying ? "Pause" : "Play on Spotify"}>
              <IconButton
                onClick={togglePlayPause}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  width: 56,
                  height: 56,
                }}
              >
                {isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Next Track">
              <IconButton onClick={() => changeTrack('next')} sx={{ color: 'white' }}>
                ⏭️
              </IconButton>
            </Tooltip>
          </Box>

          {/* Spotify Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              onClick={openInSpotify}
              startIcon={<OpenInNewIcon />}
              sx={{
                backgroundColor: 'white',
                color: '#1DB954',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Open in Spotify
            </Button>
          </Box>

          {/* Track Description */}
          <Typography variant="body2" sx={{ 
            opacity: 0.8, 
            mb: 2, 
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            {track.description}
          </Typography>

          {/* Playlist Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Track {currentTrack + 1} of {hollowCovesTracks.length} • Hollow Coves Collection
            </Typography>
          </Box>

          {/* Spotify Message */}
          {showSpotifyMessage && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white',
                }
              }}
            >
              Click "Open in Spotify" to start streaming!
            </Alert>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default SpotifyPlayer;

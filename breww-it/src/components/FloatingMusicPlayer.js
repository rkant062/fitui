import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
  Alert,
  Collapse,
  Fab,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  MusicNote as MusicNoteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Using publicly available test audio files
const testPlaylist = [
  {
    id: 1,
    title: "Morning Coffee",
    artist: "Coffee Vibes",
    duration: "0:30",
    streamUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    mood: "Chill",
    description: "Perfect for a peaceful morning brew"
  },
  {
    id: 2,
    title: "Acoustic Dreams",
    artist: "Coffee House Sessions",
    duration: "0:30",
    streamUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    coverArt: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    mood: "Focused",
    description: "Ideal for deep reading sessions"
  },
  {
    id: 3,
    title: "Gentle Awakening",
    artist: "Morning Melodies",
    duration: "0:30",
    streamUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    coverArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    mood: "Morning Energy",
    description: "Start your day with gratitude"
  },
  {
    id: 4,
    title: "Cozy Corner",
    artist: "Home Vibes",
    duration: "0:30",
    streamUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    coverArt: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop",
    mood: "Chill",
    description: "Cozy vibes for your reading nook"
  }
];

const FloatingMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef(null);

  const track = testPlaylist[currentTrack];

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setError(null);
        
        if (audioRef.current.src !== track.streamUrl) {
          audioRef.current.src = track.streamUrl;
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Unable to play this track. This might be due to CORS restrictions or network issues.');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  // Handle track change
  const changeTrack = (direction) => {
    const newTrack = direction === 'next' 
      ? (currentTrack + 1) % testPlaylist.length
      : (currentTrack - 1 + testPlaylist.length) % testPlaylist.length;
    
    setCurrentTrack(newTrack);
    setCurrentTime(0);
    setIsPlaying(false);
    setError(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Handle volume change
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle seek
  const handleSeek = (event, newValue) => {
    setCurrentTime(newValue);
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      changeTrack('next');
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      console.error('Audio error:', e);
      setError('Unable to load this track. This might be due to CORS restrictions or network issues.');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack]);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  if (!isVisible) {
    return (
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #D2B48C 0%, #DEB887 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #DEB887 0%, #D2B48C 100%)',
          },
        }}
        onClick={() => setIsVisible(true)}
      >
        <MusicNoteIcon />
      </Fab>
    );
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 1000,
        width: 350,
        maxHeight: '80vh',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          background: 'linear-gradient(135deg, #D2B48C 0%, #DEB887 100%)',
          color: '#8B4513',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MusicNoteIcon sx={{ fontSize: 24, mr: 1 }} />
              <Typography variant="h6" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
              }}>
                🎧 Coffee Vibes
              </Typography>
            </Box>
            <Box>
              <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                <IconButton 
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ color: 'white', mr: 1 }}
                >
                  {isExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Close Player">
                <IconButton 
                  onClick={() => setIsVisible(false)}
                  sx={{ color: '#8B4513' }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Collapse in={isExpanded} orientation="vertical">
            <Box sx={{ p: 2 }}>
              {/* Error Message */}
              {error && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    color: '#ffcc80',
                    '& .MuiAlert-icon': {
                      color: '#ffcc80',
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Track Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={track.coverArt}
                  alt={track.title}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    objectFit: 'cover',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                    {track.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, lineHeight: 1.2 }}>
                    {track.artist}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      label={track.mood}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#8B4513',
                        fontSize: '0.65rem',
                        height: 18,
                      }}
                    />
                    <Chip
                      label={track.duration}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#8B4513',
                        fontSize: '0.65rem',
                        height: 18,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Loading Indicator */}
              {isLoading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                      }
                    }} 
                  />
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block', textAlign: 'center' }}>
                    Loading...
                  </Typography>
                </Box>
              )}

              {/* Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={currentTime}
                  max={duration || 100}
                  onChange={handleSeek}
                  disabled={!duration}
                  sx={{
                    color: '#8B4513',
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'white',
                      width: 16,
                      height: 16,
                      '&:hover': {
                        boxShadow: '0 0 0 6px rgba(255, 255, 255, 0.16)',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'white',
                      height: 4,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      height: 4,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                    {formatTime(currentTime)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                    {formatTime(duration)}
                  </Typography>
                </Box>
              </Box>

              {/* Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Tooltip title="Previous Track">
                  <IconButton onClick={() => changeTrack('prev')} sx={{ color: 'white' }}>
                    <SkipPreviousIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={isPlaying ? "Pause" : "Play"}>
                  <IconButton
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    sx={{
                      color: '#8B4513',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                      width: 48,
                      height: 48,
                    }}
                  >
                    {isLoading ? (
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        }
                      }} />
                    ) : isPlaying ? (
                      <PauseIcon />
                    ) : (
                      <PlayIcon />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Next Track">
                  <IconButton onClick={() => changeTrack('next')} sx={{ color: 'white' }}>
                    <SkipNextIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Volume Control */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                  <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </Tooltip>
                <Slider
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  sx={{
                    color: '#8B4513',
                    flexGrow: 1,
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'white',
                      width: 14,
                      height: 14,
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'white',
                      height: 3,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      height: 3,
                    },
                  }}
                />
              </Box>

              {/* Track Description */}
              <Typography variant="caption" sx={{ 
                opacity: 0.8, 
                fontStyle: 'italic',
                textAlign: 'center',
                display: 'block',
                lineHeight: 1.3,
              }}>
                {track.description}
              </Typography>

              {/* Playlist Info */}
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                  Track {currentTrack + 1} of {testPlaylist.length}
                </Typography>
              </Box>
            </Box>
          </Collapse>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            preload="metadata"
            style={{ display: 'none' }}
          />
        </Box>
      </Paper>
    </motion.div>
  );
};

export default FloatingMusicPlayer;

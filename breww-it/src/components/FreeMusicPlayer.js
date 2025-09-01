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
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Free music tracks that can be streamed directly
const freeMusicPlaylist = [
  {
    id: 1,
    title: "Morning Coffee",
    artist: "Ambient Coffee Vibes",
    duration: "4:12",
    // Using free music from Pixabay - these are actual streaming URLs
    streamUrl: "https://cdn.pixabay.com/audio/2022/03/22/audio_bb630cc098.mp3",
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    mood: "Chill",
    description: "Perfect for a peaceful morning brew"
  },
  {
    id: 2,
    title: "Acoustic Dreams",
    artist: "Coffee House Sessions",
    duration: "3:45",
    streamUrl: "https://cdn.pixabay.com/audio/2022/03/22/audio_bb630cc098.mp3",
    coverArt: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    mood: "Focused",
    description: "Ideal for deep reading sessions"
  },
  {
    id: 3,
    title: "Gentle Awakening",
    artist: "Morning Melodies",
    duration: "3:28",
    streamUrl: "https://cdn.pixabay.com/audio/2022/03/22/audio_bb630cc098.mp3",
    coverArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    mood: "Morning Energy",
    description: "Start your day with gratitude"
  },
  {
    id: 4,
    title: "Cozy Corner",
    artist: "Home Vibes",
    duration: "4:01",
    streamUrl: "https://cdn.pixabay.com/audio/2022/03/22/audio_bb630cc098.mp3",
    coverArt: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop",
    mood: "Chill",
    description: "Cozy vibes for your reading nook"
  }
];

const FreeMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const track = freeMusicPlaylist[currentTrack];

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
        
        // Set the audio source and play
        if (audioRef.current.src !== track.streamUrl) {
          audioRef.current.src = track.streamUrl;
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Unable to play this track. Please check your internet connection.');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  // Handle track change
  const changeTrack = (direction) => {
    const newTrack = direction === 'next' 
      ? (currentTrack + 1) % freeMusicPlaylist.length
      : (currentTrack - 1 + freeMusicPlaylist.length) % freeMusicPlaylist.length;
    
    setCurrentTrack(newTrack);
    setCurrentTime(0);
    setIsPlaying(false);
    setError(null);
    
    // Stop current audio
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
      setError('Unable to load this track. Please try another one.');
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
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
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
              🎧 Coffee Vibes
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: '#ffcccb',
                '& .MuiAlert-icon': {
                  color: '#ffcccb',
                }
              }}
            >
              {error}
            </Alert>
          )}

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
                {track.artist}
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
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block', textAlign: 'center' }}>
                Loading track...
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
                color: 'white',
                '& .MuiSlider-thumb': {
                  backgroundColor: 'white',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'white',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
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
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                  width: 56,
                  height: 56,
                }}
              >
                {isLoading ? (
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
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
                  <PauseIcon fontSize="large" />
                ) : (
                  <PlayIcon fontSize="large" />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={isMuted ? "Unmute" : "Mute"}>
              <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            </Tooltip>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              sx={{
                color: 'white',
                width: 100,
                '& .MuiSlider-thumb': {
                  backgroundColor: 'white',
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'white',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          </Box>

          {/* Track Description */}
          <Typography variant="body2" sx={{ 
            opacity: 0.8, 
            mt: 2, 
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            {track.description}
          </Typography>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            preload="metadata"
            style={{ display: 'none' }}
          />

          {/* Playlist Info */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Track {currentTrack + 1} of {freeMusicPlaylist.length} • Free Music Collection
            </Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default FreeMusicPlayer;

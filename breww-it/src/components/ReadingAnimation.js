import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Speed as SpeedIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ReadingAnimation = ({ content, onClose, onWordChange }) => {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-start
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [speed, setSpeed] = useState(350); // Default to Normal speed
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate reading time
  const readingTimeMinutes = Math.ceil(totalWords / 200); // Average 200 words per minute

  // Speed options
  const speedOptions = [
    { label: 'Slow', value: 500, wpm: 120 },
    { label: 'Normal', value: 350, wpm: 170 },
    { label: 'Fast', value: 250, wpm: 240 },
    { label: 'Very Fast', value: 180, wpm: 330 },
  ];

  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= totalWords - 1) {
          setIsPlaying(false);
          setIsFinished(true);
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
  }, [speed, totalWords]);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    setCurrentWordIndex(0);
    setProgress(0);
    setIsFinished(false);
  }, [stopAnimation]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stopAnimation();
    } else {
      if (currentWordIndex >= totalWords - 1) {
        resetAnimation();
      }
      setIsPlaying(true);
      startAnimation();
    }
  }, [isPlaying, currentWordIndex, totalWords, stopAnimation, startAnimation, resetAnimation]);

  // Handle spacebar
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause]);

  // Update progress and notify parent
  useEffect(() => {
    setProgress((currentWordIndex / totalWords) * 100);
    onWordChange && onWordChange(currentWordIndex);
  }, [currentWordIndex, totalWords, onWordChange]);

  // Auto-start animation when component mounts
  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    }
  }, [isPlaying, startAnimation]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowControls(true);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getHighlightColor = (index) => {
    if (index === currentWordIndex) {
      return '#ff6b6b'; // Flashy red
    }
    return 'transparent';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.floor((currentWordIndex / totalWords) * readingTimeMinutes * 60);
  const totalTime = readingTimeMinutes * 60;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: 2,
        zIndex: 1000,
      }}
    >
      {isFinished ? (
        // Finished reading UI
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography 
            variant="h6" 
            color="white" 
            sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              mb: 1
            }}
          >
            🎉 Reading Complete!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this article!',
                    text: 'I just finished reading this amazing article.',
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  // You could add a snackbar notification here
                }
              }}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              Share
            </Button>
            
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => {
                resetAnimation();
                setIsPlaying(true);
                startAnimation();
              }}
              sx={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#ff5252',
                },
              }}
            >
              Read Again
            </Button>
            
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      ) : (
        // Normal reading controls
        <>
          {/* Progress and Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="white">
                {formatTime(currentTime)} / {formatTime(totalTime)}
              </Typography>
              <Typography variant="body2" color="white">
                {currentWordIndex + 1} / {totalWords} words
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Speed selector */}
              {speedOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  size="small"
                  onClick={() => setSpeed(option.value)}
                  sx={{
                    backgroundColor: speed === option.value ? '#ff6b6b' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: speed === option.value ? '#ff5252' : 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                />
              ))}

              {/* Control buttons */}
              <Tooltip title="Reset">
                <IconButton
                  onClick={resetAnimation}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <StopIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                <IconButton
                  onClick={togglePlayPause}
                  size="small"
                  sx={{ 
                    backgroundColor: isPlaying ? '#ff6b6b' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: isPlaying ? '#ff5252' : 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Close">
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <Typography variant="h6">×</Typography>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ff6b6b',
              },
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ReadingAnimation; 
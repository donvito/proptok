import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoControlsProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  isMuted: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  isYouTube?: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  duration,
  currentTime,
  isPlaying,
  isMuted,
  onSeek,
  onPlayPause,
  onMuteToggle,
  isYouTube = false,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const progress = duration > 0 ? currentTime / duration : 0;
  const displayProgress = isDragging ? dragProgress : progress;


  useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(() => {
        if (showControls) {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => setShowControls(false));
        }
      }, 6000); // Increased to 6 seconds for better visibility

      return () => clearTimeout(timer);
    }
  }, [showControls, fadeAnim, isDragging]);


  const showControlsTemporarily = () => {
    setShowControls(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoTap = () => {
    onPlayPause();
    showControlsTemporarily();
  };

  const progressContainerRef = useRef<View>(null);
  const [containerLayout, setContainerLayout] = useState({ width: 0, x: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to horizontal gestures
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      showControlsTemporarily();
      
      // Get accurate touch position relative to progress bar
      const touchX = evt.nativeEvent.locationX;
      const progressBarWidth = containerLayout.width || SCREEN_WIDTH - 80;
      const newProgress = Math.max(0, Math.min(1, touchX / progressBarWidth));
      setDragProgress(newProgress);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Use gesture state for smoother tracking
      const touchX = evt.nativeEvent.locationX;
      const progressBarWidth = containerLayout.width || SCREEN_WIDTH - 80;
      let newProgress = touchX / progressBarWidth;
      
      // Clamp between 0 and 1
      newProgress = Math.max(0, Math.min(1, newProgress));
      setDragProgress(newProgress);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
      const seekTime = dragProgress * duration;
      onSeek(seekTime);
    },
    onPanResponderTerminate: () => {
      setIsDragging(false);
      const seekTime = dragProgress * duration;
      onSeek(seekTime);
    },
  });

  return (
    <View style={styles.container}>

      {/* Play/Pause button for all videos */}
      <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={50}
          color="white"
        />
      </TouchableOpacity>

      {/* Timeline controls - show/hide based on state */}
      {showControls ? (
        <Animated.View style={[styles.timelineContainer, { opacity: fadeAnim }]}>
          <Text style={styles.timeText}>{formatTime(isDragging ? dragProgress * duration : currentTime)}</Text>
          
          <View 
            ref={progressContainerRef}
            style={styles.progressContainer} 
            {...panResponder.panHandlers}
            onLayout={(event) => {
              const { width, x } = event.nativeEvent.layout;
              setContainerLayout({ width, x });
            }}
          >
            <View style={styles.progressTrack} />
            <View 
              style={[
                styles.progressFill, 
                { width: `${displayProgress * 100}%` }
              ]} 
            />
            <View 
              style={[
                styles.progressThumb, 
                { 
                  left: `${displayProgress * 100}%`,
                  opacity: isDragging ? 1 : 0.8,
                  transform: [{ scale: isDragging ? 1.2 : 1 }]
                }
              ]} 
            />
          </View>
          
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={styles.invisibleTouchArea}
          onPress={handleVideoTap}
          activeOpacity={1}
        />
      )}
      
      {/* Additional tap area for video control */}
      <TouchableOpacity
        style={styles.videoTapArea}
        onPress={handleVideoTap}
        activeOpacity={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 5,
  },
  invisibleTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 2,
  },
  timelineContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  progressContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 10,
    position: 'relative',
    paddingVertical: 10,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  progressFill: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#ff0000',
    borderRadius: 1.5,
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#ff0000',
    borderRadius: 7,
    top: '50%',
    marginTop: -7,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  videoTapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 200,
    zIndex: 5, // Ensure video tap area is above property info but below action buttons
  },
});
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Text,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Property } from '../types/Property';
import { PropertyOverlay } from './PropertyOverlay';
import { YouTubePlayer } from './YouTubePlayer';
import { SearchHeader } from './SearchHeader';
import { isYouTubeUrl } from '../utils/youtube';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoFeedProps {
  properties: Property[];
  allProperties?: Property[];
  onPropertyLike?: (propertyId: string) => void;
  onPropertySave?: (propertyId: string) => void;
  onContactAgent?: (property: Property) => void;
  onSearchChange?: (query: string) => void;
  onFilterPress?: () => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  properties,
  allProperties,
  onPropertyLike,
  onPropertySave,
  onContactAgent,
  onSearchChange,
  onFilterPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const translateY = useRef(new Animated.Value(0)).current;
  const videoRefs = useRef<(Video | null)[]>([]);
  const [youtubePlayingStates, setYoutubePlayingStates] = useState<{ [key: number]: boolean }>({});
  const [youtubeMutedStates, setYoutubeMutedStates] = useState<{ [key: number]: boolean }>({});

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0 && currentIndex === 0) return;
      if (gestureState.dy < 0 && currentIndex === properties.length - 1) return;
      
      translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = SCREEN_HEIGHT * 0.25;
      
      if (gestureState.dy > threshold && currentIndex > 0) {
        // Swipe down - previous video
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCurrentIndex(currentIndex - 1);
          translateY.setValue(0);
        });
      } else if (gestureState.dy < -threshold && currentIndex < properties.length - 1) {
        // Swipe up - next video
        Animated.timing(translateY, {
          toValue: -SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCurrentIndex(currentIndex + 1);
          translateY.setValue(0);
        });
      } else {
        // Snap back
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    // Handle video playback for current index
    videoRefs.current.forEach((ref, index) => {
      if (ref && !isYouTubeUrl(properties[index]?.videoUrl)) {
        if (index === currentIndex) {
          ref.playAsync();
        } else {
          ref.pauseAsync();
        }
      }
    });
    
    // Update YouTube playing states - auto-play current video, pause others
    const newYoutubeStates: { [key: number]: boolean } = {};
    properties.forEach((property, index) => {
      if (isYouTubeUrl(property.videoUrl)) {
        newYoutubeStates[index] = index === currentIndex; // Auto-play current, pause others
      }
    });
    setYoutubePlayingStates(newYoutubeStates);
    
    // Reset isPlaying to true when switching videos for auto-play
    setIsPlaying(true);
  }, [currentIndex, properties]);

  // Initialize muted states for YouTube videos
  useEffect(() => {
    setYoutubeMutedStates(prev => {
      const newMutedStates = { ...prev };
      properties.forEach((property, index) => {
        if (isYouTubeUrl(property.videoUrl) && newMutedStates[index] === undefined) {
          newMutedStates[index] = false; // Start unmuted
        }
      });
      return newMutedStates;
    });
  }, [properties]);


  const handleLike = () => {
    const property = properties[currentIndex];
    onPropertyLike?.(property.id);
  };

  const handleSave = () => {
    const property = properties[currentIndex];
    onPropertySave?.(property.id);
  };

  const handleContactAgent = () => {
    const property = properties[currentIndex];
    onContactAgent?.(property);
  };

  const handleShare = () => {
    Alert.alert('Share Property', 'Share functionality would be implemented here');
  };

  const handleMuteToggle = () => {
    setYoutubeMutedStates(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader 
        onSearchChange={onSearchChange}
        onFilterPress={onFilterPress}
        placeholder="Search properties..."
        showFilterButton={true}
      />
      
      <Animated.View
        style={[
          styles.videoContainer,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {isYouTubeUrl(properties[currentIndex].videoUrl) ? (
          <YouTubePlayer
            url={properties[currentIndex].videoUrl}
            isPlaying={youtubePlayingStates[currentIndex] ?? false}
            shouldAutoPlay={youtubePlayingStates[currentIndex] ?? false}
            muted={youtubeMutedStates[currentIndex] ?? false}
            onMuteToggle={handleMuteToggle}
            style={styles.video}
            onLoad={() => setIsPlaying(true)}
            onError={(error) => console.error('YouTube video error:', error)}
          />
        ) : (
          <Video
            ref={(ref) => (videoRefs.current[currentIndex] = ref)}
            style={styles.video}
            source={{ uri: properties[currentIndex].videoUrl }}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isPlaying}
            onLoad={() => setIsPlaying(true)}
            onError={(error) => console.error('Video error:', error)}
          />
        )}
        

        <PropertyOverlay
          property={properties[currentIndex]}
          onLike={handleLike}
          onSave={handleSave}
          onContactAgent={handleContactAgent}
          onShare={handleShare}
        />
      </Animated.View>

      {/* Progress indicators */}
      <View style={styles.progressContainer}>
        {properties.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1,
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  progressDot: {
    width: 4,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 2,
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
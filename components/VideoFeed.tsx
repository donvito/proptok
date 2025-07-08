import { ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Property } from '../types/Property';
import { isYouTubeUrl } from '../utils/youtube';
import { PropertyOverlay } from './PropertyOverlay';
import { SearchHeader } from './SearchHeader';
import { VideoControls } from './VideoControls';
import { YouTubePlayer } from './YouTubePlayer';

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
  const [videoMutedStates, setVideoMutedStates] = useState<{ [key: number]: boolean }>({});
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);


  // Helper function to pause ALL videos (more aggressive approach)
  const pauseAllVideos = useCallback(() => {
    console.log('Pausing all videos');
    
    // Pause all regular videos
    videoRefs.current.forEach((video, index) => {
      if (video) {
        try {
          video.pauseAsync();
        } catch (error) {
          console.log(`Error pausing video at index ${index}:`, error);
        }
      }
    });

    // Reset all YouTube playing states
    setYoutubePlayingStates({});
    setIsPlaying(false);
  }, []);

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
        pauseAllVideos(); // Use more aggressive pause approach
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Longer delay to ensure all audio stops
          setTimeout(() => {
            setCurrentIndex(currentIndex - 1);
            translateY.setValue(0);
          }, 100);
        });
      } else if (gestureState.dy < -threshold && currentIndex < properties.length - 1) {
        // Swipe up - next video
        pauseAllVideos(); // Use more aggressive pause approach
        Animated.timing(translateY, {
          toValue: -SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Longer delay to ensure all audio stops
          setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
            translateY.setValue(0);
          }, 100);
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
    console.log('Current index changed to:', currentIndex);
    
    // Aggressively handle video playback for current index
    videoRefs.current.forEach((ref, index) => {
      if (ref && !isYouTubeUrl(properties[index]?.videoUrl)) {
        try {
          if (index === currentIndex) {
            ref.playAsync();
          } else {
            ref.pauseAsync();
            // Also reset position to ensure audio stops completely
            ref.setPositionAsync(0);
          }
        } catch (error) {
          console.log(`Error handling video at index ${index}:`, error);
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

  // Cleanup effect to stop all videos when component unmounts
  useEffect(() => {
    return () => {
      console.log('VideoFeed unmounting, stopping all videos');
      pauseAllVideos();
    };
  }, [pauseAllVideos]);

  // Handle tab focus/blur - pause videos when navigating away from video feed tab
  useFocusEffect(
    useCallback(() => {
      console.log('VideoFeed tab focused - videos can play');
      
      return () => {
        console.log('VideoFeed tab blurred - pausing all videos');
        pauseAllVideos();
      };
    }, [pauseAllVideos])
  );

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

  // Initialize muted states for regular videos
  useEffect(() => {
    setVideoMutedStates(prev => {
      const newMutedStates = { ...prev };
      properties.forEach((property, index) => {
        if (!isYouTubeUrl(property.videoUrl) && newMutedStates[index] === undefined) {
          newMutedStates[index] = false; // Start unmuted
        }
      });
      return newMutedStates;
    });
  }, [properties]);


  const handleLike = useCallback(() => {
    const property = properties[currentIndex];
    onPropertyLike?.(property.id);
  }, [properties, currentIndex, onPropertyLike]);

  const handleSave = useCallback(() => {
    const property = properties[currentIndex];
    onPropertySave?.(property.id);
  }, [properties, currentIndex, onPropertySave]);

  const handleContactAgent = useCallback(() => {
    const property = properties[currentIndex];
    onContactAgent?.(property);
  }, [properties, currentIndex, onContactAgent]);

  const handleShare = useCallback(() => {
    // Alert.alert('Share Property', 'Share functionality would be implemented here');
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (isYouTubeUrl(properties[currentIndex].videoUrl)) {
      setYoutubeMutedStates(prev => {
        const newState = {
          ...prev,
          [currentIndex]: !prev[currentIndex]
        };
        console.log('YouTube mute toggle:', newState[currentIndex]);
        return newState;
      });
    } else {
      setVideoMutedStates(prev => {
        const newState = {
          ...prev,
          [currentIndex]: !prev[currentIndex]
        };
        console.log('Regular video mute toggle:', newState[currentIndex]);
        return newState;
      });
    }
  }, [properties, currentIndex]);

  const handleVideoSeek = useCallback((time: number) => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.setPositionAsync(time * 1000); // Convert to milliseconds
    }
  }, [currentIndex]);

  // Stable callback functions for YouTubePlayer to prevent unnecessary re-renders
  const handleYouTubePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleYouTubeLoad = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleYouTubeError = useCallback((error: any) => {
    console.error('YouTube video error:', error);
  }, []);

  // Stable callback functions for regular Video component
  const handleVideoLoad = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoError = useCallback((error: any) => {
    console.error('Video error:', error);
  }, []);

  const handleVideoPlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVideoPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setVideoDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setVideoCurrentTime(status.positionMillis ? status.positionMillis / 1000 : 0);
    }
  }, []);

  if (properties.length === 0) {
    return (
      <View style={styles.container}>
        <SearchHeader 
          onSearchChange={onSearchChange}
          onFilterPress={onFilterPress}
          placeholder="Search properties..."
          showFilterButton={true}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No properties found</Text>
          <Text style={styles.emptySubText}>
            Try adjusting your search or filters
          </Text>
          {onSearchChange && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => onSearchChange('')}
            >
              <Ionicons name="refresh-outline" size={20} color="#007AFF" />
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>
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
            onPlayPause={handleYouTubePlayPause}
            style={styles.video}
            onLoad={handleYouTubeLoad}
            onError={handleYouTubeError}
          />
        ) : (
          <>
            <Video
              ref={(ref) => {
                videoRefs.current[currentIndex] = ref;
              }}
              style={styles.video}
              source={{ uri: properties[currentIndex].videoUrl }}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={isPlaying}
              isMuted={videoMutedStates[currentIndex] ?? false}
              onLoad={handleVideoLoad}
              onError={handleVideoError}
              onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate}
            />
            <VideoControls
              duration={videoDuration}
              currentTime={videoCurrentTime}
              isPlaying={isPlaying}
              isMuted={videoMutedStates[currentIndex] ?? false}
              onSeek={handleVideoSeek}
              onPlayPause={handleVideoPlayPause}
              onMuteToggle={handleMuteToggle}
              isYouTube={false}
            />
          </>
        )}
        

        <PropertyOverlay
          property={properties[currentIndex]}
          onLike={handleLike}
          onSave={handleSave}
          onContactAgent={handleContactAgent}
          onShare={handleShare}
          isMuted={isYouTubeUrl(properties[currentIndex]?.videoUrl) ? 
            youtubeMutedStates[currentIndex] ?? false : 
            videoMutedStates[currentIndex] ?? false}
          onMuteToggle={handleMuteToggle}
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
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  clearSearchText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
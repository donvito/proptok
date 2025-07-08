import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getYouTubeVideoInfo, getYouTubeEmbedHtml } from '../utils/youtube';
import { VideoControls } from './VideoControls';


interface YouTubePlayerProps {
  url: string;
  isPlaying: boolean;
  muted?: boolean;
  shouldAutoPlay?: boolean;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onMuteToggle?: () => void;
  onPlayPause?: () => void;
  style?: any;
}

const YouTubePlayerComponent: React.FC<YouTubePlayerProps> = ({
  url,
  isPlaying,
  muted = false,
  shouldAutoPlay = false,
  onLoad,
  onError,
  onMuteToggle,
  onPlayPause,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);

  useEffect(() => {
    const info = getYouTubeVideoInfo(url);
    if (info) {
      setVideoInfo(info);
      setError(false);
    } else {
      setError(true);
      onError?.('Invalid YouTube URL');
    }
  }, [url, onError]);

  useEffect(() => {
    if (videoInfo) {
      setInternalIsPlaying(shouldAutoPlay || false);
    }
  }, [videoInfo, shouldAutoPlay]);

  // Only reload WebView when URL/video changes
  useEffect(() => {
    if (videoInfo) {
      setWebViewKey(prev => prev + 1);
    }
  }, [videoInfo]);

  // Handle play/pause commands via WebView messages
  const webViewRef = useRef<any>(null);
  
  useEffect(() => {
    if (webViewRef.current && videoInfo) {
      const action = isPlaying ? 'play' : 'pause';
      console.log('YouTube player sending play/pause command:', action, 'for video:', videoInfo.videoId);
      webViewRef.current.postMessage(JSON.stringify({ action }));
      setInternalIsPlaying(isPlaying);
      
      // If pausing, send multiple pause commands to ensure it stops
      if (!isPlaying) {
        setTimeout(() => {
          if (webViewRef.current) {
            console.log('YouTube player sending additional pause command');
            webViewRef.current.postMessage(JSON.stringify({ action: 'pause' }));
          }
        }, 100);
        
        setTimeout(() => {
          if (webViewRef.current) {
            console.log('YouTube player sending final pause command');
            webViewRef.current.postMessage(JSON.stringify({ action: 'pause' }));
          }
        }, 200);
      }
    }
  }, [isPlaying, videoInfo]);

  // Handle mute/unmute commands via WebView messages
  useEffect(() => {
    if (webViewRef.current && videoInfo) {
      const action = muted ? 'mute' : 'unmute';
      console.log('YouTube player sending mute command:', action, 'muted prop:', muted);
      webViewRef.current.postMessage(JSON.stringify({ action }));
    }
  }, [muted, videoInfo]);

  // Cleanup effect to pause video when component unmounts
  useEffect(() => {
    const webView = webViewRef.current;
    return () => {
      if (webView) {
        console.log('YouTube player unmounting, sending pause commands');
        webView.postMessage(JSON.stringify({ action: 'pause' }));
        // Send multiple pause commands to ensure audio stops
        setTimeout(() => {
          if (webView) {
            webView.postMessage(JSON.stringify({ action: 'pause' }));
          }
        }, 50);
      }
    };
  }, []);


  const handleWebViewLoad = () => {
    setLoading(false);
    onLoad?.();
    
    // Initialize video state after load
    setTimeout(() => {
      if (webViewRef.current && shouldAutoPlay) {
        webViewRef.current.postMessage(JSON.stringify({ action: 'play' }));
        setInternalIsPlaying(true);
      }
    }, 1000); // Give the YouTube API time to initialize
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(true);
    setLoading(false);
    onError?.(nativeEvent);
  };

  const reloadVideo = () => {
    setError(false);
    setLoading(true);
    setWebViewKey(prev => prev + 1);
  };

  const handleSeek = (time: number) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ 
        action: 'seek', 
        time: time 
      }));
    }
  };

  const handlePlayPause = () => {
    if (webViewRef.current) {
      const action = internalIsPlaying ? 'pause' : 'play';
      webViewRef.current.postMessage(JSON.stringify({ action }));
      setInternalIsPlaying(!internalIsPlaying);
      onPlayPause?.();
    }
  };

  const handleMuteToggle = () => {
    if (webViewRef.current) {
      const action = muted ? 'unmute' : 'mute';
      webViewRef.current.postMessage(JSON.stringify({ action }));
      onMuteToggle?.();
    }
  };

  if (error) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Ionicons name="warning-outline" size={48} color="#fff" />
        <TouchableOpacity style={styles.reloadButton} onPress={reloadVideo}>
          <Ionicons name="reload" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  if (!videoInfo) {
    return (
      <View style={[styles.container, style, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const htmlContent = getYouTubeEmbedHtml(videoInfo.videoId, videoInfo.isShorts, false, false);

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        key={webViewKey}
        source={{ html: htmlContent }}
        style={styles.webView}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'timeUpdate') {
              setDuration(data.duration || 0);
              setCurrentTime(data.currentTime || 0);
              setInternalIsPlaying(data.isPlaying || false);
            }
          } catch {
            // Ignore non-JSON messages
          }
        }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        contentMode="mobile"
        mixedContentMode="always"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsFullscreenVideo={false}
        cacheEnabled={true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
      />
      
      <VideoControls
        duration={duration}
        currentTime={currentTime}
        isPlaying={internalIsPlaying}
        isMuted={muted}
        onSeek={handleSeek}
        onPlayPause={handlePlayPause}
        onMuteToggle={handleMuteToggle}
        isYouTube={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
});

// Memoized component to prevent unnecessary re-renders
export const YouTubePlayer = memo(YouTubePlayerComponent, (prevProps, nextProps) => {
  // Only re-render if these critical props change
  return (
    prevProps.url === nextProps.url &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.muted === nextProps.muted &&
    prevProps.shouldAutoPlay === nextProps.shouldAutoPlay
    // Don't include onMuteToggle, onPlayPause, onLoad, onError in comparison
    // as they are now stable with useCallback
  );
});
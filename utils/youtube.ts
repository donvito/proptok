export interface YouTubeVideoInfo {
  videoId: string;
  isShorts: boolean;
  embedUrl: string;
  thumbnailUrl: string;
}

export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

export const isYouTubeUrl = (url: string): boolean => {
  return /(?:youtube\.com|youtu\.be)/.test(url);
};

export const isYouTubeShorts = (url: string): boolean => {
  return url.includes('/shorts/');
};

export const getYouTubeVideoInfo = (url: string): YouTubeVideoInfo | null => {
  if (!isYouTubeUrl(url)) {
    return null;
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  const isShorts = isYouTubeShorts(url);
  
  return {
    videoId,
    isShorts,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
};

export const getYouTubeEmbedHtml = (videoId: string, isShorts: boolean = false, muted: boolean = false, shouldPlay: boolean = false): string => {
  // Always start with autoplay=0 and mute=0 to prevent initial state conflicts
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1&loop=1&playlist=${videoId}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            background: #000;
            overflow: hidden;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .video-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .iframe-wrapper {
            position: relative;
            ${isShorts ? `
              /* YouTube Shorts 9:16 aspect ratio (1080x1920) */
              width: 56.25vh; /* 9/16 * 100vh */
              height: 100vh;
              max-width: 100vw;
            ` : `
              /* Regular YouTube videos 16:9 aspect ratio */
              width: 100vw;
              height: 56.25vw; /* 9/16 * 100vw */
              max-height: 100vh;
            `}
          }
          
          /* For very wide screens, ensure Shorts don't get too wide */
          @media (min-aspect-ratio: 16/9) {
            .iframe-wrapper {
              ${isShorts ? `
                width: 56.25vh !important;
                height: 100vh !important;
              ` : ''}
            }
          }
          
          /* For very tall screens, ensure Shorts fit properly */
          @media (max-aspect-ratio: 9/16) {
            .iframe-wrapper {
              ${isShorts ? `
                width: 100vw !important;
                height: 177.78vw !important; /* 16/9 * 100vw */
                max-height: 100vh !important;
              ` : ''}
            }
          }
          
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            background: #000;
          }
          
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 16px;
            z-index: 1;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <div class="iframe-wrapper">
            <div class="loading" id="loading">Loading video...</div>
            <iframe
              id="youtube-player"
              src="${embedUrl}"
              frameborder="0"
              allowfullscreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>
        </div>
        
        <script>
          let player;
          let isReady = false;
          
          // YouTube API integration
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('youtube-player', {
              events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
              }
            });
          }
          
          function onPlayerReady(event) {
            isReady = true;
            document.getElementById('loading').style.display = 'none';
            
            // Let React Native control the initial state via messages
            // Don't set any initial play/mute state here
          }
          
          function onPlayerStateChange(event) {
            // Send state changes to React Native
            if (typeof player.getCurrentTime === 'function') {
              try {
                const duration = player.getDuration() || 0;
                const currentTime = player.getCurrentTime() || 0;
                const playerState = event.data;
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'timeUpdate',
                  duration: duration,
                  currentTime: currentTime,
                  isPlaying: playerState === 1 // 1 = playing
                }));
              } catch (error) {
                // Ignore errors
              }
            }
          }
          
          // Load YouTube API
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          
          // Fallback for loading
          const iframe = document.getElementById('youtube-player');
          const loading = document.getElementById('loading');
          
          iframe.addEventListener('load', function() {
            setTimeout(() => {
              if (loading) {
                loading.style.display = 'none';
              }
            }, 2000);
          });
          
          // Fallback timeout
          setTimeout(function() {
            if (loading) {
              loading.style.display = 'none';
            }
          }, 8000);
          
          // Message handler for communication with React Native
          window.addEventListener('message', function(event) {
            if (player && isReady && typeof player.playVideo === 'function') {
              try {
                const data = JSON.parse(event.data);
                if (data.action === 'play') {
                  player.playVideo();
                } else if (data.action === 'pause') {
                  player.pauseVideo();
                } else if (data.action === 'mute') {
                  player.mute();
                } else if (data.action === 'unmute') {
                  player.unMute();
                } else if (data.action === 'seek') {
                  player.seekTo(data.time, true);
                } else if (data.action === 'getDuration') {
                  const duration = player.getDuration();
                  const currentTime = player.getCurrentTime();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'timeUpdate',
                    duration: duration,
                    currentTime: currentTime,
                    isPlaying: player.getPlayerState() === 1
                  }));
                }
              } catch (error) {
                console.log('Message handling error:', error);
              }
            }
          });
          
          // Send time updates periodically
          setInterval(function() {
            if (player && isReady && typeof player.getCurrentTime === 'function') {
              try {
                const duration = player.getDuration() || 0;
                const currentTime = player.getCurrentTime() || 0;
                const playerState = player.getPlayerState();
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'timeUpdate',
                  duration: duration,
                  currentTime: currentTime,
                  isPlaying: playerState === 1
                }));
              } catch (error) {
                // Ignore errors
              }
            }
          }, 1000);
        </script>
      </body>
    </html>
  `;
};
import React from 'react';
import { ExternalLink, Play } from 'lucide-react';

const VideoEmbed = ({ videos }) => {
  // Function to get YouTube video ID
  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Function to get Vimeo video ID
  const getVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  // Function to get Loom video ID
  const getLoomId = (url) => {
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Function to render video embed
  const renderVideoEmbed = (video, index) => {
    const { url, type } = video;

    switch (type) {
      case 'youtube':
        const youtubeId = getYouTubeId(url);
        if (youtubeId) {
          return (
            <div key={index} className="w-full max-w-md">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        break;

      case 'vimeo':
        const vimeoId = getVimeoId(url);
        if (vimeoId) {
          return (
            <div key={index} className="w-full max-w-md">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  title="Vimeo video"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        break;

      case 'loom':
        const loomId = getLoomId(url);
        if (loomId) {
          return (
            <div key={index} className="w-full max-w-md">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
                  src={`https://www.loom.com/embed/${loomId}`}
                  title="Loom video"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        break;

      case 'direct':
        return (
          <div key={index} className="w-full max-w-md">
            <video
              className="w-full rounded-lg shadow-sm"
              controls
              preload="metadata"
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      default:
        return (
          <div key={index} className="w-full max-w-md p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Video Link</span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-gray-800 hover:text-gray-900 rounded-lg border border-brand/30 hover:border-brand/50 transition-all duration-200 text-sm font-medium no-underline w-full justify-center"
            >
              <span>Open Video</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        );
    }

    return null;
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {videos.map((video, index) => renderVideoEmbed(video, index))}
    </div>
  );
};

export default VideoEmbed;

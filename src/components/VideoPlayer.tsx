import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';
import { MediaCommunitySkin, MediaOutlet, MediaPlayer } from '@vidstack/react';
import { useEffect, useState } from 'react';

const VideoPlayer = ({ src }) => {
  if (!src) return null;

  return (
    <MediaPlayer
      src={src}
      aspect-ratio="16/9"
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;
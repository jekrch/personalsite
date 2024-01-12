import React from 'react';

const SoundCloudPlayer = () => {
  return (
    <div>
      <iframe
        width="100%"
        height="450"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1754728098&color=%23acc1cc&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
        className="w-full"
      ></iframe>
      <div className="text-xs text-gray-300 overflow-hidden whitespace-nowrap">
        <a href="https://soundcloud.com/lamptimemusic" title="lamps" target="_blank" className="text-gray-300 no-underline hover:underline">lamps</a> · 
        <a href="https://soundcloud.com/lamptimemusic/sets/songs" title="Songs" target="_blank" className="text-gray-300 no-underline hover:underline">Songs</a>
      </div>
    </div>
  );
};

export default SoundCloudPlayer;


const SoundCloudPlayer = () => {
  return (
    <div>
      <iframe
        width="100%"
        height="450"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1754728098&color=%2393b2bc&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
        className="w-full shadow-[5px_6px_11px_0px_rgba(0,_0,_0,_0.3)] overflow-hidden rounded-md hover:duration-200 hover:shadow-[rgba(0,_0,_0,_0.4)]"
      ></iframe>
    </div>
  );
};

export default SoundCloudPlayer;

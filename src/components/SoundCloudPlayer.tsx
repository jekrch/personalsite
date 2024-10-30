
const SoundCloudPlayer = () => {
  return (
    <div>
      <iframe
        width="100%"
        height="450"

        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1754728098&color=%23acc1cc&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
        className="w-full"
      ></iframe>
    </div>
  );
};

export default SoundCloudPlayer;

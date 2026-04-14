const KlimatkollenVideo = () => {
  return (
    <div className="w-full h-72 sm:h-96 lg:h-[600px]">
      <div className="h-full w-full overflow-hidden rounded-md bg-[#121212]">
        <iframe
          className="h-full w-full"
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/oRm2W7LiwME?si=PN9bT_8JTvLkS9Kg&controls=0"
          title="Klimatkollen - Mission Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default KlimatkollenVideo;

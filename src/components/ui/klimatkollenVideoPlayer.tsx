const KlimatkollenVideo = () => {
  return (
    <div className="w-full h-72 py-4 md:py-6 sm:h-96 lg:h-screen">
      <iframe
        className="rounded-2xl bg-[#121212]"
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/oRm2W7LiwME?si=PN9bT_8JTvLkS9Kg?controls=0"
        title="Klimatkollen - Mission Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default KlimatkollenVideo;

import { useScreenSize } from "@/hooks/useScreenSize";

const KlimatkollenVideo = () => {
  const { isMobile } = useScreenSize();
  return (
    <div className={`${isMobile ? "h-[400px] py-6" : "h-[800px]"} py-12 w-full`}>
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/oRm2W7LiwME?si=PN9bT_8JTvLkS9Kg"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        controls="1"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default KlimatkollenVideo;

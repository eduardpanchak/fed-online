import { useEffect, useRef, useState } from "react";
import { AdCard } from "./AdCard";

export default function RotatingAdCard({ ads }) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ad = ads[index]; // ВАЖНО: объявляем здесь, чтобы использовать в return

  useEffect(() => {
    startRotation();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, ads]);

  const startRotation = () => {
    // Чистим предыдущий таймер
    if (timerRef.current) clearTimeout(timerRef.current);

    // Фото — показываем 5 сек
    if (ad.media_type === "photo") {
      timerRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return;
    }

    // Видео — используем фактическую длительность
    if (ad.media_type === "video") {
      const video = videoRef.current;
      if (!video) return;

      const handleLoaded = () => {
        const durationMs = video.duration * 1000;
        timerRef.current = setTimeout(() => {
          setIndex((prev) => (prev + 1) % ads.length);
        }, durationMs);
      };

      // Если метаданные уже загружены
      if (video.readyState >= 1) {
        handleLoaded();
      } else {
        video.onloadedmetadata = handleLoaded;
      }
    }
  };

  return (
    <AdCard
      id={ad.id}
      mediaUrl={ad.media_url}
      mediaType={ad.media_type}
      targetUrl={ad.target_url}
      externalVideoRef={videoRef}  // ВАЖНО!
    />
  );
}



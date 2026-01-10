import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AdCardProps {
  id: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  targetUrl: string;
  onImpression?: () => void;
  onClick?: () => void;
   externalVideoRef?: React.RefObject<HTMLVideoElement>;
}


export const AdCard = ({
  id,
  mediaUrl,
  mediaType,
  targetUrl,
  externalVideoRef,
}: AdCardProps) => {
  const hasTrackedImpression = useRef(false);
  const videoRef = externalVideoRef ?? useRef<HTMLVideoElement>(null);

  
  useEffect(() => {
    // Track impression once when ad is rendered
    if (!hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      trackImpression();
    }
  }, [id]);

  const trackImpression = async () => {
    try {
      await supabase.rpc('increment_ad_impressions', { ad_id: id });
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  };

  const trackClick = async () => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: id });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleClick = () => {
    trackClick();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };


  return (
    <button
      onClick={() => window.location.href = targetUrl}
      className={cn(
        "w-full bg-card rounded-xl overflow-visible text-left ",
        "hover:border-primary transition-all active:scale-95",
        "shadow-sm relative border border-border"
      )}
    >
      {/* Ad indicator badge */}
      <div className="absolute top-1 right-1 z-1 bg-muted/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded text-muted-foreground">
        Ad
      </div>
      
      {/* Media content - 3:1 aspect ratio */}
      <div className="w-full aspect-[3/1] bg-muted rounded-xl overflow-hidden glow-canva border border-white/10">
        {mediaType === 'photo' ? (
          <img 
            src={mediaUrl} 
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
        )}
      </div>
    </button>
    
  );
};


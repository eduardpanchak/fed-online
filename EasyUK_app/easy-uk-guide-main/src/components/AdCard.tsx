import { TrendingUp } from "lucide-react";

interface AdCardProps {
    ad: {
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        videoUrl?: string;
        linkUrl: string;
        linkType: 'website' | 'app';
        isPremium: boolean;
    };
    onAdClick: (adId: string) => void;
}

export function AdCard({ ad, onAdClick }: AdCardProps) {
    const handleClick = () => {
        onAdClick(ad.id);

        if (ad.linkType === 'website') {
        window.open(ad.linkUrl, '_blank');
        } else {
        // For 'app' linkType, we assume it's a deep link
        window.location.href = ad.linkUrl;
        }
    };

return(
    <button
        onClick={handleClick}
        className="w-full h-48 rounded-xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-all active:scale-[0.98] border-2 border-yellow-400"
    >

    {/* Add mark */}
    <div className="absolute top-3 right-3 z-10 bg-amber-500 text white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
    <TrendingUp className="w-3 h-3"/>
    Add
    </div>

    {/*Imagies or video */}
    {ad.videoUrl? (
    <video
        src={ad.videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
    />
    ) : (
        <img
            src={ad.imageUrl}
            alt="Advertisement"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        )
        }
        </button>
        );
    }
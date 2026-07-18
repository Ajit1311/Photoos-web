'use client';

interface PhotoCardProps {
  id: string;
  image: string;
  rating: number;
  favorite: boolean;
  selected: boolean;
  faces: number;
  label: "Blue" | "Green" | "Yellow" | "Purple" | "Red";
  onToggleFavorite: (id: string) => void; // पॅरेंटकडून येणारे फंक्शन
}

export default function PhotoCard({
  id,
  image,
  rating,
  favorite,
  selected,
  faces,
  label,
  onToggleFavorite,
}: PhotoCardProps) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Photo Asset Rendering */}
      <img 
        src={image} 
        alt={id} 
        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" 
      />

      {/* Top Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {/* Favorite/Select Toggle Button connected to 200 Limit Engine */}
        <button
          onClick={() => onToggleFavorite(id)}
          className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 ${
            favorite 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
          }`}
          title={favorite ? "Remove from favorites" : "Select Photo"}
        >
          {favorite ? (
            <span className="text-sm font-bold flex items-center gap-1">❤️ Selected</span>
          ) : (
            <span className="text-sm flex items-center gap-1">🤍 Select</span>
          )}
        </button>
      </div>

      {/* Bottom Info Footer Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
            {id}
          </span>
          {faces > 0 && (
            <span className="bg-blue-500/80 px-2 py-0.5 rounded backdrop-blur-sm">
              👥 {faces} {faces === 1 ? 'Face' : 'Faces'}
            </span>
          )}
        </div>
        
        {/* Optional Tag Badges matching styling layout */}
        <div className="mt-2 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            label === 'Red' ? 'bg-red-500' :
            label === 'Blue' ? 'bg-blue-500' :
            label === 'Green' ? 'bg-green-500' :
            label === 'Yellow' ? 'bg-yellow-500' : 'bg-purple-500'
          }`} />
          <span className="text-xs text-slate-300 capitalize">{label} Tag</span>
        </div>
      </div>
    </div>
  );
}
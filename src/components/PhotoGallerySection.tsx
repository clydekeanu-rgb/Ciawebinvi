import React, { useState } from 'react';
import { Camera, Sparkles, X, ChevronLeft, ChevronRight, Maximize2, Heart, LayoutGrid } from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export const PhotoGallerySection: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  // All 20 photos (5 uploaded + 15 from downloads/cia)
  const photos: GalleryItem[] = [
    { id: 'g-1', url: '/gallery/gallery-1.jpg', caption: 'Silly Princess Tiara Smiles 👑🤪' },
    { id: 'g-2', url: '/gallery/gallery-2.jpg', caption: 'Happy Birthday Sunshine 🎂✨' },
    { id: 'g-3', url: '/gallery/gallery-3.jpg', caption: 'Butterfly Chair & Noodle Feast 🦋🍜' },
    { id: 'g-4', url: '/gallery/gallery-4.jpg', caption: 'Cute Frog Friends 🐸💖' },
    { id: 'g-5', url: '/gallery/gallery-5.jpg', caption: 'Sweet Celestine Portrait 🌸✨' },
    { id: 'cia-1', url: '/gallery/cia-1.jpg', caption: 'Make Your Own Magic ✨' },
    { id: 'cia-2', url: '/gallery/cia-2.jpg', caption: 'Silly Tongue Out Pose 🤪' },
    { id: 'cia-3', url: '/gallery/cia-3.jpg', caption: 'Little Princess Pose 👑' },
    { id: 'cia-4', url: '/gallery/cia-4.jpg', caption: 'Cutie Smile 💖' },
    { id: 'cia-5', url: '/gallery/cia-5.jpg', caption: 'Adorable Pout 😚' },
    { id: 'cia-6', url: '/gallery/cia-6.jpg', caption: 'Sweetest Smile 😊' },
    { id: 'cia-7', url: '/gallery/cia-7.jpg', caption: 'Dollhouse Magic 🐱' },
    { id: 'cia-8', url: '/gallery/cia-8.jpg', caption: 'Party Ready ✨' },
    { id: 'cia-9', url: '/gallery/cia-9.jpg', caption: 'Sparkle Girl 💖' },
    { id: 'cia-10', url: '/gallery/cia-10.jpg', caption: 'Cute Moments 🌸' },
    { id: 'cia-11', url: '/gallery/cia-11.jpg', caption: 'Little Princess Tiara 👑' },
    { id: 'cia-12', url: '/gallery/cia-12.jpg', caption: 'Celestine Sunshine ☀️' },
    { id: 'cia-13', url: '/gallery/cia-13.jpg', caption: 'Happy Memories 🎉' },
    { id: 'cia-14', url: '/gallery/cia-14.jpg', caption: 'Birthday Girl 🎂' },
    { id: 'cia-15', url: '/gallery/cia-15.jpg', caption: 'Sprinkle Time ✨' },
  ];

  // Divide photos into two balanced rows for marquee
  const row1 = photos.slice(0, 10);
  const row2 = photos.slice(10, 20);

  // Duplicate arrays to create continuous infinite marquee loop
  const marqueeRow1 = [...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2];

  const openLightbox = (photoUrl: string) => {
    const idx = photos.findIndex(p => p.url === photoUrl);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section id="photo-gallery-section" className="px-4 py-3 max-w-md lg:max-w-none mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-pink-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                Celestine&apos;s Photo Gallery
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Hover to pause • Tap photo to expand</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsGridModalOpen(true)}
              className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 hover:border-pink-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="View all 20 photos in grid"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-pink-500" />
              <span>View All ({photos.length})</span>
            </button>
          </div>
        </div>

        {/* Marquee Carousel Tracks Wrapper with Soft Edge Fade */}
        <div
          className="space-y-3 overflow-hidden py-1"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)'
          }}
        >
          {/* Row 1: Infinite Marquee (Scrolling Left) */}
          <div className="animate-marquee gap-3 flex">
            {marqueeRow1.map((item, idx) => (
              <div
                key={`r1-${item.id}-${idx}`}
                onClick={() => openLightbox(item.url)}
                className="relative w-36 h-48 shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-md hover:border-pink-300 transition-all transform active:scale-95 cursor-pointer group bg-pink-50"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                    {item.caption}
                  </p>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Infinite Marquee Reverse (Scrolling Right) */}
          <div className="animate-marquee-reverse gap-3 flex">
            {marqueeRow2.map((item, idx) => (
              <div
                key={`r2-${item.id}-${idx}`}
                onClick={() => openLightbox(item.url)}
                className="relative w-36 h-48 shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-md hover:border-pink-300 transition-all transform active:scale-95 cursor-pointer group bg-purple-50"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                    {item.caption}
                  </p>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-400" />
            Continuous live marquee reel!
          </span>
          <button
            onClick={() => setIsGridModalOpen(true)}
            className="text-[11px] font-bold text-pink-600 hover:text-pink-700 underline cursor-pointer flex items-center gap-1"
          >
            <span>Browse all photos</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Full-Screen All Photos Grid Modal */}
      {isGridModalOpen && (
        <div
          onClick={() => setIsGridModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
        >
          {/* Grid Modal Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-pink-200 px-4 py-3 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-heading text-slate-800 flex items-center gap-1.5">
                  <span>Celestine&apos;s Photo Gallery</span>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-sans font-semibold">
                    {photos.length}
                  </span>
                </h3>
                <p className="text-[11px] text-pink-600 font-medium">
                  Tap any photo to view in full resolution
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsGridModalOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Gallery Grid"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Modal Scrollable Body */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 sm:p-6"
          >
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((item, idx) => (
                  <div
                    key={`all-${item.id}-${idx}`}
                    onClick={() => setSelectedIndex(idx)}
                    className="group relative aspect-3/4 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-md hover:shadow-xl hover:border-pink-400 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.caption}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                      <span className="self-end bg-black/60 backdrop-blur-xs text-[10px] text-pink-200 font-mono px-2 py-0.5 rounded-full">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-white line-clamp-2 leading-snug drop-shadow-xs">
                          {item.caption}
                        </p>
                        <span className="text-[9px] text-pink-300 font-medium flex items-center gap-1 mt-0.5">
                          <Maximize2 className="w-2.5 h-2.5" /> Tap to view
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={showPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={showNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center justify-center p-2"
          >
            <img
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].caption}
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20"
            />
            <div className="mt-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center text-white">
              <p className="text-sm font-bold">{photos[selectedIndex].caption}</p>
              <p className="text-xs text-pink-300 font-mono mt-0.5">
                Photo {selectedIndex + 1} of {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

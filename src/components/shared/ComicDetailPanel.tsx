import { FC, useState } from "react";
import { ComicSeries } from "../../types/ComicTypes";
import ImageModal from "./ImageModal";

interface ComicDetailPanelProps {
  comic: ComicSeries | null;
}

const ComicDetailPanel: FC<ComicDetailPanelProps> = ({ comic }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!comic) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto border-2 border-dashed border-zinc-700 rotate-45 flex items-center justify-center">
            <span className="text-zinc-600 -rotate-45 text-sm">SELECT</span>
          </div>
          <p className="text-zinc-500 text-sm">Choose a series to view details</p>
        </div>
      </div>
    );
  }

  // All images: cover first, then samples
  const allImages = [comic.cover_image, ...comic.sample_images];

  const openModalAtIndex = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Header with Rank Badge */}
        <div className="relative">
          {/* Rank Badge - Large geometric element */}
          <div className="absolute -top-2 -left-2 z-10">
            <div className="
              w-16 h-16
              bg-jk-teal text-zinc-900
              flex items-center justify-center
              font-black text-3xl
              clip-diamond
              shadow-lg shadow-jk-teal/20
            ">
              {comic.rank}
            </div>
          </div>

          {/* Main Cover Image - Clickable */}
          <div className="ml-8 relative">
            <button
              onClick={() => openModalAtIndex(0)}
              className="
                aspect-[2/3] max-w-[280px] mx-auto overflow-hidden bg-zinc-900 shadow-2xl
                block group cursor-zoom-in
              "
            >
              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-jk-teal/20 border-l-[40px] border-l-transparent z-10" />
              <img
                src={comic.cover_image}
                alt={comic.series_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="
                absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40
                flex items-center justify-center
                transition-all duration-200
              ">
                <svg 
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Series Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            {comic.series_name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="
              px-3 py-1
              bg-zinc-800 text-jk-teal text-xs font-semibold uppercase tracking-wider
              border-l-2 border-jk-teal
            ">
              {comic.publisher}
            </span>
          </div>
        </div>

        {/* Geometric Divider */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-jk-teal/20 rotate-45" />
          <div className="flex-1 h-px bg-gradient-to-r from-jk-teal/40 to-transparent" />
        </div>

        {/* Credits Grid */}
        <div className="grid gap-4">
          <CreditRow label="Writer" values={[comic.writer]} />
          <CreditRow label="Artist" values={comic.artists} />
          <CreditRow label="Colorist" values={comic.colorists} />
          <CreditRow label="Letterer" values={comic.letterers} />
        </div>

        {/* Geometric Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gradient-to-l from-jk-teal/40 to-transparent" />
          <div className="w-4 h-4 bg-jk-teal/20 rotate-45" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            About
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {comic.description}
          </p>
        </div>

        {/* Sample Gallery */}
        {comic.sample_images.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Sample Pages
            </h3>
            {/* Thumbnail Grid */}
            <div className="flex flex-wrap gap-2">
              {comic.sample_images.map((img: any, idx: any) => (
                <button
                  key={idx}
                  onClick={() => openModalAtIndex(idx + 1)} // +1 because cover is at index 0
                  className="
                    relative w-16 h-20 overflow-hidden
                    ring-1 ring-zinc-700
                    hover:ring-2 hover:ring-jk-teal
                    transition-all duration-200
                    group
                  "
                >
                  <img
                    src={img}
                    alt={`${comic.series_name} sample ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Expand overlay */}
                  <div className="
                    absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/60
                    flex items-center justify-center
                    transition-all duration-200
                  ">
                    <svg 
                      className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Link Button */}
        <a
          href={comic.link}
          target="_blank"
          rel="noopener noreferrer"
          className="
            block w-full py-3 px-4
            bg-zinc-800 text-zinc-300
            hover:bg-jk-teal hover:text-zinc-900
            transition-all duration-300
            font-semibold text-sm text-center uppercase tracking-wider
            border border-zinc-700 hover:border-jk-teal
            group
          "
        >
          <span className="flex items-center justify-center gap-2">
            Read More
            <svg 
              className="w-4 h-4 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </a>
      </div>

      {/* Image Modal */}
      <ImageModal
        images={allImages}
        currentIndex={currentIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNavigate={setCurrentIndex}
        seriesName={comic.series_name}
      />
    </div>
  );
};

// Helper component for credit rows
const CreditRow: FC<{ label: string; values: string[] }> = ({ label, values }) => (
  <div className="flex items-start gap-4">
    <span className="
      flex-shrink-0 w-20
      text-xs font-semibold uppercase tracking-wider text-zinc-500
      pt-0.5
    ">
      {label}
    </span>
    <span className="text-zinc-200 text-sm">
      {values.join(", ")}
    </span>
  </div>
);

export default ComicDetailPanel;
import { FC, useState } from "react";
import ImageModal from "./ImageModal";

interface SampleGalleryProps {
  images: string[];
  seriesName: string;
}

const SampleGallery: FC<SampleGalleryProps> = ({ images, seriesName }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => openModal(idx)}
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
              alt={`${seriesName} sample ${idx + 1}`}
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

      {/* Modal */}
      <ImageModal
        images={images}
        currentIndex={currentIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNavigate={setCurrentIndex}
        seriesName={seriesName}
      />
    </>
  );
};

export default SampleGallery;
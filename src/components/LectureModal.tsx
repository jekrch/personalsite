import { FC, useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

interface LectureModalProps {
  isOpen: boolean;
  toggle: () => void;
  lectureName: string;
  url: string;
}

const LectureModal: FC<LectureModalProps> = ({ isOpen, toggle, lectureName, url }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, url]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); 
  };

  return (
    <Modal className="slide-modal" size="lg" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{lectureName}</ModalHeader>
      
      <ModalBody style={{ position: 'relative', minHeight: '481px', padding: 0, overflow: 'hidden' }}>
        
        {/* LOADER WRAPPER */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column', // Stacks logo and text vertically
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#5b8592', 
            zIndex: 10,
            opacity: isLoading ? 1 : 0,
            pointerEvents: isLoading ? 'all' : 'none',
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          {/* LOGO ANIMATION */}
          <div className="logo-loader">
            <div className="frame frame-1"></div>
            <div className="frame frame-2"></div>
            <div className="frame frame-3"></div>
          </div>

          {/* LOADING TEXT */}
          <div style={{
            color: '#FFFFFF',
            marginTop: '40px', // Space between squares and text
            fontFamily: 'sans-serif',
            fontSize: '14px',
            textTransform: 'uppercase', 
            letterSpacing: '1px',      
            fontWeight: 300
          }}>
            Loading slides...
          </div>

        </div>

        <iframe
          key={url}
          style={{ 
            margin: "auto", 
            display: "block",
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}
          src={url}
          width="100%"
          height="481px"
          frameBorder="0"
          title={`${lectureName} presentation`}
          onLoad={handleIframeLoad} 
        />
      </ModalBody>
    </Modal>
  );
};

export default LectureModal;
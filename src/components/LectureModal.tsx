import { FC } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

interface LectureModalProps {
  isOpen: boolean;
  toggle: () => void;
  lectureName: string;
  url: string;
}

const LectureModal: FC<LectureModalProps> = ({ isOpen, toggle, lectureName, url }) => {
  return (
    <Modal
      className="slide-modal"
      size="lg"
      isOpen={isOpen}
      toggle={toggle}
      width="100%"
    >
      <ModalHeader toggle={toggle}>{lectureName}</ModalHeader>
      <ModalBody>
        <iframe
          key={url}
          style={{ margin: "auto", display: "block" }}
          src={url}
          width="100%"
          height="481px"
          frameBorder="0"
          title={`${lectureName} presentation`}
        >
          This is an embedded{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://office.com">
            Microsoft Office
          </a>{" "}
          presentation, powered by{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://office.com/webapps">
            Office Online
          </a>
          .
        </iframe>
      </ModalBody>
    </Modal>
  );
};

export default LectureModal;
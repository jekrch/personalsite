import { useState } from 'react';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import lectures from "./lectures";
import LectureModal from "./LectureModal";

interface Lecture {
  _id: string;
  name: string;
  number: number;
  url: string;
}

const LogicLectures = () => {

  interface LectureState {
    modal: boolean;
    lectureName: string;
    url: string;
  }

  const [lectureState, setLectureState] = useState<LectureState>({
    modal: false,
    lectureName: '',
    url: ''
  });

  const onOpenClick = (name: string, url: string) => {
    setLectureState({
      ...lectureState,
      modal: true,
      lectureName: name,
      url
    });
  };

  const toggle = () => {
    setLectureState(prev => ({
      ...prev,
      modal: !prev.modal
    }));
  };

  return (
    <Container className="content-text pb-[2em]">
      <LectureModal
        isOpen={lectureState.modal}
        toggle={toggle}
        lectureName={lectureState.lectureName}
        url={lectureState.url}
      />

      <div className="mb-[30px] px-0">
        <p>
          I created these lecture slides for a logic course that I designed and
          taught while in graduate school at the University of Wisconsin-Madison. They complement readings taken from: Virginia Klenk's <i>Understanding Symbolic Logic. 5th ed.</i>
        </p>

        <div className="ml-[20px] mt-[30px]">
          <a
            download="211Syllabus.docx"
            className="btn view-btn active"
            style={{
              margin: "0 auto",
              display: "block",
              maxWidth: "150px"
            }}
            href="/files/211Syllabus.docx"
          >
            <b>Syllabus</b>
          </a>
        </div>
      </div>

      <ListGroup>
        <TransitionGroup className="lecture-list">
          {lectures.map(({ _id, name, number, url }: Lecture) => (
            <CSSTransition key={_id} timeout={500} classNames="fade">
              <ListGroupItem className="d-flex align-items-start">
                <Button
                  className="view-btn me-2"
                  color="primary"
                  size="sm"
                  onClick={() => onOpenClick(name, url)}
                >
                  view
                </Button>
                <div className="ml-2 mt-[0.8em] d-flex">
                  <span>{number}. </span>
                  <span className="ml-[0.3em]">{name}</span>
                </div>
              </ListGroupItem>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </ListGroup>
    </Container>
  );
};

export default LogicLectures;
import React, { Component } from "react";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import lectures from "./lectures"
import LectureModal from "./LectureModal"

class LogicLectures extends Component {
  state = {
    modal: false,
    lectureName: '',
    url: ''
  };

  onOpenClick = (name, url) => {
    this.setState({
      modal: true,
      lectureName: name,
      url: url
    });
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  render() {
    const lectureName = ""
    const url = ""

    return (
      <Container className="content-text pb-[2em]">

        <LectureModal
          isOpen={this.state.modal}
          toggle={this.toggle}
          lectureName={this.state.lectureName}
          url={this.state.url}
        />

        <div className="mb-[30px] px-0" >
          I created these lecture slides for a logic course that I designed and
          taught while in graduate school at the University of Wisconsin-Madison. They complement readings taken from: Virginia Klenk's <i>Understanding Symbolic Logic. 5th ed.</i>

          <div className="ml-[20px] mt-[30px]">
            <b>
              <a
                download="211Syllabus.docx"
                class="btn view-btn active"
                style={{
                  margin: "0 auto",
                  display: "block",
                  maxWidth: "150px"
                }}
                href="/files/211Syllabus.docx"
              >
                Syllabus
              </a>
            </b>
          </div>
        </div>

        <ListGroup>
          <TransitionGroup className="lecture-list">
            {lectures.map(({ _id, name, number, url }) => (
              <CSSTransition key={_id} timeout={500} classNames="fade">
                <ListGroupItem className="d-flex align-items-start">
                  <Button
                    className="view-btn me-2"
                    color="primary"
                    size="sm"
                    onClick={() => this.onOpenClick(name, url)}
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
    )
  }
}

export default LogicLectures;

import React, { Component } from "react"
import { Container, ListGroup, ListGroupItem, Button } from "reactstrap"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import PropTypes from "prop-types"
import lectures from "./lectures"

class LectureList extends Component {
  // componentDidMount() {
  //   this.props.getLectures()
  // }

  onOpenClick = (id, name, url) => {
    this.lectureName = name
    this.url = url

    this.setState({
      modal: !this.state.modal
    })
  }

  state = {
    modal: false,
    name: ""
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    })
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const lectureName = ""
    const url = ""

    return (
      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
        <Modal
          className="slide-modal"
          size="lg"
          isOpen={this.state.modal}
          toggle={this.toggle}
          width="100%"
        >
          <ModalHeader toggle={this.toggle}>{this.lectureName}</ModalHeader>
          <ModalBody>
            <iframe
              key={this.url}
              style={{ margin: "auto", display: "block" }}
              src={this.url}
              width="100%"
              //height="100%"
              height="481px"
              frameborder="0"
            >
              This is an embedded{" "}
              <a target="_blank" href="https://office.com">
                Microsoft Office
              </a>{" "}
              presentation, powered by{" "}
              <a target="_blank" href="https://office.com/webapps">
                Office Online
              </a>
              .
            </iframe>
          </ModalBody>
        </Modal>
        <div style={{ marginBottom: "30px", marginTop: "-25px" }}>
          I created these lecture slides for a logic course that I designed and
          taught while in graduate school at the University of
          Wisconsin-Madison. They complement readings taken from: Virginia Klenk's 
          <i>Understanding Symbolic Logic. 5th ed.</i>

          <div style={{ marginLeft: "20px", marginTop: "30px" }}>
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
                <ListGroupItem>
                  <Button
                    className="view-btn"
                    color="primary"
                    size="sm"
                    onClick={this.onOpenClick.bind(this, _id, name, url)}
                  >
                    view
                  </Button>
                  {number}. {name}
                </ListGroupItem>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </ListGroup>
        <br />
        <br />
        <br />
        <br />
      </Container>
    )
  }
}

LectureList.propTypes = {
  getLectures: PropTypes.func.isRequired,
  lecture: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  lecture: state.lecture
})

export default LectureList;

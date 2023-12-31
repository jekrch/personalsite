import React, { Component } from "react";
import "../App.css";
import LectureList from "./LectureList";
import { Container } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

class LogicLectures extends Component {
  render() {
    return (
      
        <div className="App">
          <Container>
            <br />

            <LectureList />
          </Container>
        </div>
    );
  }
}

export default LogicLectures;

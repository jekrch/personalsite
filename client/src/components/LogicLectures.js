import React, { Component } from "react";
import "../App.css";
import LectureList from "./LectureList";
import { Provider } from "react-redux";
import store from "../store";
import { Container } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

class LogicLectures extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Container>
            <br />
            <br />

            <LectureList />
          </Container>
        </div>
      </Provider>
    );
  }
}

export default LogicLectures;

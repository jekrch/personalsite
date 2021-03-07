import React, { Component } from "react"
import "../App.css"
import { Provider } from "react-redux"
import store from "../store"
import { Container } from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"

class ChordBuildr extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
            <br />
            Chord Buildr is a project I started with another developer to make
            it easy for musicians and songwriters to create, share, and
            experiment with chord progressions.
            <br />
            <br />
            We are aiming to release a beta version in early 2021.
          </Container>
        </div>
      </Provider>
    )
  }
}

export default ChordBuildr

import React, { Component } from "react"
import "../App.css"
import { Provider } from "react-redux"
import store from "../store"
import { Container } from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"

//"../../public/images/chordbuildr.png"

class ChordBuildr extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
            <br />
            Chord Buildr is a project I started with{" "}
            <a href="https://www.linkedin.com/in/teran-keith-210941107/">
              Teran Keith
            </a>{" "}
            to make it easy for musicians and music enthusiasts to create,
            share, and experiment with chord progressions.
            <br />
            <br />
            Check out our recent beta:{" "}
            <a href="https://chordbuildr.com/?prog=(1C)">
              https://chordbuildr.com/?prog=(1C)
            </a>
            <br />
            <br />
            {/* <div
              style={{ alignItems: "center", display: "flex", width: "100%" }}
            >
              <img
                src="/images/chordbuildr.png"
                alt="chordbuildr"
                style={{
                  alignItems: "center",
                  height: "30em",
                  position: "relative"
                }}
              />
            </div> */}
          </Container>
        </div>
      </Provider>
    )
  }
}

export default ChordBuildr

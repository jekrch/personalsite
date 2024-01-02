import React, { Component } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"

const imagePaths = [
  "/images/chordbuildr.png",
  "/images/chordbuildrios.jpg"
]

class ChordBuildr extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
        <div className="App">
          <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
            <a href="https://chordbuildr.com/" style={{ fontSize: 16, marginRight: 10 }}>
              www.chordbuildr.com
            </a>
            <a href="https://github.com/jekrch/chord-buildr">
              (github)
            </a>
            <br />
            <br />
            Chord Buildr is a project I started with{" "}
            <a href="https://www.linkedin.com/in/teran-keith-210941107/">
              Teran Keith
            </a>{" "}
            to make it easy for musicians and music enthusiasts to create,
            share, and experiment with chord progressions.
            <br />
            <br /> <br />
            <ImageCarousel items={imagePaths} />
            <br/><br/>
          </Container>
        </div>
    )
  }
}

export default ChordBuildr;

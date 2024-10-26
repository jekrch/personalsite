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
          <div className="mb-10">
            <div className="mb-6">
              <a
                href="https://chordbuildr.com/"
                target="_blank" rel="noopener noreferrer"
                className="text-16 mr-3 text-[16px]">
                www.chordbuildr.com
              </a>
              <a
                href="https://github.com/jekrch/chord-buildr"
                target="_blank" rel="noopener noreferrer"
                className="text-[12px] mb-8">
               (github)
              </a>
              <br />
              {/* <div className="mt-1">          
                <GitHubButton
                href="https://github.com/jekrch/chord-buildr"
                data-color-scheme="no-preference: light; light: light; dark: dark;"
                data-size="tiny"
                data-show-count="true"
                className="hover:text-blue"
                aria-label="repo @jekrch on GitHub">Repo
              </GitHubButton>
              </div> */}


            </div>
            Chord Buildr is a project I started with{" "}
            <a href="https://www.linkedin.com/in/teran-keith-210941107/" target="_blank" rel="noopener noreferrer">
              Teran Keith
            </a>{" "}
            to make it easy for musicians and music enthusiasts to create,
            share, and experiment with chord progressions.
          </div>
          <ImageCarousel items={imagePaths} />
          <br /><br />
        </Container>
      </div>
    )
  }
}

export default ChordBuildr;

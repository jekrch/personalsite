import { Component } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"

const imagePaths = [
  "/images/chordbuildr.png",
  "/images/chordbuildrios.jpg"
]

class ChordBuildr extends Component {
  constructor(props: any) {
    super(props)
  }

  render() {
    return (
      <div className="App">
        <PageHeader
          mainLink="https://chordbuildr.com/"
          mainLinkText="www.chordbuildr.com"
          githubLink="https://github.com/jekrch/chord-buildr"
          githubText="(github)"
        />
        <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
          <div className="mb-10">          
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

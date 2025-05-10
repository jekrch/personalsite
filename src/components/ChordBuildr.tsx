import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"

const imagePaths = [
  "/images/chordbuildr1.png",
  "/images/chordbuildr2.png",
  "/images/chordbuildr3.png",
  "/images/chordbuildr4.png",
  "/images/chordbuildr5.png",
]

const ChordBuildr: FC = () => {

  return (
    <div className="App">
      <PageHeader
        mainLink="https://chordbuildr.com/"
        mainLinkText="chordbuildr.com"
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
        <ImageCarousel 
          items={imagePaths} 
          className="!min-h-[30em] !max-h-[30em]" 
        />
        <br /><br />
      </Container>
    </div>
  )
}


export default ChordBuildr;

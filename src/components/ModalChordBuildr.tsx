import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"

const imagePaths = [
  "/images/modal1.png",
  "/images/modal2.png",
  "/images/modal3.png",
  "/images/modal4.png",
  "/images/modal5.png",
  "/images/modal6.png",
]

const ChordBuildr: FC = () => {

  return (
    <div className="App">
      <PageHeader
        mainLink="https://modal.chordbuildr.com/"
        mainLinkText="modal.chordbuildr.com"
        githubLink="https://github.com/jekrch/chord-analyzr"
        githubText="(github)"
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <div className="mb-6">
          <p>
            After creating ChordBuildr, which focused on sharing and transcribing chord progressions, I began thinking about how I could use similar tools to enhance my music writing experience.
          </p>

        </div>
        <ImageCarousel
          items={imagePaths}
          className="!min-h-[30em] !max-h-[30em]"
        />
        <div className="mt-8">
          <p>
            When I write music, I tend to start with a chord progression: i.e. the underlying infrastructure of the piece. This is typically an exploratory process, where I experiment with different chords and phrasings in various sequences until I find something novel that starts to inspire melodic and rhythmic ideas.

          </p>
          <p>
            One of my biggest hurdles is finding interesting new progressions through this process. I think many of us have a tendency to repeat ourselves here, sticking to what's familiar and what worked before. This can be an important part of developing your own personal style, but it can also quickly suck the life out of your creative process.
          </p>
          <p>
            When I'm in such a rut, I'll look for ways to "surprise" myself with progressions I wouldn't intuitively reach for. Modal ChordBuildr was designed first and foremost to drive this kind of creative process.
          </p>
          <p>
            When a user specifies their mode and key, Modal ChordBuildr quickly generates a broad array of chords within those constraints, allowing the user to sample each chord, add it to their progression, and reorder on the fly. 
          </p>
          <p>
            A major point of creative control comes from manipulating the mode. On my own, I tend to stick to your classic major (Ionian) and minor (Aeolian) scales, but switching briefly to something less familiar can unlock really interesting harmonic ideas. 
          </p>
          <p>
            Adding a sequencer, midi recording, and extended synthesizer effects add further texture here. At least in my case, all of this helps me to break out of stale habits, and into that interesting new stuff that makes composing music so inspiring and fun.
          </p>
        </div>     
      </Container>
    </div>
  )
}


export default ChordBuildr;

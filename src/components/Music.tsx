import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import SoundCloudPlayer from "./SoundCloudPlayer"

const Music: FC = () => {

  return (

    <div className="App">
      <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>

        <p>
          I've made music most of my life with family and friends. Since I was a teenager, I've probably been in a dozen bands, across various genres and sensibilities: rock, pop, experimental, hip-hop, dixieland jazz, bluegrass. But alas, sadly, I've been on a bandless streak for the last several years.
        </p>
        <p className="mb-10">
          To keep myself distracted while I'm between groups, I've gotten into recording little bite-sized songs. Here are a few from my soundcloud:
        </p>

        <SoundCloudPlayer />

        <div className="mt-10" />
      </Container>

    </div>
  )
}


export default Music

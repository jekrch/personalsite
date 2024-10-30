import { Component } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import SoundCloudPlayer from "./SoundCloudPlayer"

class Music extends Component {
  constructor(props: any) {
    super(props)
  }

  render() {
    return (

      <div className="App">
        <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
      
          <p>
            I've made music most of my life with family and friends. Since I was a teenager, I've probably been in a dozen bands, each with their own personality: rock, pop, experimental, hip-hop, dixieland jazz, bluegrass. Sadly, I've been on a bandless run for the last several years. My wife joked once that I should join a support group for people who want to be in a band, but it occurred to me that that just <i>is</i> a band, right? 
          </p>
          <p className="mb-10">
            Anyways, to keep myself distracted while I'm in between bands, I've gotten into recording little bite-sized songs. Here are a few from my soundcloud: 
          </p>

          <SoundCloudPlayer/>

        <div className="mt-10"/>
        </Container>

      </div>
    )
  }
}

export default Music

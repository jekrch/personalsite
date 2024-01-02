import React, { Component } from "react"
import { Container } from "reactstrap"
import ImageCarousel from "./ImageCarousel"

const imagePaths = [
  "/images/trees.jpg",
  "/images/plants.jpg"
]

class Home extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Container style={{paddingBottom: '3em'}}> 
        <div
          style={{
            marginTop: "3em",
            marginBottom: "3em",
            fontFamily: "helvetica",
            fontSize: 14
          }}
        >
          I'm a software engineer from Minneapolis who's interested in music, technology, and philosophy. Check out the links to see some of my current and past projects.
        </div>

        <ImageCarousel items={imagePaths}/>

      </Container>
    )
  }
}

export default Home

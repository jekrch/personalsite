import React, { Component } from "react"
import { Container } from "reactstrap"
import ImageCarousel from "./ImageCarousel"

const imagePaths = [
  "/images/trees.jpg",
  "/images/plants.jpg",
  "/images/sky.jpg"
]

class Home extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Container className="pb-[3em]">
        <div className="content-text my-[3em]">
          I'm a software engineer in Minneapolis who's interested in music, technology, and philosophy. Check out the links to see some of my current and past projects.
        </div>

        <ImageCarousel items={imagePaths} />

      </Container>
    )
  }
}

export default Home

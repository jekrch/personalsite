import React, { Component } from "react"
import "../App.css"
import { Provider } from "react-redux"
import store from "../store"
import {
  Carousel,
  Container,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"

//"../../public/images/chordbuildr.png"

const items = [
  {
    src: "/images/chordbuildr.png"
  },
  {
    src: "/images/chordbuildrios.jpg"
  }
]

class ChordBuildr extends Component {
  constructor(props) {
    super(props)
    this.state = { activeIndex: 0 }
    this.next = this.next.bind(this)
    this.previous = this.previous.bind(this)
    this.goToIndex = this.goToIndex.bind(this)
    this.onExiting = this.onExiting.bind(this)
    this.onExited = this.onExited.bind(this)
  }

  onExiting() {
    this.animating = true
  }

  onExited() {
    this.animating = false
  }

  next() {
    if (this.animating) return
    const nextIndex =
      this.state.activeIndex === items.length - 1
        ? 0
        : this.state.activeIndex + 1
    this.setState({ activeIndex: nextIndex })
  }

  previous() {
    if (this.animating) return
    const nextIndex =
      this.state.activeIndex === 0
        ? items.length - 1
        : this.state.activeIndex - 1
    this.setState({ activeIndex: nextIndex })
  }

  goToIndex(newIndex) {
    if (this.animating) return
    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state

    const slides = items.map((item) => {
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={item.src}
        >
          <div style={{ overflow: "hidden", height: "500px" }}>
            <img src={item.src} alt={item.altText} width="100%" />
          </div>
          <CarouselCaption
            captionText={item.caption}
            captionHeader={item.caption}
          />
        </CarouselItem>
      )
    })

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
            <br /> <br />
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
            <Carousel
              activeIndex={activeIndex}
              next={this.next}
              previous={this.previous}
            >
              <CarouselIndicators
                items={items}
                activeIndex={activeIndex}
                onClickHandler={this.goToIndex}
              />
              {slides}
              <CarouselControl
                direction="prev"
                directionText="Previous"
                onClickHandler={this.previous}
              />
              <CarouselControl
                direction="next"
                directionText="Next"
                onClickHandler={this.next}
              />
            </Carousel>{" "}
            <br />
            <br />
            <br />
          </Container>
        </div>
      </Provider>
    )
  }
}

export default ChordBuildr

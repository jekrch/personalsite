import React, { Component } from "react"
import "../App.css"
import {
  Carousel,
  Container,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"


const items = [
  {
    src: "/images/eurovision-ranker1.png"
  },
  {
    src: "/images/eurovision-ranker2.png"
  },
  {
    src: "/images/eurovision-ranker3.png"
  },
  {
    src: "/images/eurovision-ranker4.png"
  },
  {
    src: "/images/eurovision-ranker5.png"
  }
]

class EurovisionRanker extends Component {
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
          <div style={{ overflow: "hidden", height: "400px" }}>
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

        <div className="App">
          <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
         <div>
            <a href="https://www.eurovision-ranker.com" style={{ marginRight: 10, fontSize: 16 }}>
              www.eurovision-ranker.com
            </a>
   
            <a href="https://github.com/jekrch/eurovision-ranker">
              (github)
            </a>
            </div>
            <br />
            <p>
            The Eurovision Ranker is a web app that makes it easy to rank your favorite Eurovision contestants for each contest year going back to 1956. The ranking is stored in the URL so you can save it for later reference or share it with friends. There’s a “tour” on the site that demos other features: e.g. you can generate YouTube playlists, explore the official voting results from previous years, and view a heat map of your ranking.
            </p>
            <p>
            The Eurovision Song Contest finale drew 168 million viewers in 2023, eclipsing the Super Bowl of that same year by over 50 million. Viewers play a critical role in determining the winner over 3 separate events involving around 50 contestants. Unsurprisingly, much of the social media surrounding the event is focused on ranking artists in various categories. Despite this, there are currently no modern, easily-accessible tools for facilitating viewer rankings. This, along with my own love of the contest, inspired me to create this app.  
            </p>
            <br />      
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
            </Carousel>
          
          </Container>
          <br/><br/><br/>
        </div>
    )
  }
}

export default EurovisionRanker

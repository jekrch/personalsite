import React, { Component } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"

const imagePaths = [
  "/images/eurovision-ranker1.png",
  "/images/eurovision-ranker2.png",
  "/images/eurovision-ranker3.png",
  "/images/eurovision-ranker4.png",
  "/images/eurovision-ranker5.png",
  "/images/eurovision-ranker6.png",
  "/images/eurovision-ranker7.png",
  "/images/eurovision-ranker8.png"
]

class EurovisionRanker extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (

      <div className="App">
        <Container style={{ fontFamily: "helvetica", fontSize: 14 }}>
          <div>
            <div className="mb-6">
              <a
                href="https://www.eurovision-ranker.com"
                target="_blank" rel="noopener noreferrer"
                className="text-16 mr-3 text-[16px]">
                www.eurovision-ranker.com
              </a>
              <a
                href="https://github.com/jekrch/eurovision-ranker"
                target="_blank" rel="noopener noreferrer"
                className="text-[12px] mb-8">
                (github)
              </a>
            </div>
          </div>

          <p>
            The Eurovision Ranker is a web app that makes it easy to rank your favorite Eurovision contestants for each contest year going back to 1956. The ranking is stored in the URL so you can save it for later reference or share it with friends. There’s a “tour” on the site that demos other features: e.g. you can generate YouTube playlists, explore the official voting results from previous years, and view a heat map of your ranking.
          </p>
          <p className="mb-10">
            The Eurovision Song Contest finale drew 168 million viewers in 2023, eclipsing the Super Bowl of that same year by over 50 million. Viewers play a critical role in determining the winner over 3 separate events involving around 50 contestants. Unsurprisingly, much of the social media surrounding the event is focused on ranking artists in various categories. Despite this, there are currently no modern, easily-accessible tools for facilitating viewer rankings. This, along with my own love of the contest, inspired me to create this app.
          </p>

          <ImageCarousel items={imagePaths} />
        <div className="mt-10"/>
        </Container>

      </div>
    )
  }
}

export default EurovisionRanker

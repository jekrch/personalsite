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
  "/images/eurovision-ranker5.png"
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
            <ImageCarousel items={imagePaths}/>
          
          </Container>
          <br/><br/><br/>
        </div>
    )
  }
}

export default EurovisionRanker

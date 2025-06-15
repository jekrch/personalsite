import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"

const imagePaths = [
  "/images/juxtaglobe1.png",
  "/images/juxtaglobe2.png",
  "/images/juxtaglobe3.png"
]

const JuxtaGlobe: FC = () => {

  return (
    <div className="App">
      <PageHeader
        mainLink="https://juxtaglobe.com/"
        mainLinkText="juxtaglobe.com"
        githubLink="https://github.com/jekrch/juxtaglobe"
        githubText="(github)"
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <div className="mb-10">

          <p>
            JuxtaGlobe is a fun little project that I created out of my own curiosity about what's on the other side of the earth from me. The answer, I'm sorry to say, is almost always water! That's right, only about 5% of land on earth is antipodal to land.
          </p>
          <p>
            Once the disappointment of this awkward discovery had worn off, I thought about what else I could do with this dual globe layout. I've often wondered how my home town and current town compare with respect to their relative scale. So I added a dual point feature to compare any two places. I also added prehistoric maps to compare our world across time, from Pangea to the present.
          </p>
          <p>
            I thought the result satisfied my "spacial" curiosities in novel ways. I hope you can have some similar fun with it. If you have any interesting ideas about where to take it next, feel free to reach out or start contributing on on github.
          </p>
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


export default JuxtaGlobe;

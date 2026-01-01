import { FC } from "react"
import "../App.css"
import {
  Container,
} from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import ImageCarousel from "./ImageCarousel"
import PageHeader from "./PageHeader"

const imagePaths = [
  "/images/gbmeter1.png",
  "/images/gbmeter2.png",
  "/images/gbmeter3.png",
  "/images/gbmeter4.png",
]

const GbMeter: FC = () => {

  return (
    <div className="App">
      <PageHeader
        mainLink="https://gbmeter.com/"
        mainLinkText="gbmeter.com"
        githubLink="https://github.com/jekrch/energy-meter"
        githubText="(github)"
      />
      <Container style={{ fontFamily: "Helvetica", fontSize: 14 }}>
        <div className="mb-6">
          <p>
            After having a heat pump installed in our old Minneapolis house, I started paying close attention to our energy bill in order to get a better sense of our usage patterns and understand where we might be able to improve efficiency. While the utility company provided a basic breakdown of our monthly consumption, I wanted something more granular and visual that could help me track trends over time.
          </p>
          <p>
           This led me to create GB Meter. 
          </p>
        </div>
        <ImageCarousel
          items={imagePaths}
          className="!min-h-[30em] !max-h-[30em]"
        />
        <div className="mt-8">
          <p>
            I learned that our utility company, like many others in the US, provides access to detailed hourly energy usage data through the Green Button initiative. This data is available in a standardized XML format, which makes it relatively straightforward to download, however, I wasn't able to find any free tools that could parse the data in the complex ways that I really wanted. 
          </p>
          <p>
            I wanted to answer questions like: on average which hours of the day am I using the most and least energy on average? And how does that answer change according to different months, years, outdoor temperature-ranges? Or during what months are my average weekday nighttime usage levels highest? Questions like this require aggregating and visualizing large amounts of data in flexible ways, which is where GB Meter comes in.
          </p>
          <p>
            After building out the initial version for myself, I wanted to make it accessible to a wider audience. After discussing the concept with a few friends, including one in the energy efficiency space, I worked on incorporating temperature data from Open-Meteo, and providing a user friendly set of questions that users could click on to generate complex filters/aggregations that answered those questions visually and intuitively.
          </p>
          <p>
            I'm still actively developing GB Meter and am open to feedback and suggestions. My hope is that it can serve as a useful tool for other homeowners like myself who are looking to better understand and manage their energy consumption.
          </p>
        </div>     
      </Container>
    </div>
  )
}


export default GbMeter;

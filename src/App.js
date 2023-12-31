import React, { Component } from "react"
import AppNavbar from "./components/AppNavbar"
import "./App.css"

import LogicLectures from "./components/LogicLectures"
import ChordBuildr from "./components/ChordBuildr"
import EurovisionRanker from "./components/Eurovision"
import Home from "./components/Home"
import "bootstrap/dist/css/bootstrap.min.css"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

class App extends Component {
  render() {
    return (
      <div>
        {/* <AppNavbar /> */}
        {/* <Router>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/logiclectures" exact component={LogicLectures} />
            <Route path="/chordbuildr" exact component={ChordBuildr} />
            <Route path="/eurovision-ranker" exact component={EurovisionRanker} />
          </Switch>
        </Router> */}
      </div>
    )
  }
}

export default App

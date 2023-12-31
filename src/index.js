import ReactDOM from 'react-dom';
import App from './App';
import LogicLectures from "./components/LogicLectures"
import ChordBuildr from "./components/ChordBuildr"
import EurovisionRanker from "./components/Eurovision"
import Home from "./components/Home"
import AppNavbar from "./components/AppNavbar"
import { HashRouter  as Router, Switch, Route } from 'react-router-dom'

ReactDOM.render(
    <>
        <AppNavbar />
        <Router >
            <Switch>
                <Route exact path="/">
                    <Home />
                </Route>
                <Route path="/logiclectures" exact component={LogicLectures} />
                <Route path="/chordbuildr" exact component={ChordBuildr} />
                <Route path="/eurovision-ranker" exact component={EurovisionRanker} />

            </Switch>
        </Router>
    </>,
    document.getElementById('root'));

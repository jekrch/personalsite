import ReactDOM from 'react-dom';
import App from './App';
import LogicLectures from "./components/LogicLectures"
import ChordBuildr from "./components/ChordBuildr"
import EurovisionRanker from "./components/Eurovision"
import Home from "./components/Home"
import AppNavbar from "./components/AppNavbar"
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import "./App.css"

ReactDOM.render(
    <>
        <AppNavbar />
        <div className="app content-max-width">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/logiclectures" element={<LogicLectures />} />
                    <Route path="/chordbuildr" element={<ChordBuildr />} />
                    <Route path="/eurovision-ranker" element={<EurovisionRanker />} />
                </Routes>
            </Router>
        </div>
    </>,
    document.getElementById('root')
);

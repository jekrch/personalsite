import ReactDOM from 'react-dom';
import LogicLectures from "./components/LogicLectures"
import ChordBuildr from "./components/ChordBuildr"
import Music from "./components/Music"
import EurovisionRanker from "./components/Eurovision"
import Home from "./components/Home"
import AppNavbar from "./components/AppNavbar"
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import "./App.css"

ReactDOM.render(
    <div className="pb-[6em] min-h-screen h-full">
        <AppNavbar />
        <div className="app content-max-width">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/logiclectures" element={<LogicLectures />} />
                    <Route path="/chordbuildr" element={<ChordBuildr />} />
                    <Route path="/eurovision-ranker" element={<EurovisionRanker />} />
                    <Route path="/music" element={<Music />} />
                </Routes>
            </Router>
        </div>
    </div>,
    document.getElementById('root')
);

import { Container, createRoot } from 'react-dom/client';
import LogicLectures from "./components/LogicLectures"
import ChordBuildr from "./components/ChordBuildr"
import Music from "./components/Music"
import EurovisionRanker from "./components/Eurovision"
import Home from "./components/Home"
import AppNavbar from "./components/AppNavbar"
import SocialIconBar from "./components/SocialIconBar"
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import "./App.css"
import FilmClub from './components/FilmClub';
import JuxtaGlobe from './components/JuxtaGlobe';
import ModalChordBuildr from './components/ModalChordBuildr';

const rootElement = document.getElementById('root') as Container;
const root = createRoot(rootElement);

root.render(
  <Router>
    <div className="pb-[2em] min-h-screen h-full relative app-wrapper bg-white">
      {/* conditionally render navbar, hiding it specifically for comics-25 */}
      <Routes>
        <Route path="/comics-25" element={null} />
        <Route path="*" element={<AppNavbar />} />
      </Routes>
      
      {/* constrained-width routes */}
      <div className="app content-max-width">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/logiclectures" element={<LogicLectures />} />
          <Route path="/chordbuildr" element={<ChordBuildr />} />
          <Route path="/modal-chordbuildr" element={<ModalChordBuildr />} />
          <Route path="/eurovision-ranker" element={<EurovisionRanker />} />
          <Route path="/music" element={<Music />} />
          <Route path="/criterion-club" element={<FilmClub />} />
          <Route path="/juxtaglobe" element={<JuxtaGlobe />} />
        </Routes>
      </div>
      
      {/* render social bar globally, including on comics-25 */}
      <SocialIconBar />
    </div>
  </Router>
);
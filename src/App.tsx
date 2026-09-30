import { SECTION_IDS } from "./consts";
import {
  ClientStrip,
  Header,
  Intro,
  Description,
  Experience,
  Footer,
  Services,
  Contact,
  Feedback,
} from "./components";

import "./styles.css";

// TODO:
// Катины фотокарточки покрутить

function App() {
  return (
    <div className="site-shell">
      <Header />
      <main id={SECTION_IDS.top}>
        <Intro />
        <ClientStrip />
        <Description />
        <Services />
        <Experience />
        <Feedback />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;

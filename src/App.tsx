import { SECTION_IDS } from "./consts";
import {
  Contact,
  ClientStrip,
  Description,
  Experience,
  Footer,
  Header,
  Intro,
  Feedback,
  Services,
} from "./components";

import "./styles.css";

export const App = () => {
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
};

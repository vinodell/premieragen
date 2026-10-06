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

// TODO: в случае не отправки заявки в телегу - отправлять на почту

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

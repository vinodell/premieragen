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
} from "./components";

import "./styles.css";

// TODO:
// Contacts component
// 1) иконка телеги в контакты
// 2) что нужно улучшить - взять из premieragen
// 3) часы работы

// Intro component
// 1) добавить блок схему интерактивную

// Feedback component add
// нужны отзывы

// Team component?

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
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;

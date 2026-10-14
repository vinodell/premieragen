import { useEffect, useState } from "react";
import { SECTION_IDS } from "./consts";
import {
  PersonalDataDocument,
  type PersonalDataDocumentKind,
} from "./components/PersonalDataDocument";
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

const getPersonalDataDocument = (): PersonalDataDocumentKind | undefined => {
  if (window.location.hash === "#personal-data-consent") return "consent";
  if (window.location.hash === "#privacy-policy") return "policy";
};

export const App = () => {
  const [personalDataDocument, setPersonalDataDocument] = useState(
    getPersonalDataDocument,
  );

  useEffect(() => {
    const handleHashChange = () => {
      setPersonalDataDocument(getPersonalDataDocument());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (personalDataDocument) {
    return <PersonalDataDocument kind={personalDataDocument} />;
  }

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

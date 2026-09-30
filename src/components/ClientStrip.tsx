import "./ClientStrip.css";
import { CLIENTS } from "../consts";

export const ClientStrip = () => {
  return (
    <section
      className="logo-strip"
      aria-label="Компании, с которыми мы работали"
    >
      <p>
        Опыт людей
        <br />
        из команд
      </p>
      <div className="logo-track">
        {CLIENTS.map((client) => (
          <span key={client}>{client}</span>
        ))}
      </div>
    </section>
  );
};

import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { PERSONAL_DATA_OPERATOR } from "./consts";

afterEach(() => window.history.replaceState(null, "", "/"));

test("renders the growth agency landing page", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /premier agency/i,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /отправить запрос/i }),
  ).toBeInTheDocument();
});

test.each([
  ["personal-data-consent", "Согласие на обработку персональных данных"],
  ["privacy-policy", "Политика обработки персональных данных"],
])("opens the standalone document at #%s", (hash, title) => {
  window.history.replaceState(null, "", `/#${hash}`);
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: title }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: PERSONAL_DATA_OPERATOR.email }),
  ).toHaveAttribute("href", `mailto:${PERSONAL_DATA_OPERATOR.email}`);
  expect(
    screen.queryByRole("button", { name: /Отправить запрос/ }),
  ).not.toBeInTheDocument();
  expect(document.title).toContain(title);
});

test("internal links point to existing page sections", () => {
  render(<App />);

  const internalLinks = screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("href")?.startsWith("#"));

  expect(internalLinks.length).toBeGreaterThan(0);
  internalLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.slice(1) ?? "";
    // Anchor navigation resolves DOM IDs rather than accessible roles.
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById(targetId)).toBeInTheDocument();
  });
});

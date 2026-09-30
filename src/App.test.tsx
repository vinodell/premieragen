import { render, screen } from "@testing-library/react";
import App from "./App";

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


test("internal links point to existing page sections", () => {
  render(<App />);

  const internalLinks = screen.getAllByRole("link").filter((link) =>
    link.getAttribute("href")?.startsWith("#"),
  );

  expect(internalLinks.length).toBeGreaterThan(0);
  internalLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.slice(1) ?? "";
    // Anchor navigation resolves DOM IDs rather than accessible roles.
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById(targetId)).toBeInTheDocument();
  });
});

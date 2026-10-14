import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Contact } from "./Contact";
import { sendData } from "../api";
import {
  CONTACT_REQUEST_OPTIONS,
  PERSONAL_DATA_CONSENT_VERSION,
  PERSONAL_DATA_DOCUMENT_URLS,
} from "../consts";

jest.mock("../api", () => ({ sendData: jest.fn() }));
const sendMock = sendData as jest.MockedFunction<typeof sendData>;

const fillForm = () => {
  fireEvent.change(screen.getByLabelText("Ваше имя"), {
    target: { value: " Катя " },
  });
  fireEvent.change(screen.getByLabelText("Рабочий email"), {
    target: { value: "kate@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Что нужно улучшить?"), {
    target: { value: CONTACT_REQUEST_OPTIONS[0] },
  });
  fireEvent.change(screen.getByLabelText("Удобная дата и время звонка"), {
    target: { value: "2099-01-01T12:00" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
};

beforeEach(() => sendMock.mockReset());

test("validates and sends the form, shows success and resets fields", async () => {
  sendMock.mockResolvedValue();
  render(<Contact />);
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /Отправить запрос/ }));
  expect(await screen.findByText(/Заявка отправлена!/)).toBeInTheDocument();
  expect(sendMock).toHaveBeenCalledWith({
    name: "Катя",
    email: "kate@example.com",
    feature: CONTACT_REQUEST_OPTIONS[0],
    date: new Date("2099-01-01T12:00").toISOString(),
    consent: {
      accepted: true,
      acceptedAt: expect.any(String),
      version: PERSONAL_DATA_CONSENT_VERSION,
    },
  });
  expect(screen.getByLabelText("Ваше имя")).toHaveValue("");
  expect(screen.getByRole("checkbox")).not.toBeChecked();
});

test("blocks repeated clicks while sending and preserves fields on error", async () => {
  let rejectRequest: (reason: Error) => void = () => {};
  sendMock.mockImplementation(
    () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
  );
  render(<Contact />);
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /Отправить запрос/ }));
  const button = screen.getByRole("button", { name: /Отправляем/ });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(sendMock).toHaveBeenCalledTimes(1);
  rejectRequest(new Error("Network error"));
  expect(
    await screen.findByText(/Не удалось отправить заявку/),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Ваше имя")).toHaveValue(" Катя ");
  expect(screen.getByRole("checkbox")).toBeChecked();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: /Отправить запрос/ }),
    ).toBeEnabled(),
  );
});

test("rejects a whitespace-only name", () => {
  render(<Contact />);
  fillForm();
  fireEvent.change(screen.getByLabelText("Ваше имя"), {
    target: { value: "   " },
  });
  fireEvent.click(screen.getByRole("button", { name: /Отправить запрос/ }));
  expect(screen.getByLabelText("Ваше имя")).toBeInvalid();
  expect(sendMock).not.toHaveBeenCalled();
});

test("requires separate consent even on direct form submission", () => {
  render(<Contact />);
  const checkbox = screen.getByRole("checkbox");
  expect(checkbox).not.toBeChecked();
  expect(checkbox).toBeRequired();
  fillForm();
  fireEvent.click(checkbox);
  fireEvent.submit(screen.getByLabelText("Ваше имя"));
  expect(checkbox).toBeInvalid();
  expect(sendMock).not.toHaveBeenCalled();
  expect(
    screen.getByRole("link", {
      name: /согласие на обработку персональных данных/,
    }),
  ).toHaveAttribute("href", PERSONAL_DATA_DOCUMENT_URLS.consent);
  expect(
    screen.getByRole("link", {
      name: /Политика обработки персональных данных/,
    }),
  ).toHaveAttribute("href", PERSONAL_DATA_DOCUMENT_URLS.policy);
});

test("rejects a past appointment even on direct form submission", () => {
  render(<Contact />);
  fillForm();
  const appointment = screen.getByLabelText("Удобная дата и время звонка");
  fireEvent.change(appointment, { target: { value: "2000-01-01T12:00" } });
  // A submit event from an input bubbles to its form.
  fireEvent.submit(appointment);
  expect(appointment).toBeInvalid();
  expect(sendMock).not.toHaveBeenCalled();
});

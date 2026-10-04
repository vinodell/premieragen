import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Contact } from "./Contact";
import { sendData } from "../api";
import { CONTACT_REQUEST_OPTIONS } from "../consts";

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
  });
  expect(screen.getByLabelText("Ваше имя")).toHaveValue("");
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

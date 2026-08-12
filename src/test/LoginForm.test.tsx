import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "../components/LoginForm";

/*  vi.fn<() => Promise<void>>(): Die Funktion ist typisiert und gibt ein Promise<void> zurück.
.mockResolvedValue(undefined): Jeder Aufruf liefert automatisch ein erfolgreich aufgelöstes Promise mit undefined(kein Wert) zurück */
// die Funktion wird mit einem optionalen Parameter aufgerufen
function renderComponent(
  // Der Promise wird sofort erfüllt, sodass der Pending-Zustand zu schnell endet
  onSubmit = vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
) {
  const user = userEvent.setup();

  render(<LoginForm onSubmit={onSubmit} />);

  return {
    user,
    onSubmit,
    getEmailInput: () => screen.getByRole("textbox", { name: /email/i }),
    getPasswordInput: () => screen.getByLabelText(/password/i),
    getSubmitButton: () =>
      screen.getByRole("button", { name: /login|logging in/i }),
  };
}

describe("LoginForm", () => {
  it.each([
    {
      scenario: "email is empty",
      email: "",
      password: "abc",
      shouldSubmit: false,
    },
    {
      scenario: "password is empty",
      email: "test@test.com",
      password: "",
      shouldSubmit: false,
    },
    {
      scenario: "email and password are empty",
      email: "",
      password: "",
      shouldSubmit: false,
    },
    {
      scenario: "email and password are valid",
      email: "test@test.com",
      password: "abc123",
      shouldSubmit: true,
    },
  ])(
    "Should validate form when $scenario",
    async ({ email, password, shouldSubmit }) => {
      // render the component
      const {
        getEmailInput,
        getPasswordInput,
        getSubmitButton,
        user,
        onSubmit,
      } = renderComponent();

      if (email) {
        await user.type(getEmailInput(), email);
      }
      if (password) {
        await user.type(getPasswordInput(), password);
      }

      await user.click(getSubmitButton());

      shouldSubmit
        ? expect(onSubmit).toHaveBeenCalledOnce()
        : expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  // TICKET 1.1
  it("renders email, password and login button", () => {
    const { getEmailInput, getPasswordInput, getSubmitButton } =
      renderComponent();
    expect(getEmailInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();

    // or better
    /*   expect(getEmailInput()).toBeVisible();
    expect(getPasswordInput()).toBeVisible();
    expect(getSubmitButton()).toBeVisible(); */
  });

  // TICKET 1.2
  it("keeps the submit button enabled initially", () => {
    const { getSubmitButton } = renderComponent();
    expect(getSubmitButton()).toBeEnabled();

    /*expect(isSubmitting).toBe(false); soll bei einem Test nicht getestet werden.
     Grund: bei einem Test wird nur das Verhalten getestet und nicht der Implementierungsdetail (
      Kann der Benutzer es sehen? → Teste es.
      Kann nur der Entwickler es sehen? → Teste es nicht direkt. )  */
  });

  /* Wenn der Benutzer:nichts eingibt und direkt auf Login klickt
dann soll gelten:Email and password are required und onSubmit wurde nicht aufgerufen. */
  // TICKET 1.3
  it("shows a validation message and does not submit when fields are empty", async () => {
    const { getSubmitButton, onSubmit, user } = renderComponent();
    await user.click(getSubmitButton());

    /* Warum findByRole()?
Weil nach dem Klick erst ein Re-Render stattfindet.(der state ändert sich nach dem Klick, deswegen wird die UI neu gerendert->findByRole wartet , das der Komponent neu gerendert wird,bevor es nach dem Element sucht)*/

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /email and password are required/i,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // TICKET 1.4
  it("submits trimmed credentials when the form is valid", async () => {
    const { getEmailInput, getPasswordInput, getSubmitButton, user, onSubmit } =
      renderComponent();

    await user.type(getEmailInput(), " arno@hotmail.de ");
    await user.type(getPasswordInput(), "jasmin1984");
    await user.click(getSubmitButton());
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      email: "arno@hotmail.de",
      password: "jasmin1984",
    });
  });

  // TICKET 1.5
  it("disables inputs and button while the async submission is pending", async () => {
    // creates a promise that is pending forever(wird nie aufgelöst) -> useful because we to test the pending state
    // const onSubmit = vi.fn().mockImplementation(() => new Promise(() => {}));
    //!bessere Wahl (kontrollierbare Promise)
    // type assertion (TypeScript soll annehmen, dass die Variable vor ihrer Verwendung zugewiesen wird.)
    let resolvePromise!: () => void;
    // Create a mock function that is passed to the component and  that returns a pending Promise when the form is submitted and that remains pending until resolvePromise() is called.
    const pendingSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          //!Referenzzuweisung für späteren Aufruf
          resolvePromise = resolve; //give resolvePromise the access to the resolve function to be able to resolve the promise using resolvePromise()
        }),
    );

    const { getEmailInput, getPasswordInput, getSubmitButton, user } =
      renderComponent(pendingSubmit);

    await user.type(getEmailInput(), "arno@hotmail.de");
    await user.type(getPasswordInput(), "jasmin1984");
    // erst nach dem button Klick, werden die Inputs und der Button disabled => await waitFor

    const button = getSubmitButton();
    // intern wird pendingSubmit aufgerufen, ein pending Promise erstellt
    await user.click(button);

    expect(getEmailInput()).toBeDisabled();
    expect(getPasswordInput()).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/logging in/i);
    resolvePromise(); //erfüllt den bisher pending promise state
  });

  // TICKET 1.6
  it("enables the form again after a successful submission", async () => {
    let resolvePromise!: () => void;
    // Create a mock function that is passed to the component and  that returns a pending Promise when the form is submitted and that remains pending until resolvePromise() is called.
    const pendingSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { getEmailInput, getPasswordInput, getSubmitButton, user } =
      renderComponent(pendingSubmit);

    const button = getSubmitButton();
    await user.type(getEmailInput(), "arno@hotmail.de");
    await user.type(getPasswordInput(), "jasmin1984");
    await user.click(button);
    expect(pendingSubmit).toHaveBeenCalledOnce();
    expect(pendingSubmit).toHaveBeenCalledWith({
      email: "arno@hotmail.de",
      password: "jasmin1984",
    });
    expect(getEmailInput()).toBeDisabled();
    expect(getPasswordInput()).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/logging in/i);
    resolvePromise(); //erfüllt den bisher pending promise state

    // auf den Re-Render nach setSubmitting(false) warten (await waitFor)
    await waitFor(() => {
      expect(getEmailInput()).not.toBeDisabled();
      expect(getPasswordInput()).not.toBeDisabled();
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent(/login/i);
    });
  });

  // TICKET 1.7
  it("shows an error and enables the form again when submission fails", async () => {
    // create a promise that is rejected when the form is submitted
    const rejectedPromise = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new Error("Something went wrong"));
    const { getEmailInput, getPasswordInput, getSubmitButton, user } =
      renderComponent(rejectedPromise);
    const button = getSubmitButton();
    await user.type(getEmailInput(), "arno@hotmail.de");
    await user.type(getPasswordInput(), "jasmin1984");
    await user.click(button);

    expect(rejectedPromise).toHaveBeenCalledOnce();

    expect(rejectedPromise).toHaveBeenCalledWith({
      email: "arno@hotmail.de",
      password: "jasmin1984",
    });
    // the rejected submission leads to an update of the error state causing a re-rendering
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/login failed/i);
      expect(getEmailInput()).toBeEnabled();
      expect(getPasswordInput()).toBeEnabled();
      expect(button).toBeEnabled();
      expect(button).toHaveTextContent(/login/i);
    });
  });
});

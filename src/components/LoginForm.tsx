import { useState, type SubmitEvent } from "react";

export type LoginCredentials = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
};

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        email: email.trim(),
        password
      });
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form aria-label="login form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          disabled={isSubmitting}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={isSubmitting}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

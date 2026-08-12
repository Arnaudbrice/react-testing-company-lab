import LoginForm, { type LoginCredentials } from "./components/LoginForm";

async function login(credentials: LoginCredentials): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  console.log("Logged in with:", credentials);
}

export default function App() {
  return (
    <main className="page">
      <section className="card">
        <h1>Company Testing Lab</h1>
        <p>Komponententest: LoginForm</p>
        <LoginForm onSubmit={login} />
      </section>
    </main>
  );
}

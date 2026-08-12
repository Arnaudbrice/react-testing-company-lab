# React Testing Company Lab

Dieses Projekt simuliert ein kleines Unternehmensticket für React-Komponententests.

## Voraussetzungen

- Node.js 20 oder neuer
- npm
- VS Code

## Installation

```bash
npm install
npm run dev
```

Tests starten:

```bash
npm test
```

Alle Tests einmal ausführen:

```bash
npm run test:run
```

Vitest UI:

```bash
npm run test:ui
```

## Projektziel

Du testest `src/components/LoginForm.tsx` mit:

- Vitest
- React Testing Library
- user-event
- TypeScript

Der API-/Login-Service wird in diesem Sprint über die `onSubmit`-Prop als Mock übergeben. Dadurch bleibt die Komponente isoliert: Es handelt sich um Komponententests.

## Ticket 1 – LoginForm

Öffne:

```text
src/components/LoginForm.test.tsx
```

Ersetze die `it.todo(...)`-Einträge nacheinander durch echte Tests.

### 1.1 Rendering

Prüfe:

- Email-Feld vorhanden
- Passwortfeld vorhanden
- Login-Button vorhanden

### 1.2 Initialzustand

Prüfe:

- Login-Button ist aktiviert

### 1.3 Validierung

Klicke ohne Eingaben auf Login.

Prüfe:

- `Email and password are required` erscheint
- `onSubmit` wurde nicht aufgerufen

Bonus: Schreibe später einen parametrisierten Test für:

- Email leer
- Passwort leer
- beide leer

### 1.4 Erfolgreicher Submit

Gib ein:

```text
Email: "  arnaud@example.com  "
Password: "secret123"
```

Prüfe, dass `onSubmit` mit folgendem Objekt aufgerufen wird:

```ts
{
  email: "arnaud@example.com",
  password: "secret123"
}
```

### 1.5 Pending State

Hier brauchst du eine kontrollierbare Promise:

```ts
let resolveSubmit!: () => void;

const pendingPromise = new Promise<void>((resolve) => {
  resolveSubmit = resolve;
});

const onSubmit = vi.fn(() => pendingPromise);
```

Nach dem Klick, bevor `resolveSubmit()` ausgeführt wurde:

- Button ist deaktiviert
- Button heißt `Logging in...`
- Email und Password sind deaktiviert

### 1.6 Nach erfolgreichem Submit

Rufe auf:

```ts
resolveSubmit();
```

Prüfe anschließend mit `waitFor` oder `findByRole`:

- Button heißt wieder `Login`
- Button ist aktiviert

### 1.7 Fehlerfall

```ts
const onSubmit = vi.fn().mockRejectedValue(new Error("Unauthorized"));
```

Prüfe:

- `Login failed. Please try again.` erscheint
- Button ist wieder aktiviert

## Firmenregeln für die Tests

1. Teste aus Sicht des Benutzers.
2. Bevorzuge `getByRole`, `getByLabelText` und `findByRole`.
3. Verwende `userEvent`, nicht `fireEvent`.
4. Teste keine internen State-Variablen.
5. Jeder Test soll klar beschreiben, welches Verhalten geprüft wird.
6. Erstelle für jeden Test einen frischen Mock.
7. Verwende keine festen Wartezeiten wie `setTimeout` im Test.

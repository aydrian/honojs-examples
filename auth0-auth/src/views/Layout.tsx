import type { FC, PropsWithChildren } from "hono/jsx";
import { raw } from "hono/html";
import { FAVICON_DATA_URI } from "../lib/favicon";

type LayoutProps = PropsWithChildren<{
  title?: string;
  user?: { name?: string; picture?: string } | null;
}>;

export const Layout: FC<LayoutProps> = ({
  title = "The Hono Guestbook",
  user,
  children,
}) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="dark" />
      <title>{title}</title>
      <link rel="icon" type="image/svg+xml" href={FAVICON_DATA_URI} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap"
      />
      <style>{raw(`/* Hallmark · macrostructure: Long Document · genre: atmospheric · theme: Terminal
 * paper-band: dark · display-style: mono · accent-hue: chromatic-other (phosphor)
 * nav: N7 mono-toolbar · footer: Ft7 mono-note · enrichment: none
 * tone: technical / dev-tool · audience: Hono + Auth0 + Cloudflare developers
 * Hallmark · pre-emit critique: P5 H4 E5 S5 R5 V5
 */

:root {
  --color-paper: oklch(16% 0.012 240);
  --color-paper-2: oklch(20% 0.014 240);
  --color-paper-3: oklch(24% 0.016 240);

  --color-ink: oklch(96% 0.005 240);
  --color-ink-2: oklch(74% 0.008 240);
  --color-ink-3: oklch(54% 0.010 240);

  --color-rule: oklch(28% 0.012 240);
  --color-rule-strong: oklch(38% 0.014 240);

  --color-accent: oklch(82% 0.18 145);
  --color-accent-hover: oklch(88% 0.18 145);
  --color-accent-soft: oklch(82% 0.18 145 / 0.22);

  --color-error: oklch(75% 0.13 25);
  --color-error-bg: oklch(28% 0.06 25);

  --font-display: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-body: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --text-display: clamp(2.5rem, 6vw, 4.5rem);
  --text-display-s: clamp(1.75rem, 4vw, 2.5rem);
  --text-2xl: 1.5rem;
  --text-xl: 1.25rem;
  --text-lg: 1.0625rem;
  --text-base: 0.9375rem;
  --text-sm: 0.8125rem;
  --text-xs: 0.75rem;

  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 72px;

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in: cubic-bezier(0.42, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 120ms;
  --dur-base: 200ms;

  --rule: 1px solid var(--color-rule);
  --rule-strong: 1px solid var(--color-rule-strong);
}

* { box-sizing: border-box; }

html, body {
  overflow-x: clip;
  margin: 0;
  padding: 0;
}

html {
  background: var(--color-paper);
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.55;
  color: var(--color-ink);
  background: var(--color-paper);
  min-height: 100svh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--color-accent);
  color: var(--color-paper);
}

a {
  color: inherit;
  text-decoration-color: var(--color-rule-strong);
  text-underline-offset: 3px;
  transition: color var(--dur-fast) var(--ease-out),
              text-decoration-color var(--dur-fast) var(--ease-out);
}

a:hover { text-decoration-color: var(--color-accent); }

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

p { margin: 0; }

/* Layout shell */
.shell {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg) var(--space-2xl);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .shell {
    padding: var(--space-2xl) var(--space-xl) var(--space-3xl);
  }
}

@media (max-width: 480px) {
  .shell {
    padding: var(--space-lg) var(--space-md) var(--space-2xl);
  }
}

/* Nav — N7 mono toolbar */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--rule);
  margin-bottom: var(--space-2xl);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  min-width: 0;
}

.nav-brand {
  color: var(--color-ink);
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  letter-spacing: -0.005em;
}

.nav-brand .prompt { color: var(--color-accent); }
.nav-brand .path { color: var(--color-ink-2); }
.nav-brand .caret { color: var(--color-ink-3); margin-left: 4px; }
.nav-brand:hover .caret { color: var(--color-accent); }

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.nav-who {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-ink-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  min-width: 0;
}

.nav-who img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: var(--rule);
  flex-shrink: 0;
  display: block;
}

.nav-who-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14ch;
}

@media (min-width: 768px) {
  .nav-who-name { max-width: none; }
}

@media (max-width: 480px) {
  .nav-who { display: none; }
}

.nav a.btn,
.nav a.link {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out);
}

.nav a.btn {
  padding: 6px 14px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  background: transparent;
  letter-spacing: 0.01em;
}

.nav a.btn:hover {
  background: var(--color-accent);
  color: var(--color-paper);
}

.nav a.link {
  color: var(--color-ink-2);
}

.nav a.link:hover {
  color: var(--color-ink);
  text-decoration-color: var(--color-rule-strong);
}

main { flex: 1; }

/* Page header */
.page-head {
  margin-bottom: var(--space-2xl);
}

.page-head h1 {
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--color-ink);
  margin: 0 0 var(--space-md);
  overflow-wrap: anywhere;
  min-width: 0;
}

.page-head .lede {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-ink-2);
  max-width: 52ch;
  line-height: 1.5;
  margin-bottom: var(--space-md);
}

.page-head .status {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink-3);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.page-head .status .dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-soft);
}

.page-head .status .count {
  color: var(--color-accent);
  font-weight: 500;
}

/* Stream */
.stream {
  display: flex;
  flex-direction: column;
}

.entry {
  padding: var(--space-xl) 0;
  border-top: var(--rule);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  opacity: 0;
  animation: enter var(--dur-base) var(--ease-out) forwards;
  animation-delay: calc(var(--i, 0) * 50ms);
}

.entry:last-child {
  border-bottom: var(--rule);
}

@keyframes enter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .entry {
    opacity: 1;
    transform: none;
    animation: none;
  }
}

.entry header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.entry img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: var(--rule);
  flex-shrink: 0;
  display: block;
}

.entry .name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.005em;
}

.entry time {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-3);
  margin-left: auto;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .entry time {
    margin-left: 0;
    flex-basis: 100%;
    margin-top: var(--space-2xs);
  }

  .entry img {
    width: 28px;
    height: 28px;
  }
}

.entry .message {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: 1.55;
  color: var(--color-ink);
  white-space: pre-wrap;
  max-width: 60ch;
  overflow-wrap: anywhere;
  margin: 0;
}

/* Empty state */
.empty {
  padding: var(--space-3xl) 0;
  border-top: var(--rule);
  border-bottom: var(--rule);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}

.empty .comment {
  color: var(--color-ink-3);
}

.empty .comment::before {
  content: "// ";
  color: var(--color-ink-3);
}

/* Sign form */
.sign-head h2 {
  font-family: var(--font-display);
  font-size: var(--text-display-s);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  margin: 0 0 var(--space-sm);
  overflow-wrap: anywhere;
  min-width: 0;
}

.posting-as {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink-2);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin: 0;
}

.posting-as::before {
  content: "$";
  color: var(--color-accent);
  font-weight: 500;
}

.posting-as img {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: var(--rule);
  display: block;
}

.posting-as strong {
  color: var(--color-ink);
  font-weight: 500;
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.field { position: relative; }

textarea {
  width: 100%;
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  line-height: 1.6;
  padding: var(--space-md);
  padding-bottom: var(--space-2xl);
  background: var(--color-paper-2);
  color: var(--color-ink);
  border: var(--rule);
  border-radius: 0;
  resize: vertical;
  min-height: 180px;
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
}

textarea::placeholder { color: var(--color-ink-3); }

textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-paper);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.counter {
  position: absolute;
  right: var(--space-md);
  bottom: var(--space-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-3);
  pointer-events: none;
  letter-spacing: 0.02em;
}

.counter.over { color: var(--color-error); }

button {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--color-accent);
  color: var(--color-paper);
  border: 1px solid var(--color-accent);
  padding: 10px 20px;
  cursor: pointer;
  align-self: flex-start;
  letter-spacing: 0.02em;
  font-weight: 500;
  transition: background var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
}

button:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

button:active { transform: translateY(0); }

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

button::before {
  content: "→ ";
  opacity: 0.7;
}

.error {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-left-width: 3px;
  color: var(--color-error);
  padding: var(--space-sm) var(--space-md);
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  line-height: 1.5;
}

.error::before {
  content: "!";
  font-weight: 700;
  color: var(--color-error);
  flex-shrink: 0;
}

/* Footer — Ft7 mono note */
.foot {
  margin-top: var(--space-3xl);
  padding-top: var(--space-md);
  border-top: var(--rule);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-ink-3);
  letter-spacing: 0.02em;
}

.foot a {
  color: var(--color-ink-2);
  text-decoration-color: var(--color-rule-strong);
}

.foot a:hover { color: var(--color-accent); }
`)}</style>
    </head>
    <body>
      <div class="shell">
        <nav class="nav">
          <a href="/" class="nav-brand" aria-label="The Hono Guestbook — home">
            <span class="prompt">$</span> <span>guestbook</span>{" "}
            <span class="caret">›</span>
          </a>
          <div class="nav-actions">
            {user ? (
              <>
                <span class="nav-who">
                  {user.picture ? <img src={user.picture} alt="" /> : null}
                  <span class="nav-who-name">{user.name ?? "you"}</span>
                </span>
                <a class="btn" href="/sign">
                  new entry
                </a>
                <a class="link" href="/auth/logout">
                  sign out
                </a>
              </>
            ) : (
              <a class="btn" href="/auth/login">
                sign in
              </a>
            )}
          </div>
        </nav>
        <main>{children}</main>
        <footer class="foot">
          built with <a href="https://hono.dev">hono</a> +{" "}
          <a href="https://github.com/auth0/auth0-hono">@auth0/auth0-hono</a> ·
          running on cloudflare workers
        </footer>
      </div>
    </body>
  </html>
);

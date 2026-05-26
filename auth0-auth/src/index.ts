import { Hono } from "hono";
import { auth, type OIDCEnv } from "@auth0/auth0-hono";
import { guestbook } from "./routes/guestbook";
import { FAVICON_SVG } from "./lib/favicon";

type Env = OIDCEnv<CloudflareBindings>;

const app = new Hono<Env>();

// Serve the same SVG at /favicon.ico and /favicon.svg. Browsers honour the
// <link rel="icon" type="image/svg+xml"> in <head>, but probes that hit
// /favicon.ico directly (curl, monitoring) get the SVG too.
app.get("/favicon.ico", (c) =>
  c.body(FAVICON_SVG, 200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=86400",
  }),
);

// Auth0 middleware. Reads AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET,
// BASE_URL, and AUTH0_SESSION_ENCRYPTION_KEY from the environment, and
// registers /auth/login, /auth/logout, and /auth/callback routes automatically.
//
// `authRequired: false` opts the app into per-route protection — see
// `requiresAuth()` in `src/routes/guestbook.tsx`.
//
// `idpLogout: true` federates /auth/logout to Auth0's /v2/logout endpoint so
// the tenant-level SSO cookie is cleared too. Without this, signing out only
// drops our app's session cookie — Auth0 still has a live SSO session and the
// next /auth/login silently re-authenticates the same user without showing
// the Universal Login screen.
app.use(auth({ authRequired: false, idpLogout: true }));

app.route("/", guestbook);

export default app;

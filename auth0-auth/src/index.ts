import { auth0, type OIDCEnv } from "@auth0/auth0-hono";
import { Hono } from "hono";
import { FAVICON_SVG } from "./lib/favicon";
import { guestbook } from "./routes/guestbook";

type Env = OIDCEnv<CloudflareBindings>;

const app = new Hono<Env>();

// Serve the same SVG at /favicon.ico and /favicon.svg. Browsers honour the
// <link rel="icon" type="image/svg+xml"> in <head>, but probes that hit
// /favicon.ico directly (curl, monitoring) get the SVG too.
app.get("/favicon.ico", (c) =>
  c.body(FAVICON_SVG, 200, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=86400"
  })
);

// Auth0 middleware. Reads AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET,
// APP_BASE_URL, and AUTH0_SESSION_ENCRYPTION_KEY from the environment, and
// registers /auth/login, /auth/logout, and /auth/callback routes automatically.
//
// `authRequired: false` opts the app into per-route protection — see
// `requiresAuth()` in `src/routes/guestbook.tsx`.
app.use(auth0({ authRequired: false }));

app.route("/", guestbook);

export default app;

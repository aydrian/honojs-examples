# The Hono Guestbook — Auth0 example

A tiny example showing how to add authentication to a [Hono](https://hono.dev) application running on [Cloudflare Workers](https://workers.cloudflare.com/) using the [`@auth0/auth0-hono`](https://github.com/auth0/auth0-hono) middleware.

The app is a guestbook:

- **`/`** — public homepage. Anyone can see the most recent 20 signatures.
- **`/sign`** — protected. Only logged-in users can leave a message; their name and avatar come from their Auth0 profile.
- **`/sign/:id/delete`** — protected. A user can delete their own entry; admins can delete any entry (`claimIncludes` + `some()`).
- **`/auth/login`**, **`/auth/logout`**, **`/auth/callback`** — provided automatically by `@auth0/auth0-hono`.

Signatures are stored in [Workers KV](https://developers.cloudflare.com/kv/).

## Folder structure

```
auth0-auth/
├─ src/
│  ├─ index.ts             ← Hono app, mounts auth() middleware + routes
│  ├─ routes/
│  │  └─ guestbook.tsx     ← GET /, GET /sign, POST /sign
│  ├─ views/
│  │  ├─ Layout.tsx        ← page shell + nav (Sign in / Sign out)
│  │  ├─ Home.tsx          ← signatures list
│  │  └─ Sign.tsx          ← message form
│  └─ lib/
│     └─ storage.ts        ← KV helpers
├─ scripts/
│  └─ setup-auth0.sh       ← `npm run setup` — bootstraps .dev.vars via the Auth0 CLI
├─ wrangler.jsonc
├─ .dev.vars.example       ← copy to .dev.vars and fill in (or use `npm run setup`)
└─ README.md
```

## Set up

### Quick start with the Auth0 CLI

If you have the [Auth0 CLI](https://auth0.github.io/auth0-cli/) installed and you're logged in (`auth0 login`), one command takes care of the Auth0 side of setup:

```bash
git clone https://github.com/honojs/examples
cd examples
npm install
cd auth0-auth
npm run setup        # creates the Auth0 app + writes .dev.vars
```

`npm run setup` runs [`scripts/setup-auth0.sh`](./scripts/setup-auth0.sh), which uses the Auth0 CLI to:

- Create a Regular Web Application called **Hono Guestbook** in your active tenant.
- Configure `http://localhost:8787/auth/callback` and `http://localhost:8787` as the callback / logout URLs.
- Generate a session encryption key.
- Write a ready-to-use `.dev.vars`.

To target a non-default tenant: `AUTH0_TENANT=other-tenant.us.auth0.com npm run setup`. The script refuses to overwrite an existing `.dev.vars` — `rm .dev.vars` first if you want to re-run it.

You still need to create the KV namespace once:

```bash
npx wrangler kv namespace create GUESTBOOK
# paste the returned id into wrangler.jsonc → kv_namespaces[0].id
npm run cf-typegen
npm run dev
```

Visit [http://localhost:8787](http://localhost:8787) — you'll see the empty guestbook. Click **Sign in**, authenticate with Auth0, then click **Leave a message** to add a signature.

> Prefer the Dashboard, or on Windows without bash? Follow the **Manual setup** below instead.

### Manual setup

#### 1. In the Auth0 Dashboard

1. Sign in to [Auth0](https://auth0.com/) (or [sign up for free](https://auth0.com/signup)).
2. Go to **Applications → Applications**, click **+ Create Application**, choose **Regular Web Applications**.
3. Open the application's **Settings** tab and note the **Domain**, **Client ID**, and **Client Secret** — you'll need them in a moment.
4. Still in **Settings**, scroll to **Application URIs** and set:
   - **Allowed Callback URLs:** `http://localhost:8787/auth/callback`
   - **Allowed Logout URLs:** `http://localhost:8787`
5. Click **Save Changes** at the bottom of the page.

#### 2. On your machine

Clone the repo and install dependencies:

```bash
git clone https://github.com/honojs/examples
cd examples
npm install
cd auth0-auth
```

Copy `.dev.vars.example` to `.dev.vars` and fill in the values from the Auth0 Dashboard:

```bash
cp .dev.vars.example .dev.vars
```

```ini
# .dev.vars
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
APP_BASE_URL=http://localhost:8787
AUTH0_SESSION_ENCRYPTION_KEY=a_random_string_at_least_32_characters_long
```

> Generate a session encryption key with `openssl rand -hex 32`.

Create a Workers KV namespace for the guestbook and paste the returned `id` into `wrangler.jsonc`:

```bash
npx wrangler kv namespace create GUESTBOOK
```

```jsonc
// wrangler.jsonc
"kv_namespaces": [
  { "binding": "GUESTBOOK", "id": "<paste-the-id-here>" }
]
```

Regenerate the Cloudflare bindings type so `c.env.GUESTBOOK` is typed:

```bash
npm run cf-typegen
```

#### 3. Run it

```bash
npm run dev
```

Visit [http://localhost:8787](http://localhost:8787) — you'll see the empty guestbook. Click **Sign in**, authenticate with Auth0, then click **Leave a message** to add a signature.

## Environment variables

All five are required.

| Variable                       | Description                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| `AUTH0_DOMAIN`                 | Your Auth0 tenant domain, e.g. `your-tenant.us.auth0.com`.           |
| `AUTH0_CLIENT_ID`              | Client ID from your Auth0 Regular Web Application.                   |
| `AUTH0_CLIENT_SECRET`          | Client Secret from your Auth0 Regular Web Application.               |
| `APP_BASE_URL`                 | Public base URL of the app — `http://localhost:8787` for local dev.  |
| `AUTH0_SESSION_ENCRYPTION_KEY` | Random string, at least 32 chars, used to encrypt the session cookie. |

For local dev these live in `.dev.vars`. For production, push them as Worker secrets:

```bash
npx wrangler secret bulk .dev.vars
```

## Deploy to Cloudflare Workers

1. Make sure the KV namespace `id` is in `wrangler.jsonc` (see step 2 above).
2. In Auth0, add your deployed origin (e.g. `https://auth0-auth.<account>.workers.dev`) to **Allowed Callback URLs** (`/auth/callback`) and **Allowed Logout URLs**.
3. Update `APP_BASE_URL` in `.dev.vars` to your deployed origin, then push secrets and deploy:

   ```bash
   npx wrangler secret bulk .dev.vars
   npm run deploy
   ```

## How it works

Auth is mounted once at the root of the app. With `authRequired: false`, routes are public by default — individual routes opt into protection via `requiresAuth()`.

```ts
// src/index.ts
import { auth0 } from "@auth0/auth0-hono";

app.use(auth0({ authRequired: false }));
app.route("/", guestbook);
```

```tsx
// src/routes/guestbook.tsx
import { requiresAuth } from "@auth0/auth0-hono";

guestbook.get("/", /* public */ async (c) => { ... });
guestbook.get("/sign", requiresAuth(), async (c) => { ... });
guestbook.post("/sign", requiresAuth(), async (c) => { ... });
```

User identity is populated on every request by the middleware. Read it from `c.var.auth0` for optional auth, or use the `getUser(c)` helper inside `requiresAuth()` routes:

```ts
// Public route — user may be null
const user = c.var.auth0?.user ?? null;

// Protected route — getUser returns non-null and throws if the session is missing
import { getUser } from "@auth0/auth0-hono";
const user = getUser(c);
// user.sub, user.name, user.picture, user.email, ...
```

See the [`@auth0/auth0-hono` docs](https://github.com/auth0/auth0-hono) for advanced options (claim-based authorization, custom routes, silent login, PAR, etc.).

### Claim-based authorization

The delete route uses `claimIncludes` from `@auth0/auth0-hono` combined with Hono's `some()` combinator from `hono/combine` to express OR-logic in the middleware stack:

```tsx
// src/routes/guestbook.tsx
import { some } from "hono/combine";
import { requiresAuth, claimIncludes } from "@auth0/auth0-hono";

guestbook.post(
  "/sign/:createdAt/delete",
  requiresAuth(),
  some(claimIncludes("roles", "admin"), ownerOnly),
  async (c) => {
    // authorization already resolved — just delete
    await deleteSignature(c.env.GUESTBOOK, createdAt);
    return c.redirect("/");
  },
);
```

`some()` runs each middleware in sequence and passes as soon as one calls `next()`. If a middleware returns a response without calling `next()`, `some()` tries the next option. If all fail, the last failure response is returned.

- **`claimIncludes("https://example.com/roles", "admin")`** — passes immediately for admins (the namespaced roles claim contains `"admin"`). The handler runs without reading the database.
- **`ownerOnly`** — custom middleware that reads the `sub` JWT claim and compares it against the stored signature's author. Passes if they match, returns 403 otherwise.

For `claimIncludes` to work, a namespaced `roles` claim must be present on the ID token. See [Admin role setup](#admin-role-setup) below.

## Admin role setup

The roles claim on the ID token is populated by an Auth0 Post-Login Action. Follow these steps once to enable admin delete access.

### 1. Create the role

```bash
auth0 roles create --name admin --description "Can delete any guestbook entry"
```

### 2. Assign the role to a user

```bash
# Find the user's ID
auth0 users search --query "email:you@example.com"

# Find the role ID
auth0 roles list

# Assign
auth0 users roles assign <user-id> --roles <role-id>
```

### 3. Create a Post-Login Action

In the [Auth0 Dashboard](https://manage.auth0.com/) go to **Actions → Library → Build Custom** and create a new action triggered by **Login / Post Login**. Paste this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const roles = event.authorization?.roles ?? [];
  api.idToken.setCustomClaim("https://example.com/roles", roles);
};
```

Deploy the action and drag it into the **Login** flow under **Actions → Flows → Login**.

> **Namespace:** Auth0 requires custom claim names to be fully-qualified URLs to avoid conflicts with standard OIDC claims. The URL doesn't need to resolve anywhere — it's a namespace convention. Replace `example.com` with your own domain in production. The namespace used in the Action must exactly match the one in `ROLES_CLAIM` in `src/routes/guestbook.tsx`.

> **Why is this Action necessary?** Auth0 does not automatically include roles in the ID token — there is no tenant or application setting that does this. `event.authorization.roles` is available to this Action at login time, but it only exists within the Action's execution context. Calling `api.idToken.setCustomClaim()` is what transfers those roles into the signed JWT that the application reads. No Action means no roles claim in the token, which means `claimIncludes` never passes and the delete buttons never appear.

### 4. Re-login

Sign out and back in. The new `roles` claim will appear in your session and the `×` delete button will appear on all entries for your admin account.

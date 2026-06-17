import { Hono, type MiddlewareHandler } from "hono";
import { some } from "hono/combine";
import {
  getUser,
  requiresAuth,
  claimIncludes,
  type OIDCEnv,
} from "@auth0/auth0-hono";
import { Home } from "../views/Home";
import { MAX_MESSAGE_LENGTH, Sign } from "../views/Sign";
import { addSignature, deleteSignature, listRecent } from "../lib/storage";

type Env = OIDCEnv<CloudflareBindings>;

// Namespace for custom claims — must match the Auth0 Post-Login Action.
// Auth0 requires custom claim names to be URLs to avoid OIDC collisions.
const ROLES_CLAIM = "https://example.com/roles";

// Passes only when the authenticated user is the author of the targeted entry.
// Used with some() so admins (via claimIncludes) can bypass this check.
const ownerOnly: MiddlewareHandler<Env> = async (c, next) => {
  const user = getUser(c);
  const createdAt = Number(c.req.param("createdAt"));
  const signatures = await listRecent(c.env.GUESTBOOK, 100);
  const target = signatures.find((s) => s.createdAt === createdAt);
  if (target?.sub === user.sub) {
    await next();
  } else {
    return c.text("Forbidden", 403);
  }
};

export const guestbook = new Hono<Env>();

guestbook.get("/", async (c) => {
  const rawUser = c.var.auth0?.user ?? null;
  const user = rawUser
    ? {
        name: rawUser.name,
        picture: rawUser.picture,
        sub: rawUser.sub,
        roles: (rawUser[ROLES_CLAIM] ?? []) as string[],
      }
    : null;
  const signatures = await listRecent(c.env.GUESTBOOK);
  return c.html(<Home signatures={signatures} user={user} />);
});

guestbook.get("/sign", requiresAuth(), (c) => {
  const rawUser = getUser(c);
  const user = {
    name: rawUser.name,
    picture: rawUser.picture,
    roles: (rawUser[ROLES_CLAIM] ?? []) as string[],
  };
  return c.html(<Sign user={user} />);
});

guestbook.post("/sign", requiresAuth(), async (c) => {
  const user = getUser(c);
  const form = await c.req.formData();
  const message = String(form.get("message") ?? "").trim();

  if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    return c.html(
      <Sign
        user={user}
        draft={message}
        error={`Message must be 1–${MAX_MESSAGE_LENGTH} characters.`}
      />,
      400,
    );
  }

  await addSignature(c.env.GUESTBOOK, {
    sub: user.sub,
    name: user.name ?? user.nickname ?? "Anonymous",
    picture: user.picture,
    message,
    createdAt: Date.now(),
  });

  return c.redirect("/");
});

// some() passes when the first middleware that calls next() wins:
// - claimIncludes passes for admins (roles claim contains "admin")
// - ownerOnly passes when the user's sub claim matches the entry's author
guestbook.post(
  "/sign/:createdAt/delete",
  requiresAuth(),
  some(claimIncludes(ROLES_CLAIM, "admin"), ownerOnly),
  async (c) => {
    const createdAt = Number(c.req.param("createdAt"));
    await deleteSignature(c.env.GUESTBOOK, createdAt);
    return c.redirect("/");
  },
);

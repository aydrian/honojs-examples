import { Hono, type MiddlewareHandler } from "hono";
import { some } from "hono/combine";
import {
  requiresAuth,
  getAccessToken,
  type OIDCEnv,
} from "@auth0/auth0-hono";
import { Home } from "../views/Home";
import { MAX_MESSAGE_LENGTH, Sign } from "../views/Sign";
import { addSignature, deleteSignature, listRecent } from "../lib/storage";

type Env = OIDCEnv<CloudflareBindings>;

// Decode the payload section of a JWT without verifying the signature.
// The session middleware already validates the tokens; we only need the claims.
function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) return {};
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// Middleware factory: passes only when the authenticated user's access token
// contains the requested permission in its `permissions` claim.
// Auth0 embeds this automatically when RBAC is enabled on the API
// (enforce_policies + token_dialect: access_token_authz). No Action or role needed.
const hasPermission =
  (permission: string): MiddlewareHandler<Env> =>
  async (c, next) => {
    try {
      const tokenSet = await getAccessToken(c);
      const payload = decodeJwtPayload(tokenSet.accessToken);
      const permissions = Array.isArray(payload.permissions)
        ? (payload.permissions as string[])
        : [];
      if (permissions.includes(permission)) {
        await next();
      } else {
        return c.text("Forbidden", 403);
      }
    } catch {
      return c.text("Forbidden", 403);
    }
  };

// Passes only when the authenticated user is the author of the targeted entry.
// Used with some() so users with delete:any_entry (via hasPermission) can bypass this check.
const ownerOnly: MiddlewareHandler<Env> = async (c, next) => {
  const user = c.var.auth0.user!;
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
  const rawUser = c.var.auth0.user;
  let permissions: string[] = [];
  if (rawUser) {
    try {
      const tokenSet = await getAccessToken(c);
      const payload = decodeJwtPayload(tokenSet.accessToken);
      permissions = Array.isArray(payload.permissions)
        ? (payload.permissions as string[])
        : [];
    } catch {
      // No access token available — permissions remain empty
    }
  }
  const user = rawUser
    ? {
        name: rawUser.name,
        picture: rawUser.picture,
        sub: rawUser.sub,
        permissions,
      }
    : null;
  const signatures = await listRecent(c.env.GUESTBOOK);
  return c.html(<Home signatures={signatures} user={user} />);
});

guestbook.get("/sign", requiresAuth(), async (c) => {
  const rawUser = c.var.auth0.user!;
  let permissions: string[] = [];
  try {
    const tokenSet = await getAccessToken(c);
    const payload = decodeJwtPayload(tokenSet.accessToken);
    permissions = Array.isArray(payload.permissions)
      ? (payload.permissions as string[])
      : [];
  } catch {
    // Token unavailable — permissions stay empty
  }
  const user = {
    name: rawUser.name,
    picture: rawUser.picture,
    permissions,
  };
  return c.html(<Sign user={user} />);
});

guestbook.post("/sign", requiresAuth(), async (c) => {
  const user = c.var.auth0.user!;
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
// - hasPermission("delete:any_entry") passes for users whose access token contains that permission
// - ownerOnly passes when the user's sub claim matches the entry's author
guestbook.post(
  "/sign/:createdAt/delete",
  requiresAuth(),
  some(hasPermission("delete:any_entry"), ownerOnly),
  async (c) => {
    const createdAt = Number(c.req.param("createdAt"));
    await deleteSignature(c.env.GUESTBOOK, createdAt);
    return c.redirect("/");
  },
);

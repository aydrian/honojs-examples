import { Hono } from "hono";
import { getUser, requiresAuth, type OIDCEnv } from "@auth0/auth0-hono";
import { Home } from "../views/Home";
import { MAX_MESSAGE_LENGTH, Sign } from "../views/Sign";
import { addSignature, listRecent } from "../lib/storage";

type Env = OIDCEnv<CloudflareBindings>;

export const guestbook = new Hono<Env>();

guestbook.get("/", async (c) => {
  const user = c.var.auth0?.user ?? null;
  const signatures = await listRecent(c.env.GUESTBOOK);
  return c.html(<Home signatures={signatures} user={user} />);
});

guestbook.get("/sign", requiresAuth(), (c) => {
  const user = getUser(c);
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

import type { FC } from "hono/jsx";
import { Layout } from "./Layout";
import type { Signature } from "../lib/storage";

type HomeProps = {
  signatures: Signature[];
  user?: { name?: string; picture?: string } | null;
};

const formatWhen = (ts: number) => {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
};

export const Home: FC<HomeProps> = ({ signatures, user }) => (
  <Layout user={user}>
    <header class="page-head">
      <h1>The Hono Guestbook</h1>
      <p class="lede">
        {user ? (
          <>
            A small log of who passed through.{" "}
            <a href="/sign">Leave your own line →</a>
          </>
        ) : (
          "A small log of who passed through. Sign in with Auth0 to leave your own line."
        )}
      </p>
      <span class="status">
        <span class="dot" aria-hidden="true"></span>
        <span class="count">{signatures.length}</span>{" "}
        {signatures.length === 1 ? "signature" : "signatures"} on record
      </span>
    </header>

    {signatures.length === 0 ? (
      <div class="empty">
        <span class="comment">no entries yet — be the first</span>
        {!user ? (
          <span class="comment">sign in to leave a message</span>
        ) : null}
      </div>
    ) : (
      <div class="stream">
        {signatures.map((s, i) => (
          <article class="entry" style={`--i: ${i}`}>
            <header>
              {s.picture ? <img src={s.picture} alt="" /> : null}
              <span class="name">{s.name}</span>
              <time dateTime={new Date(s.createdAt).toISOString()}>
                {formatWhen(s.createdAt)}
              </time>
            </header>
            <p class="message">{s.message}</p>
          </article>
        ))}
      </div>
    )}
  </Layout>
);

import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import { Layout } from "./Layout";

type SignProps = {
  user: { name?: string; picture?: string; roles?: string[] };
  error?: string;
  draft?: string;
};

export const MAX_MESSAGE_LENGTH = 280;

const counterScript = `
  (function () {
    var ta = document.querySelector('textarea[name="message"]');
    var wrap = document.querySelector('.counter');
    var count = wrap && wrap.querySelector('.count');
    if (!ta || !wrap || !count) return;
    var max = ${MAX_MESSAGE_LENGTH};
    function update() {
      var len = ta.value.length;
      count.textContent = len;
      if (len > max) wrap.classList.add('over');
      else wrap.classList.remove('over');
    }
    ta.addEventListener('input', update);
    update();
  })();
`;

export const Sign: FC<SignProps> = ({ user, error, draft }) => (
  <Layout title="Sign the guestbook" user={user}>
    <header class="sign-head">
      <h2>Leave a message</h2>
      <p class="posting-as">
        posting as
        {user.picture ? <img src={user.picture} alt="" /> : null}
        <strong>{user.name ?? "you"}</strong>
      </p>
    </header>

    {error ? <div class="error">{error}</div> : null}

    <form method="post" action="/sign">
      <div class="field">
        <textarea
          name="message"
          maxlength={MAX_MESSAGE_LENGTH}
          placeholder="Say hi…"
          required
          autofocus
        >
          {draft ?? ""}
        </textarea>
        <span class="counter" aria-hidden="true">
          <span class="count">{(draft ?? "").length}</span>
          {" / "}
          {MAX_MESSAGE_LENGTH}
        </span>
      </div>
      <button type="submit">sign</button>
    </form>

    <script>{raw(counterScript)}</script>
  </Layout>
);

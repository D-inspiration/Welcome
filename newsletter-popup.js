// newsletter-popup.js
// Simple, dependency-free email capture popup.
// Shows once per visitor (uses localStorage), submits to your email
// service's form endpoint (Buttondown, ConvertKit, Mailchimp, etc).

(function () {
  // ---- CONFIG ----
  var SUBSCRIBE_ENDPOINT = "https://auth.atrivix.com/subscribers"; // <-- change this
  var SHOW_AFTER_MS = 8000;      // wait 8s before showing
  var STORAGE_KEY = "atrivix_newsletter_dismissed";
  // ----------------

  if (localStorage.getItem(STORAGE_KEY)) return; // already dismissed/subscribed before

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    var el = document.getElementById("newsletter-popup");
    if (el) el.remove();
  }

  function showPopup() {
    var wrap = document.createElement("div");
    wrap.id = "newsletter-popup";
    wrap.innerHTML =
      '<div class="np-card">' +
      '  <button class="np-close" aria-label="Close">&times;</button>' +
      '  <h3>Stay in the loop</h3>' +
      '  <p>Occasional updates on new features and posts. No spam.</p>' +
      '  <form class="np-form">' +
      '    <input type="email" name="email" placeholder="you@example.com" required>' +
      '    <button type="submit">Subscribe</button>' +
      '  </form>' +
      '  <p class="np-status"></p>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.querySelector(".np-close").addEventListener("click", dismiss);

    var form = wrap.querySelector(".np-form");
    var status = wrap.querySelector(".np-status");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var btn = form.querySelector("button");
      btn.disabled = true;
      status.textContent = "Subscribing…";

      try {
        var res = await fetch(SUBSCRIBE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, source: "popup" }),
        });
        if (res.ok) {
          status.textContent = "You're subscribed. Thanks!";
          form.remove();
          setTimeout(dismiss, 2500);
        } else {
          status.textContent = "Something went wrong — try again.";
          btn.disabled = false;
        }
      } catch (err) {
        status.textContent = "Network error — try again.";
        btn.disabled = false;
      }
    });
  }

  var style = document.createElement("style");
  style.textContent =
    "#newsletter-popup{position:fixed;bottom:20px;right:20px;z-index:9999;" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "animation:np-slide-in .3s ease-out;}" +
    "@keyframes np-slide-in{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}" +
    ".np-card{background:#13161c;border:1px solid #2a2f3a;border-radius:14px;" +
    "padding:1.25rem 1.4rem;max-width:300px;color:#e8eaed;box-shadow:0 8px 24px rgba(0,0,0,0.4);position:relative;}" +
    ".np-close{position:absolute;top:8px;right:10px;background:none;border:none;color:#9aa0a6;" +
    "font-size:1.2rem;cursor:pointer;line-height:1;}" +
    ".np-close:hover{color:#e8eaed;}" +
    ".np-card h3{margin:0 0 .4rem;font-size:1.05rem;}" +
    ".np-card p{margin:0 0 .9rem;font-size:.85rem;color:#9aa0a6;}" +
    ".np-form{display:flex;gap:.5rem;}" +
    ".np-form input{flex:1;min-width:0;padding:.5rem .6rem;border-radius:7px;border:1px solid #2a2f3a;" +
    "background:#1a1e27;color:#e8eaed;font-size:.85rem;}" +
    ".np-form button{padding:.5rem .8rem;border-radius:7px;border:none;background:#00d4aa;" +
    "color:#000;font-weight:600;font-size:.85rem;cursor:pointer;white-space:nowrap;}" +
    ".np-form button:hover{background:#00b894;}" +
    ".np-status{margin:.5rem 0 0;font-size:.8rem;color:#9aa0a6;min-height:1em;}" +
    "@media (max-width:480px){#newsletter-popup{left:16px;right:16px;bottom:16px;}.np-card{max-width:none;}}";
  document.head.appendChild(style);

  setTimeout(showPopup, SHOW_AFTER_MS);
})();


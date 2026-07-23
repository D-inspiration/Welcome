# Atrivix — company site, StitchFlow product page, and blog

## Structure
- `index.html` — **Atrivix**, the parent company homepage (root). New file, a starting stub — flesh it out.
- `services/stitchflow/` — your existing StitchFlow landing page + `dashboard.html` + `tracker.js` + `style.css`, moved here unchanged as a product sub-route. Same pattern as `dashboard.html` already was — just one level deeper.
- `blog/` — the **company** blog (Atrivix-branded), lives at root `/blog/` per the SEO reasoning: you want search engines indexing the brand, not a single product's login flow.
- `posts/` — where you write new blog posts in Markdown.
- `build_blog.py` — zero-dependency Python script (stdlib only) that turns `.md` files into styled HTML blog pages, run locally before you push. Not Jekyll, not pyscript/brython — nothing Python-related ever reaches the browser. GitHub Pages just serves the plain HTML it outputs.

## URLs once deployed
- `atrivix.com/` → Atrivix homepage
- `atrivix.com/services/stitchflow/` → StitchFlow landing page
- `atrivix.com/services/stitchflow/dashboard.html` → StitchFlow analytics dashboard
- `atrivix.com/blog/` → company blog
- Later, add more products the same way: `services/tradebot/`, `services/anchor-protocol/`, etc.

## Writing a new post (Termux)
```bash
cp posts/_example.md posts/2026-08-01-my-new-post.md
nano posts/2026-08-01-my-new-post.md
python3 build_blog.py
git add .
git commit -m "New post: my-new-post"
git push
```
Filename must start with `YYYY-MM-DD-`. That date becomes the published date; everything after the date becomes the URL slug (`/blog/my-new-post/`).

## Why not Jekyll
Jekyll's `_posts`/`_layouts` system only auto-builds if you're hosted on real `username.github.io` GitHub Pages with Jekyll processing turned on. Since your app stack (Django/Flask) is on Northflank, there's a real chance the marketing site ends up somewhere else too — Northflank static, Cloudflare Pages, etc. This build script produces plain HTML files that work identically on any static host, with no GitHub-specific build step and no second templating language to learn.

## Previewing before you push
Generated files are plain HTML — open `blog/your-slug/index.html` directly in a mobile browser (or `termux-open blog/your-slug/index.html`) to check it before committing.

## Two starter posts included
- `posts/2026-07-23-welcome-to-stitchflow.md`
- `posts/2026-07-24-offline-first-tailoring-app.md`

Edit or delete these — they're real, publishable posts, not placeholders.

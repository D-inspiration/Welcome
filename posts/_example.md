---
title: "This is an example — delete or rename this file"
excerpt: "Copy this file to start a real post. Prefix with an underscore to keep it out of the published blog."
---

This file starts with an underscore (`_example.md`) so `build_blog.py` skips it.

## How to write a real post

1. Copy this file: `cp posts/_example.md posts/2026-07-23-my-real-post.md`
2. Filename **must** start with `YYYY-MM-DD-` — that date becomes the published date.
3. Edit the frontmatter `title` and `excerpt` at the top.
4. Write your post below in plain markdown — `**bold**`, `*italic*`, `[links](https://example.com)`, `![alt](image-url.jpg)`, `-` for bullet lists, and `` `code` `` all work.
5. Run `python3 build_blog.py`
6. Check `blog/` — commit and push.

That's the whole workflow. No Jekyll, no npm, no server needed to preview — open the generated `blog/your-slug/index.html` file directly in a browser to check it first.

# Mohamed & Haidy — Wedding Invitation

A single-page, cinematic wedding invitation. Pure HTML/CSS/JS — **no build step**,
so it runs anywhere and is easy to edit. The first screen is a **moving brass
elevator**: the doors slide open to reveal you both, and pressing *Open Invitation*
takes a short "ride" before the invitation appears.

## Files
```
index.html      the page structure & all text
style.css       all styling (gold theme, elevator, layout)
script.js       elevator animation, countdown, RSVP  ← edit CONFIG at the top
assets/         all photos + olive branch
```

## Preview locally
Just open `index.html` in a browser. (For the smoothest experience run a tiny
local server so images load reliably:)
```bash
cd this-folder
python3 -m http.server 8000
# then visit http://localhost:8000
```
Add `#peek` to the URL to jump straight into the invitation while editing.

## Deploy to GitHub Pages
1. Create a new repo on GitHub, e.g. `wedding`.
2. Put these files in the repo root and push:
   ```bash
   git init
   git add .
   git commit -m "Wedding invitation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/wedding.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch → Branch: `main` / `/ (root)` → Save.**
4. Your site goes live at `https://<your-username>.github.io/wedding/` in ~1 minute.

## Customize
| Want to change… | Where |
|---|---|
| Date/time & live countdown | `CONFIG.weddingDateTime` in `script.js` |
| Where RSVPs are emailed | `CONFIG.rsvpEmail` in `script.js` |
| Names, venue, story text, etc. | the matching text in `index.html` |
| Photos | drop new files into `assets/` and keep the same names (or update the `src=` paths) |
| Colours / fonts | the `:root` variables at the top of `style.css` |
| Doors auto-open timing | `CONFIG.autoOpenDelay` in `script.js` |

### About the RSVP form
GitHub Pages is static (no server), so submitting the RSVP opens the guest's
email app with a pre-filled message to `CONFIG.rsvpEmail`. If you'd rather collect
replies in a Google Form or a service like Formspree, replace the `<form>` in
`index.html` — happy to wire that up on request.

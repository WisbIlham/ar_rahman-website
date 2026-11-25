# Ar Rahmah Malaysia: website mockup + static CMS

Open `index.html` in a browser, or host the folder on any static host (GitHub Pages works).

## Pages
- `index.html` home · `penaung.html` Penaung Dakwah · `berita.html` news list and article (`?id=`)
- `admin.html` CMS

## CMS (static)
- Login with a demo account (shown on the login page, password `demo1234`).
- Roles: **Super Admin** (everything), **Editor** (all content, reports, enquiries), **Penulis** (news drafts only).
- Edit: homepage text and photo, stats, spending chart, Islamic Centres, news (with image upload), reports (PDF), sponsor tiers, contact and bank details, admins.
- The Penaung form saves enquiries into the CMS. Export them as CSV.
- Activity log on the dashboard. Backup and restore as JSON under "Tetapan & data".

Data is saved in the browser (`localStorage`), so each browser has its own copy. The real build moves `cms.js` load/save to a backend API and database.

## Files
`data.js` default content · `cms.js` load/save helpers · `site.js` renders public pages · `admin.js` CMS · `style.css` shared styles · `DESIGN.md` design notes

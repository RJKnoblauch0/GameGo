# GameGo

Youth sports team management app — built with React + Vite, deployable as a PWA.

## Project Status

This is a prototype with mock data. Backend (Supabase) integration is planned for Phase 2.

## Getting Started Locally

You'll need [Node.js](https://nodejs.org) installed (version 18 or higher).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.  
Use code `1234` on the login screen.

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** and import this repo
4. Leave all settings as defaults and click **Deploy**

Vercel will automatically redeploy every time you push a change to GitHub.

## Project Structure

```
gamego/
├── public/
│   ├── favicon.svg
│   └── icons/          # PWA app icons
├── src/
│   ├── App.jsx         # All screens and components
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles / reset
├── index.html
├── vite.config.js      # Build config + PWA plugin
└── package.json
```

## Installing on Your Phone (PWA)

Once deployed to Vercel:

**iPhone:** Open the app URL in Safari → tap the Share button → "Add to Home Screen"  
**Android:** Open in Chrome → tap the three-dot menu → "Add to Home Screen"

## Screens Built

- ✅ Login (phone + OTP)
- ✅ Home (next event hero + upcoming list + chat preview)
- ✅ Schedule (expandable events with RSVP breakdown)
- ✅ Roster (players + staff, with guardian contacts)
- ✅ More (team settings + profile management)
- 🔲 Chat (coming next)

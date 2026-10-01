# Annex Chess Club — website draft

A first draft of the new Annex Chess Club website, built with React, TypeScript, and SCSS.

## Getting started

```bash
npm install
npm run dev
```

This starts a local dev server (usually at `http://localhost:5173`) with hot reload.

Other commands:

```bash
npm run build   # type-check and build a production bundle into dist/
npm run lint    # run oxlint over the project
npm run preview # preview the production build locally
```

## Project structure

```
src/
  components/
    layout/    Header, Footer, and the page shell (Layout.tsx)
    ui/        Small reusable pieces: Button, SectionHeading, ChessboardMark
  data/
    clubInfo.ts   All club facts (address, hours, schedule, membership
                  copy) in one place, so updating a detail once updates
                  every page that uses it
  firebase/
    config.ts      Firebase app initialization, reads keys from .env.local
    types.ts       Shared types for Firestore documents
    members.ts     Sign up / log in / log out, and reading/updating member
                    profiles and roles
    content.ts      CRUD helpers for the admin-editable schedule, events,
                    and announcements collections
    useContent.ts  Hooks the public pages use to read that content, with
                    a static fallback if Firestore has nothing yet
  auth/
    AuthContext.tsx    Tracks the signed-in user and their member profile
    ProtectedRoute.tsx Route guards: ProtectedRoute (must be logged in),
                        AdminRoute (must be an admin)
  pages/           One file per public route: Home, About, Schedule,
                   Classes, Membership, Contact, Register, Login, Account,
                   NotFound
  pages/admin/     The admin portal: Dashboard, Members, Schedule, Events,
                   Announcements, all gated behind AdminRoute
  styles/          SCSS variables, mixins, and shared patterns used across
                   pages (colors, spacing, type scale, breakpoints)
```

Each page and component keeps its own `.scss` file beside it (for example
`Home.tsx` / `Home.scss`), while `src/styles/` holds the shared design
tokens and a few patterns reused across more than one page.

## Content

Copy and club facts (address, phone, schedule, membership benefits, and
so on) live in `src/data/clubInfo.ts`. Update that file and the change
shows up everywhere it is used, rather than hunting through each page.

## Firebase setup

This project uses Firebase Authentication (email/password) for member
accounts and Firestore for member profiles and admin-editable content.

1. Create a Firebase project at console.firebase.google.com, enable the
   Email/Password sign-in provider under Authentication, and create a
   Firestore database.
2. Register a web app in the project's settings and copy the
   `firebaseConfig` object it gives you.
3. Copy `.env.example` to `.env.local` and fill in the six `VITE_FIREBASE_*`
   values from that config object. `.env.local` is gitignored, so real keys
   never get committed.
4. In the Firebase console, go to Firestore Database > Rules and paste in
   the contents of `firestore.rules` from this project, then publish.
5. Restart `npm run dev` so Vite picks up the new environment variables.

### Registration and roles

Anyone can register on the public site (`/register`); accounts are active
immediately. New accounts get the `member` role. To create the first admin:
register normally, then in the Firebase console go to Firestore Database >
Data, open `members/<your uid>`, and change `role` from `"member"` to
`"admin"` by hand. Every admin after that can promote other members to
admin from the admin portal's Members page, no console needed.

### Admin portal

Signed-in admins get an "Admin" link in the header, or can go to `/admin`
directly. From there:

- **Members** — see everyone who has registered and change their role.
- **Schedule** — add, edit, or remove the entries shown on the public
  Schedule page.
- **Events** — manage the major tournaments listed on the home page.
- **Announcements** — post a note that appears in a banner on the home
  page (most recent one shown; older ones stay in the list in the portal).

If Firestore has no schedule or event entries yet (a fresh project), the
public pages fall back to the static copy in `src/data/clubInfo.ts` so the
site never shows an empty page.

## Design notes

- Palette: near-black ink, warm paper off-white, and a single muted gold
  accent, meant to feel closer to a wooden chess set than a typical tech
  site.
- Type: Fraunces for headings, Inter for body text (loaded from Google
  Fonts in `index.html`).
- The checkerboard graphic on the home page is drawn with CSS, not an
  image, so there is nothing to swap out if the layout changes.
- Navigation is a single sticky header with the same links on desktop and
  in the mobile menu, so there is one nav structure to keep in sync.

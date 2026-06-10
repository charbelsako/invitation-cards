# Invitation Cards

A premium wedding invitation website with a React frontend, animated sections, RSVP collection, and a MongoDB-backed API.

## What Is Included

- Animated React/Vite invitation page with a cinematic hero, horizontal feature rail, timeline, music control, and RSVP form.
- Private `/admin` studio for creating invitations without editing the database by hand.
- Template, color, image, music, copy, guest limit, and RSVP notification controls.
- Admin file uploads for hero image, RSVP image, and background music. Uploaded files are stored on disk and saved as `/uploads/...` paths in the existing invitation fields.
- Express API with MongoDB models for users, invitations, and guest RSVPs.
- Seeded admin user from environment variables.
- RSVP validation with guest-capacity checks.
- Optional per-invitation SMTP email notifications when a guest submits the form.
- A seeded `demo-wedding` invitation document when MongoDB is connected.

## Run Locally

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` and `/uploads` requests to the API on `http://localhost:4000`. All frontend API calls go through `src/api/client.ts` using `VITE_API_URL`. Leave it empty in local dev to use the Vite proxy, or set it to `http://localhost:4000` to call the API directly.

Open the admin builder at `http://localhost:5173/admin`. After creating an invitation, guests can open it at `http://localhost:5173/invite/<slug>` or `http://localhost:5173/?id=<slug>`.

## Environment Variables

Create a local `.env` file with:

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=
MONGODB_URI=mongodb://127.0.0.1:27017/invitation-cards
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
JWT_SECRET=replace-with-a-long-random-secret
```

Optional email notifications:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=replace-me
RSVP_NOTIFY_TO=couple@example.com
```

The repository also includes `.env.example` with these placeholder values. `ADMIN_EMAIL` and `ADMIN_PASSWORD` seed the first admin user when the API connects to MongoDB. Change them before using this outside local development.

## Reference Link Check

All five reference links returned HTTP 200. The linked inspiration sites appear to be client-rendered apps, so plain fetches for two links returned loading shells:

- `https://aazima-invite.web.app/?id=elie-jennifer` returned `Loading invitation...`
- `https://aazima-lb.web.app/elie-jennifer` returned `Loading invitation details...`

The remaining pages timed out through the content fetch tool while still returning healthy HTTP statuses. This first build focuses on the features described in `SPEC`: templates, horizontal and vertical motion, colors, SVG-ready visual design, RSVP capacity, plus-one control, email notification hooks, and optional background music.

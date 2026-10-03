# Clinic booking website

Bilingual (Arabic and English, with right-to-left layout) clinic website with online booking and a protected admin page.

**Stack:** React, Tailwind CSS, Vite | Node.js, Express | MongoDB (Mongoose)

## What it does
- Patients pick a service, doctor, date and a free time slot, then send a request.
- Taken slots disappear automatically. Fridays and past times can't be booked.
- After booking, the patient can confirm on WhatsApp with a pre-filled message.
- The clinic logs in at `/admin` to see requests, then confirm or cancel them.

## Security built in
- Every input is validated on the server with zod (types, lengths, formats). Extra fields are rejected.
- Because inputs are strict primitives, NoSQL injection payloads like `{ "$gt": "" }` are refused.
- Double booking is prevented by a unique database index, not just by checking first.
- Rate limits: 10 booking attempts per 15 minutes per IP, 5 failed logins per 15 minutes per IP.
- Passwords hashed with bcrypt (cost 12). Login takes the same time for unknown emails.
- Admin tokens: HS256 only, expire after 8 hours. A token signed with `alg: none` is rejected.
- Helmet security headers, CORS limited to your front-end origin, 10 KB request body limit.
- Errors never reveal stack traces. Secrets live in `.env`, which is git-ignored.

## Run it locally
You need Node.js 20+ and a free MongoDB Atlas database.

```bash
# 1. API
cd server
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed                # creates 3 sample doctors and your admin account
npm run dev                 # http://localhost:4000

# 2. Website (new terminal)
cd client
cp .env.example .env        # optional: set VITE_WHATSAPP and VITE_PHONE
npm install
npm run dev                 # http://localhost:5173
```
Admin page: http://localhost:5173/admin

Run the API checks (no database needed): `cd server && npm test`

## Deploy for free
1. **Database:** MongoDB Atlas free cluster. Allow network access from anywhere (or Render's IPs).
2. **API on Render:** New Web Service from the `server` folder. Build command `npm install`, start command `npm start`. Add the variables from `.env.example`. Set `CLIENT_ORIGIN` to your Vercel URL. Then open the Render shell and run `npm run seed` once.
3. **Website on Vercel:** import the `client` folder. Add `VITE_API_URL` (your Render URL, no trailing slash), `VITE_WHATSAPP` and `VITE_PHONE`.

Render's free tier sleeps when idle, so the first request after a break can take about 30 seconds.

## Before using it for a real clinic
- Replace the sample doctors, name, phone and hours (`server/src/seed.js`, `client/src/i18n.jsx`).
- Move the admin token into an httpOnly cookie (needs same-site hosting or a proxy).
- Add email or WhatsApp Business API notifications to the clinic.
- Patient data is personal data. Check the privacy rules that apply in your country before storing real records.

## Honest status
The API smoke tests and the front-end build and booking flow were tested. The database routes (slots, booking, admin) have not been run against a real MongoDB in the environment this was built in, so run it once with your Atlas database and tell me if anything breaks.

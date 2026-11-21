# Backend setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
2. Run `npm install` to generate the Prisma client. Apply migrations with `npx prisma migrate deploy` before local development.
3. Start the API locally with `npm run dev`. Production starts with `npm start`, which applies pending migrations before launching the server.

To enable the admin dashboard, set `ADMIN_EMAIL` to the registered admin account's email, then run `npm run promote-admin`. Sign out and sign in again so the app receives the updated role. Admin API access is checked against the database role.

Email alerts are sent when SMTP settings (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, and optionally `MAIL_FROM`) are configured. In-app notifications do not depend on SMTP.

Realtime in-app notifications use authenticated Socket.IO connections and are also saved in PostgreSQL. The frontend connects to `NEXT_PUBLIC_SOCKET_URL`; it defaults to the backend origin in `NEXT_PUBLIC_API_URL` or `BACKEND_URL` (and to `http://localhost:5000` for local development). Set `NEXT_PUBLIC_SOCKET_URL` to the public backend origin only if it differs from the API URL. Set `FRONTEND_URL` to the frontend's exact origin; multiple origins can be comma-separated. Local development allows `localhost` and `127.0.0.1` on ports 3000 and 3001.

For a Vercel deployment, set `NEXT_PUBLIC_API_URL` to the public API URL ending in `/api` and `NEXT_PUBLIC_SOCKET_URL` to the same public backend origin without `/api`. On the backend host, set `FRONTEND_URL` to the Vercel site's origin. Never use `localhost` for these production values; the visitor's browser interprets it as their own computer.

Email notification preferences are configured in the user's profile. General notification email is enabled by default; message email is disabled by default and requires general email notifications to also be enabled.

Lost and found reports expire 30 days after they are created. Owners receive an in-app/email reminder 7 days before expiry. Expired reports are removed from public listings and matching, archived in the owner's My Items page, and can be reopened for a new 30-day period. Owners can also close active reports from My Items. The backend checks report expiry hourly; apply the latest Prisma migrations before starting it.

Photo similarity runs locally by default. To enable semantic AI comparison, configure `OPENAI_API_KEY` and set `AI_IMAGE_MATCH_ENABLED=true`. At most two candidate photo pairs are sent to the configured Responses API model for each new report; this can incur provider charges. Set it back to `false` to disable external image processing.

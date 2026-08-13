# Garden City Tech

Garden City Tech Pvt. Ltd. marketing site and service application portal.

The site uses a deliberately small Vite + React + TypeScript client and Node.js Vercel Functions for the application workflow. The public site does not display a phone number, prices, portfolio projects, testimonials, statistics, or placeholder links.

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`.

Useful checks:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

When storage and mail credentials are absent, local submissions are kept in process memory so the form can be tested without secrets. Production requests require Google Drive/Sheets and SMTP configuration.

## Deployment report

| Item | Value |
| --- | --- |
| Framework | React 19 + Vite 7 + TypeScript |
| Package manager | pnpm |
| Build command | `pnpm run build` |
| Output directory | `dist` |
| API runtime | Vercel Node.js 24 Functions under `api/` |
| Recommended platform | Vercel, with `gardencitytech.net` retained at Cloudflare DNS |
| Public site | `https://gardencitytech.net` |
| Notification inbox | `info@gardencitytech.net` |

## Environment variables

Copy `.env.example` to `.env` for local development. In Vercel, add the same values as encrypted Environment Variables. On the legacy Replit deployment, use Replit Secrets instead of committing `.env`.

Required for production:

- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN` — OAuth credentials for the `info@gardencitytech.net` Google account. The refresh token is a secret and must stay only in Vercel Environment Variables.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — optional legacy fallback; leave it empty when using the Garden City OAuth account.
- `GOOGLE_DRIVE_FOLDER_ID` — private folder where uploaded files are stored (`1iujAXfgToma4JldDsLC4c_d2G86bXjk-`).
- `GOOGLE_SHEET_ID` — spreadsheet used as the application database (`1bUYEIVue4dD9mdu11IVeP-kd6Pj3ihQ5mv4YvR5yUdA`).
- `GOOGLE_SHEET_RANGE` — the exact target tab and columns, currently `Sheet1!A:T` for the Garden City Applications sheet.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — notification mail transport.
- `SMTP_FROM` — verified sender, normally `info@gardencitytech.net`.
- `NOTIFICATION_EMAIL` — notification destination, `info@gardencitytech.net`.
- `ADMIN_PANEL_KEY` — long random key required by `/admin` and `GET /api/applications`.

The Google OAuth account must be `info@gardencitytech.net` and must have Editor access to the target Sheet and private Drive folder. On the first successful submission, the application creates the 20-column header row in `Sheet1` if the sheet is still blank. Files are never made public by the application.

## Vercel + Cloudflare domain

1. Import this repository into Vercel and keep the detected framework as Vite.
2. Add the production environment variables listed above.
3. Add `gardencitytech.net` and `www.gardencitytech.net` in the Vercel project Domains settings.
4. In Cloudflare DNS, create the exact records Vercel shows for the domain. Keep proxying disabled until Vercel reports the domain as verified; then enable Cloudflare proxying only if the final TLS and caching behavior are confirmed.
5. Keep the domain registration at Himalayan Host. Only the DNS records need to point the hostname at Vercel.

## Application workflow

The multi-step application form validates required fields, validates the allow-listed file types and 4 MB attachment limit, rejects the honeypot, and rate-limits to five submissions per IP per hour. A successful request receives a `GCT-YYYYMMDD-XXXX` reference number. In production, the API uploads files to private Google Drive storage, appends the application to Google Sheets, and sends a notification email.

`/admin` asks for the configured admin key and calls the protected application endpoint. Do not put the admin key in a public build or share it in a URL.

## Brand and assets

The site follows the supplied Garden City Tech guide: `#ECFFF0`, `#D7ECB2`, `#95D041`, `#378544`, and `#016665`. The supplied transparent secondary logo is used for the desktop and mobile headers, footer, admin header, and the “Why choose us” brand panel. It was trimmed only to remove the source file’s empty transparent canvas and resized for web use; no white background is added to the logo artwork.

The hero includes a restrained magnetic play control for the future video. Drop the final optimized video into the public assets directory later; the interaction respects `prefers-reduced-motion`.

## Scope notes

This workspace did not contain the original GitHub checkout, so the implementation is a fresh production-ready build based on the supplied brand files, business information, and the visible Replit preview. It intentionally removes unverified content from the old preview rather than carrying those claims into production.

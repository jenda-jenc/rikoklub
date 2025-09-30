# Riko Klub

Static site for the Riko Klub community hub. The project uses [Eleventy](https://www.11ty.dev/) for static generation and [Static CMS](https://www.staticcms.org/) (the open-source fork of Netlify CMS) for managing structured content.

## Project structure

```
├── content/              # JSON data consumed by Eleventy templates
│   ├── contact.json
│   ├── events.json       # Generated from the Facebook Graph API
│   ├── gallery.json
│   └── hero.json
├── public/               # Static assets passed straight through to dist/
│   ├── admin/            # Static CMS (Netlify CMS compatible) entrypoint
│   └── styles.css
├── scripts/
│   └── fetchFacebookEvents.js
├── src/                  # Eleventy templates and components
│   ├── _includes/
│   │   ├── components/
│   │   └── layouts/
│   └── index.njk
├── dist/                 # Generated output (created after building)
└── eleventy.config.js
```

## Prerequisites

- Node.js 18 or newer
- A Facebook app and page with access to the [Facebook Events API](https://developers.facebook.com/docs/graph-api/reference/page/events/)

## Environment variables

Create a `.env` file in the repository root with the following keys so the Facebook events script can authenticate against the Graph API:

```
FACEBOOK_PAGE_ID=your-page-id
FACEBOOK_ACCESS_TOKEN=your-long-lived-access-token
```

If these variables are absent, the fetch script will fall back to the existing `content/events.json` file and log a warning.

## Installation & local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Synchronise Facebook events (optional if you just want to use the bundled placeholder data):

   ```bash
   npm run fetch-events
   ```

3. Build the site:

   ```bash
   npm run build
   ```

   This command automatically runs the fetch script before invoking Eleventy so that the templates always render with the latest CMS and Facebook data. The generated site is emitted to `dist/`.

4. Start a local development server with live reload:

   ```bash
   npm start
   ```

   The `npm start` script runs the fetch step, launches Eleventy in watch mode, and serves the compiled site at `http://localhost:8080`.

## Content management with Static CMS

- The CMS interface lives at `/admin/index.html` in the built site. When hosted on Netlify, enable Netlify Identity + Git Gateway (or configure another compatible backend) to sign in.
- Collections are mapped directly to the JSON files in `content/`. Editors can update hero copy, gallery entries, and contact information.
- Facebook events are imported via the build script. The CMS exposes the resulting JSON as a read-only reference so editors can see what will be published but cannot alter the records manually.

## Deployment

1. Ensure the `.env` values are configured in your deployment environment (for Netlify, add them via **Site settings → Environment variables**).
2. Run the standard build pipeline:

   ```bash
   npm install
   npm run fetch-events
   npm run build
   ```

3. Deploy the contents of `dist/` to your static host.

If you rely on Netlify, configure the build command as `npm run build` and set the publish directory to `dist`. Netlify will execute the fetch script automatically before Eleventy runs.

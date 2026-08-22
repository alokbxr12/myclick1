# MyClick 📸

A small Instagram-style photo sharing app for a private group (5–10 users): upload photos, follow other users, see a feed of people you follow, and like/comment on posts.

## Stack
- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **PostgreSQL** via **Prisma ORM**
- **Auth.js / NextAuth v5** (email + password, credentials provider)
- **PostgreSQL media storage** for photos and profile pictures

## 1. Set up local PostgreSQL

Create a local database for the app (the example below uses the name `myclick`):

```bash
createdb myclick
```

Copy `.env.example` to `.env`, then set `DATABASE_URL` to your local PostgreSQL connection:

```env
DATABASE_URL="postgresql://POSTGRES_USER:POSTGRES_PASSWORD@localhost:5432/myclick?schema=public"
```

Replace `POSTGRES_USER` and `POSTGRES_PASSWORD` with your local PostgreSQL credentials. If your server uses a different port or database name, replace those values too. Percent-encode special characters in the username or password when putting them in a URL.

Do **not** commit `.env` or paste its password into chat. The file is gitignored.

Set `AUTH_SECRET` in `.env`. Generate one with `openssl rand -base64 32`.

## 2. Photo storage

Uploaded photos and profile pictures are stored directly in the PostgreSQL `media` table and served by `/api/media/:id`. No external image-storage account or credentials are required. Images are limited to 4 MB so uploads and image responses remain below Vercel's function payload limit.

## 2b. Set up Gmail SMTP (forgot-password emails)

1. Turn on 2-Step Verification on your Google account.
2. Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Fill it into `.env`:

```
GMAIL_USER="youraddress@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

This lets your app send reset emails to any of your users, straight from your own Gmail account — no domain needed.

## 3. Tables (created automatically — you don't need to create them by hand)

The schema lives in `prisma/schema.prisma`. Running the migration below will create these tables for you:

| Table | Purpose |
|---|---|
| `users` | account info: username, email, password hash, name, bio, avatar |
| `posts` | one row per uploaded photo (image URL, caption, author) |
| `follows` | follower → following relationships (who follows whom) |
| `likes` | which user liked which post |
| `comments` | comments left on a post |
| `comment_likes` | which user liked which comment |
| `password_reset_tokens` | short-lived password reset tokens |
| `media` | uploaded photo and profile-picture bytes |

## 4. Create the tables

Once `.env` points at your local database, apply the migrations already included in this project:

```bash
npx prisma migrate deploy
```

This creates the eight tables above in your database. Run `npx prisma migrate dev --name <change-name>` when you later change `schema.prisma` during development.

## 5. Run the app locally

```bash
npm install   # already done
npm run dev
```

The development command uses Next.js's Webpack mode because Turbopack cannot spawn its PostCSS worker with the bundled local Node runtime.

Visit http://localhost:3000 — you'll land on `/login`. Click "Create one" to register the first account, then repeat for each of your 5–10 users.

## How it works
- **Register/Login** (`/register`, `/login`) — sign in with email or username + password, hashed with bcrypt.
- **Forgot password** (`/forgot-password`, `/reset-password/[token]`) — emails a time-limited reset link via Gmail SMTP.
- **Feed** (`/feed`) — shows posts from yourself and everyone you follow, newest first.
- **Search** (`/search`) — find other users by username or name, and open their profile.
- **Upload** (`/upload`) — pick a photo + caption, stored in local PostgreSQL.
- **Profile** (`/profile/[username]`) — bio, photo grid, follower/following counts, and a Follow/Following button for other users.
- Only the post's **author** can edit the caption or delete it. Anyone who is logged in can view profiles, like posts and comments, open the post-liker list, and comment.

## Local database note

The local app uses PostgreSQL on your computer. A hosted Vercel deployment must use a separately reachable PostgreSQL service such as Neon; it cannot normally connect to PostgreSQL on your computer.

## Deploy to Vercel with Neon

The repository includes `vercel.json`, which selects the deployment build command. That command applies pending Prisma migrations through Neon's direct connection before building the Next.js application.

Set these environment variables in Vercel before the first deployment:

```env
# Neon pooled connection (hostname normally contains -pooler)
DATABASE_URL="postgresql://..."

# Neon direct/unpooled connection, used only for Prisma migrations
DIRECT_URL="postgresql://..."

# Generate a new production value with: openssl rand -base64 32
AUTH_SECRET="..."

# Optional, for password-reset email
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
```

Do not commit any real credentials. `.env` files are excluded by `.gitignore`; only the placeholder `.env.example` is committed.

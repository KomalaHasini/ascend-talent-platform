# Ascend (React) - Setup Guide

## 1. Install Node.js (one time)
Open Git Bash or the VS Code terminal and run `node -v`.
If it shows a version number (like v20.x), skip this step.
Otherwise install the **LTS** version from https://nodejs.org and restart VS Code.

## 2. Create the shared database (Supabase, free, no card needed)
This is what lets your friends see your posts.

1. Go to https://supabase.com and sign up (GitHub login is fastest).
2. Click **New project**. Name it `ascend`, set a database password (save it), pick the nearest region (for India: Mumbai), and click **Create**. Wait about 2 minutes.
3. In the left menu open **SQL Editor** -> **New query**.
4. Open `supabase/schema.sql` from this project, copy everything, paste it into the editor and click **Run**. It should say "Success".
5. Go to **Project Settings -> API** (or click the **Connect** button at the top).
   Copy the **Project URL** and the **anon public key** (it may be called *publishable key*).
6. Open `src/config.js` in VS Code and paste them in:
   ```js
   export const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
   export const SUPABASE_ANON_KEY = 'your-long-key-here';
   ```
   The anon key is made to be public, so it is safe to push to GitHub.

## 3. Run the website on your computer
In the VS Code terminal, inside this folder:
```
npm install
npm run dev
```
Open the link it prints (http://localhost:5173). Sign up, log in, post a talent.

## 4. Put it on GitHub
```
git add .
git commit -m "React version with shared database"
git push
```
(Or use the Source Control panel in VS Code: Commit, then Sync Changes.)

## 5. Live website for your friends (GitHub Pages)
1. On GitHub open your repository -> **Settings -> Pages**.
2. Under **Source** choose **GitHub Actions**.
3. Go to the **Actions** tab, wait for "Deploy to GitHub Pages" to turn green (about 1-2 minutes).
4. Your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
   Anyone who opens that link sees the same accounts and posts.

## Notes
- A free Supabase project pauses after 1 week without use. If the site stops loading, open the Supabase dashboard and click **Restore project**. No data is lost.
- Photos up to 10 MB and videos up to 40 MB can be posted.
- Contact details (email / phone) are private. Other users only see a username (the part before @ for emails, or `user` + the last 4 digits for phones).

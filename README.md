# Ascend

**Rise through your craft.**

Ascend is a talent discovery social media platform. Users post their talents as photos or videos, other users endorse them, and each talent climbs through recognition tiers instead of collecting likes and followers. Accounts and posts are stored in a shared online database, so everyone sees the same talents.

## Features
- Sign up and login with email or phone number, with a tick confirmation
- Search people by username
- Instagram-style grid of all talents
- Reels-style full-screen feed with snap scrolling
- Photo and video uploads
- Endorsement system with five tiers: Bronze, Silver, Gold, Platinum, Legend
- Profile page with activity tier, progress bar and daily streak
- Dark and light theme toggle

## Tiers
| Tier | Endorsements needed |
|------|---------------------|
| Bronze | 0+ |
| Silver | 3+ |
| Gold | 10+ |
| Platinum | 25+ |
| Legend | 50+ |

## Tech Stack
- **React 18** (components, props, state, hooks) with **Vite**
- **CSS** (Grid, Flexbox, variables, scroll-snap, animations)
- **JavaScript (ES6+)**
- **Supabase** (PostgreSQL database and file storage) for shared data

## Project Structure
```
src/
  App.jsx              main component: state, login flow, page switching
  api.js               all database calls
  data.js              categories and tier logic
  hooks/useLocalStorage.js   custom hook
  components/          AuthScreen, Navbar, ExploreView, ReelsView,
                       SpotlightView, ProfileView, PostModal, TalentCard, ...
supabase/schema.sql    database setup
```

## How to Run
See [SETUP.md](SETUP.md).

## LinkedIn Article
[Paste your LinkedIn article link here]

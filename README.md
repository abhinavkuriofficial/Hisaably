# Hisaably

**Every expense. Sorted.**

Hisaably is a simple app for splitting group expenses. Add the people in a trip, a flat or a friend group, record who paid for what, and Hisaably works out who owes whom, with the fewest payments needed to settle up.

No sign-up, no login. Your data stays in your own browser.

🔗 **Live app:** [hisaably-sand.vercel.app](https://hisaably-sand.vercel.app)

---

## Features

- **Groups:** create groups for trips, roommates, friends or anything else. Add, rename or remove members.
- **Expenses:** add, edit and delete expenses, with the title, amount, date, who paid and an optional note.
- **Equal or custom split:** split equally among the people you pick, or type each person's share. A custom split only saves when the shares add up exactly to the bill.
- **Balances:** see who gets money back and who owes, per group and across all groups, with "paid" vs "share" for every member.
- **Settle up:** suggested payments that settle everyone in as few steps as possible. Tap **Mark as paid** after paying by UPI or cash, and **Undo** if you made a mistake. (Hisaably only keeps track; it never moves real money.)
- **Dashboard:** your totals, your share this month, quick actions, your groups and recent activity.
- **Backup:** export all your data to a `.json` file and import it again, on the same device or a new one.
- **Demo data:** sample groups (marked **DEMO**) to try the app, which you can remove or add back from Settings.
- **Works on phone and desktop:** sidebar on desktop, bottom menu on mobile.

## Money is always exact

All amounts are stored as whole numbers of **paise** (₹1 = 100 paise), never as decimals, so there are no rounding errors.
When ₹100 is split 3 ways, the shares are ₹33.34 + ₹33.33 + ₹33.33, which add up to exactly ₹100.

## Tech stack

| Part | Tool |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Icons | Lucide |
| Form checks | Zod |
| Tests | Vitest |
| Storage | Browser LocalStorage (no backend needed) |
| Hosting | Vercel |

The data layer sits behind a small repository interface (`load`, `save`, `clear`), so a real database such as Supabase can be added later without changing the screens.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer and Git.

```bash
git clone https://github.com/abhinavkuriofficial/Hisaably.git
cd Hisaably
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Other commands

| Command | What it does |
|---|---|
| `npm test` | Runs all 80 automated tests (money, splits, balances, settlements, groups, expenses, backup) |
| `npm run build` | Builds the production version |
| `npm start` | Runs the production build |
| `npm run lint` | Checks the code for common mistakes |

## Project structure

```
src/
├── app/            Pages (dashboard, groups, balances, settlements, settings)
├── components/     Screens and UI pieces, grouped by feature
├── data/           Saving/loading, demo data, backup, and actions
│   └── actions/    Create / update / delete groups, expenses, settlements
├── lib/            Money, split, balance and settlement logic + form rules
├── providers/      App-wide data provider (React context)
└── types/          Data models
```

## Privacy

Hisaably has no accounts and no server database. Everything you enter is saved only in your browser on your device. Other people using the same link see their own data, not yours. Use **Settings → Export backup** to keep a copy.

## Author

Made by **Abhinav Kuri**.

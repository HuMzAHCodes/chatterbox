# 🐙 GITHUB_SETUP.md — Shared GitHub Repository Guide

> This document explains how to set up the shared GitHub repository, how both developers
> clone and work on it, and how the folder structure strategy works so each developer
> has the full project structure but only codes their own part.
> Read this on Day 1 before writing any code.

---

## The Core Idea

Both developers work in **one shared repository**. The project is a single Next.js monorepo —
frontend and backend live together.

**The rule is simple:**
- Backend developer codes only inside `app/api/`, `models/`, `lib/` (backend files), `__tests__/`, `scripts/`
- Frontend developer codes only inside `app/(pages)/`, `components/`, `styles/`
- Both developers have the **complete folder structure** on their machine
- Files owned by the other developer exist as **empty placeholder files** — correct name, correct path, no code inside

This means:
- Frontend developer has `app/api/invoices/route.ts` on their machine — but it is empty. They do not touch it.
- Backend developer has `components/Navbar/index.tsx` on their machine — but it is empty. They do not touch it.
- When code is merged from both sides, the placeholders get replaced by real code automatically.

---

## Step 1 — One Developer Creates the Repository (Do This Once)

**The backend developer does this on Day 1.**

### 1.1 Create the Next.js Project

```bash
npx create-next-app@latest invoicepk --typescript --tailwind --app --no-git
cd invoicepk
```

### 1.2 Create the GitHub Repository

1. Go to [github.com](https://github.com) → click **New repository**
2. Repository name: `invoicepk`
3. Set to **Private**
4. Do NOT initialize with README (we already have a project)
5. Click **Create repository**

### 1.3 Push the Initial Project to GitHub

```bash
cd invoicepk
git init
git add .
git commit -m "initial: Next.js 14 project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/invoicepk.git
git push -u origin main
```

### 1.4 Create the `dev` Branch

```bash
git checkout -b dev
git push origin dev
```

### 1.5 Protect `main` and `dev` Branches on GitHub

1. Go to your repo → **Settings → Branches**
2. Click **Add branch ruleset** for `main`:
   - Require pull request before merging: ✅
   - Require at least 1 approval: ✅ (or skip for 2-person team)
3. Repeat for `dev`

This prevents anyone from accidentally pushing directly to `main` or `dev`.

---

## Step 2 — Invite the Second Developer

1. Go to repo → **Settings → Collaborators**
2. Click **Add people**
3. Enter the other developer's GitHub username
4. Set role: **Write**
5. The other developer accepts the invitation from their email or GitHub notifications

---

## Step 3 — Create the Full Folder Structure with Placeholders (Do This Once)

**The backend developer runs this script on Day 1 after the repo is created.**
This creates every folder and empty placeholder file so both developers have
the complete structure from the start.

```bash
# Run from the project root
# Backend-owned files (backend dev will fill these)
mkdir -p app/api/auth/register app/api/auth/login
mkdir -p app/api/business/logo
mkdir -p app/api/clients app/api/clients/\[id\]
mkdir -p app/api/invoices app/api/invoices/\[id\]/status app/api/invoices/\[id\]/pdf/save
mkdir -p app/api/dashboard/stats
mkdir -p models
mkdir -p lib
mkdir -p scripts
mkdir -p __tests__

touch app/api/auth/register/route.ts
touch app/api/auth/login/route.ts
touch app/api/business/route.ts
touch app/api/business/logo/route.ts
touch app/api/clients/route.ts
touch "app/api/clients/[id]/route.ts"
touch app/api/invoices/route.ts
touch "app/api/invoices/[id]/route.ts"
touch "app/api/invoices/[id]/status/route.ts"
touch "app/api/invoices/[id]/pdf/route.ts"
touch "app/api/invoices/[id]/pdf/save/route.ts"
touch app/api/dashboard/stats/route.ts
touch models/Business.ts
touch models/Client.ts
touch models/Invoice.ts
touch lib/db.ts
touch lib/firebase-admin.ts
touch lib/withAuth.ts
touch lib/cloudinary.ts
touch lib/invoice-number.ts
touch lib/gst.ts
touch scripts/seed.ts
touch __tests__/clients.test.ts
touch __tests__/invoices.test.ts
touch __tests__/gst.test.ts

# Frontend-owned files (frontend dev will fill these)
mkdir -p "app/(auth)/login" "app/(auth)/register"
mkdir -p app/dashboard
mkdir -p "app/invoices/new" "app/invoices/[id]"
mkdir -p app/clients
mkdir -p app/settings
mkdir -p components/Navbar/Logo components/Navbar/SearchBar components/Navbar/DropdownMenu
mkdir -p components/InvoiceForm/LineItems components/InvoiceForm/GSTSection components/InvoiceForm/TotalsSidebar
mkdir -p components/InvoicePDF
mkdir -p components/ClientCard
mkdir -p components/Dashboard
mkdir -p styles

# Predicted common components — not required by any page yet, but created now
# for consistency. See COMPONENT_LIBRARY.md "Predicted — Pre-Scaffolded for Consistency" section.
mkdir -p components/StatusBadge
mkdir -p components/EmptyState
mkdir -p components/LoadingSpinner
mkdir -p components/ConfirmDialog
mkdir -p components/FormField

touch "app/(auth)/login/page.tsx"
touch "app/(auth)/register/page.tsx"
touch app/dashboard/page.tsx
touch app/invoices/page.tsx
touch "app/invoices/new/page.tsx"
touch "app/invoices/[id]/page.tsx"
touch app/clients/page.tsx
touch app/settings/page.tsx
touch components/Navbar/index.tsx
touch components/Navbar/Logo/index.tsx
touch components/Navbar/SearchBar/index.tsx
touch components/Navbar/DropdownMenu/index.tsx
touch components/InvoiceForm/index.tsx
touch components/InvoiceForm/LineItems/index.tsx
touch components/InvoiceForm/GSTSection/index.tsx
touch components/InvoiceForm/TotalsSidebar/index.tsx
touch components/InvoicePDF/InvoicePDFTemplate.tsx
touch components/InvoicePDF/DownloadButton.tsx
touch components/ClientCard/index.tsx
touch components/Dashboard/index.tsx
touch styles/theme.ts

# Predicted common components — empty placeholders, fill in only when a page needs them
touch components/StatusBadge/index.tsx
touch components/EmptyState/index.tsx
touch components/LoadingSpinner/index.tsx
touch components/ConfirmDialog/index.tsx
touch components/FormField/index.tsx

# Shared files (both devs use, neither changes alone)
mkdir -p types
touch types/index.ts
touch middleware.ts

echo "✅ Full folder structure created with placeholder files"
```

### Add a minimal content to each placeholder so Git tracks it:

```bash
# Run this to add a placeholder comment to every empty .ts/.tsx file
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | while read f; do
  if [ ! -s "$f" ]; then
    echo "// placeholder" > "$f"
  fi
done
```

### Commit the full structure:

```bash
git add .
git commit -m "scaffold: full folder structure with placeholder files"
git push origin dev
```

---

## Step 4 — Second Developer Clones the Repo

**The frontend developer does this on Day 1 after being invited.**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/invoicepk.git
cd invoicepk

# Switch to dev branch (this is where all work goes)
git checkout dev

# Install dependencies
npm install

# Copy env example and fill in your values
cp .env.example .env.local
# Edit .env.local with your Firebase and other credentials

# Start the dev server
npm run dev
```

At this point both developers have:
- The complete folder structure
- All placeholder files in place
- Their own `.env.local` with their credentials
- The dev server running locally

---

## Step 5 — Daily Workflow for Both Developers

### Starting a New Feature

```bash
# 1. Always start from the latest dev branch
git checkout dev
git pull origin dev

# 2. Create your feature branch
git checkout -b backend/invoice-create
# or
git checkout -b frontend/invoice-form

# 3. Write your code on this branch
# 4. Commit regularly — small commits are better than one giant commit
git add .
git commit -m "backend: add POST /api/invoices with GST calculation"

# 5. Push your branch to GitHub
git push origin backend/invoice-create
```

### Opening a Pull Request

1. Go to the GitHub repo
2. Click **Compare & pull request** (appears after you push a branch)
3. Set **base branch** to `dev` (NOT `main`)
4. Write a short description of what you built
5. Tag the other developer as a reviewer
6. Click **Create pull request**

### Reviewing a PR

1. Go to the PR on GitHub
2. Click **Files changed** — scan through the changes
3. Check: does the code match what was agreed in the relevant `.md` document?
4. Leave a comment if something looks wrong
5. Click **Approve** if everything looks correct
6. The author then clicks **Merge pull request**

### After Merging

```bash
# Both developers do this after any PR is merged into dev
git checkout dev
git pull origin dev
```

---

## Branch Naming Convention

| Developer | Pattern | Examples |
|---|---|---|
| Backend | `backend/<feature>` | `backend/auth-routes`, `backend/invoice-create`, `backend/pdf-route` |
| Frontend | `frontend/<feature>` | `frontend/auth-pages`, `frontend/invoice-form`, `frontend/dashboard` |
| Shared fix | `fix/<description>` | `fix/gst-rounding`, `fix/types-update` |
| Hotfix (production) | `hotfix/<description>` | `hotfix/pdf-crash`, `hotfix/401-on-login` |

---

## Commit Message Format

Keep commit messages short and consistent. Always prefix with the area:

```
backend: implement POST /api/invoices with server-side GST calc
frontend: build invoice form with live GST calculation
fix: correct WHT applied on total instead of subtotal
shared: update Invoice type in types/index.ts
docs: update API_REFERENCE with new pdf/save route
chore: add jest config and test setup
```

---

## `.gitignore` — Make Sure These Are Ignored

The default Next.js `.gitignore` covers most things. Verify these are in it:

```
# Environment variables — NEVER commit these
.env
.env.local
.env.*.local

# Next.js build output
.next/
out/

# Node modules
node_modules/

# Firebase service account key if downloaded
firebase-service-account*.json
*-firebase-adminsdk-*.json

# OS files
.DS_Store
Thumbs.db
```

---

## `.env.example` — Commit This to GitHub

This file IS committed to GitHub. It has placeholder values only — no real secrets.
See ENV_VARIABLES.md for the full content. Make sure it exists at the project root.

---

## How Placeholder Files Get Replaced

When both developers work in parallel:

1. Backend dev fills in `app/api/invoices/route.ts` with real code on branch `backend/invoice-create`
2. Frontend dev fills in `app/invoices/page.tsx` with real code on branch `frontend/invoice-list`
3. Both open PRs to `dev`
4. First PR merges — the placeholder in the other dev's branch is just `// placeholder` so no conflict
5. Second PR merges — both files now have real code in `dev`

**The only conflict risk is on shared files:**
- `types/index.ts`
- `lib/gst.ts`
- `middleware.ts`

For these, **always pull `dev` before editing** and communicate with the other developer before making changes.

---

## Merging `dev` into `main` (End of MVP)

Only do this on Day 14 when the full MVP is complete and tested.

```bash
# On GitHub: open a PR from dev → main
# Both developers review it
# Merge it
# Then tag the release

git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0
```

---

## Quick Reference Card

```
DAILY ROUTINE
─────────────────────────────────────────────────
Morning:   git checkout dev && git pull origin dev
           git checkout -b your/feature-branch

During:    git add . && git commit -m "..."
           (commit every 1-2 hours of work)

End of day: git push origin your/feature-branch
            Open PR to dev on GitHub
            Notify other developer

After merge: git checkout dev && git pull origin dev
─────────────────────────────────────────────────

BRANCH RULES
─────────────────────────────────────────────────
Never push to main directly
Never push to dev directly
Always branch from dev
Always PR back into dev
main ← only from dev, only on Day 14
─────────────────────────────────────────────────

SHARED FILES — ALWAYS COMMUNICATE FIRST
─────────────────────────────────────────────────
types/index.ts      ← tell other dev before changing
lib/gst.ts          ← tell other dev before changing
API_REFERENCE.md    ← tell other dev before changing
middleware.ts       ← tell other dev before changing
─────────────────────────────────────────────────
```

---

## If You Get a Merge Conflict

Conflicts should be rare if both developers respect folder ownership. If one does happen:

```bash
# You will see this after git pull or git merge
CONFLICT (content): Merge conflict in types/index.ts

# Open the file — you will see conflict markers:
<<<<<<< HEAD
  // your version
=======
  // other developer's version
>>>>>>> dev

# Talk to the other developer — decide together which version is correct
# Edit the file to keep the right version (remove the conflict markers)
# Then:
git add types/index.ts
git commit -m "fix: resolve merge conflict in types/index.ts"
```

**Never resolve a conflict in a shared file alone** — always discuss with the other developer first.

---

*Last updated: June 2026 | One repo, clear ownership, no surprises*

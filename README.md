# Abbeyview Golf Society — Website

This is the tee sheet / handicaps / Golfer of the Year website, built to be
hosted for free on **Azure Static Web Apps**, with the data (members, tee
sheets, competitions) stored centrally in **Azure Blob Storage** so
everyone sees the same live information.

You do **not** need to know how to code to get this online — just follow
the steps below in order. It takes about 20–30 minutes the first time.

---

## What you'll end up with

- A website address like `https://abbeyview-golf-society.azurestaticapps.net`
  that anyone can visit to see the tee sheet, players list, and Golfer of
  the Year tables.
- An **Admin** area (password protected) where you can set up each week's
  competition, edit players, print lists, and manage the tee sheet.
- Free hosting on Azure's "Static Web Apps" plan, plus a small "Blob
  Storage" account for the data (this costs pennies a month, if anything,
  for a club-sized site).

---

## Part 1 — Put the code on GitHub

GitHub is where the website's code lives, and it's what Azure will deploy
from.

1. Go to [github.com](https://github.com) and create a free account if you
   don't already have one.
2. Click the **+** icon (top right) → **New repository**.
   - Name it something like `abbeyview-golf-society`.
   - Choose **Private** (recommended) or Public — either works.
   - Don't tick any of the "initialize with" options.
   - Click **Create repository**.
3. On the next page, look for **"uploading an existing file"** (a link in
   the instructions) and click it.
4. Drag the **entire contents** of this folder (not the folder itself —
   its *contents*: `src`, `api`, `package.json`, `index.html`, etc.) into
   the upload box.
   - **Important:** use **Firefox** for this step if you can. Chrome has
     a habit of flattening the folder structure when you drag folders in,
     which breaks the project. Firefox uploads it correctly.
5. Scroll down and click **Commit changes**.

You should now see all the project files sitting in your GitHub
repository.

---

## Part 2 — Create an Azure Storage Account (for the data)

This is where players' names, handicaps, and tee sheet bookings will
actually be stored.

1. Go to [portal.azure.com](https://portal.azure.com) and sign in (or
   create a free Azure account — you get free credit and this app costs
   very little to run either way).
2. Click **Create a resource** → search for **Storage account** → **Create**.
3. Fill in:
   - **Resource group**: click "Create new", name it e.g. `abbeyview-rg`.
   - **Storage account name**: something unique, e.g. `abbeyviewgolfdata`
     (lowercase letters and numbers only).
   - **Region**: pick one near you (e.g. UK South).
   - **Performance**: Standard.
   - **Redundancy**: Locally-redundant storage (LRS) is the cheapest and
     fine for this.
4. Click **Review + create**, then **Create**. Wait a minute for it to
   deploy, then click **Go to resource**.
5. In the storage account's left-hand menu, go to **Access keys** (under
   "Security + networking").
6. Click **Show** next to key1, then **copy the "Connection string"**
   value. Paste it somewhere safe (e.g. a notes app) — you'll need it in
   Part 4.

---

## Part 3 — Create the Static Web App and connect GitHub

1. In the Azure Portal, click **Create a resource** → search for
   **Static Web App** → **Create**.
2. Fill in:
   - **Resource group**: choose the same `abbeyview-rg` from Part 2.
   - **Name**: e.g. `abbeyview-golf-society`.
   - **Plan type**: Free.
   - **Region**: pick one near you.
   - **Deployment details / Source**: choose **GitHub**, then sign in and
     authorize Azure if asked.
   - **Organization / Repository / Branch**: pick the repo you created in
     Part 1, and branch `main`.
   - **Build Details / Build Presets**: choose **Custom**.
     - **App location**: `/`
     - **Api location**: `api`
     - **Output location**: `dist`
3. Click **Review + create**, then **Create**.

Azure will now automatically add a small workflow file to your GitHub
repository and start building and deploying the site — you don't need to
do anything else for this part. It takes a few minutes the first time.

You can watch progress under the **Actions** tab on your GitHub repo page.

---

## Part 4 — Connect the storage account to the site

The website needs to know where to save its data.

1. In the Azure Portal, open your new **Static Web App** resource.
2. In the left-hand menu, go to **Configuration**.
3. Click **+ Add** to add a new Application Setting:
   - **Name**: `STORAGE_CONNECTION_STRING`
   - **Value**: paste the connection string you copied in Part 2.
4. Click **OK**, then **Save** at the top.

---

## Part 5 — Visit your site

1. Back on the Static Web App's **Overview** page, you'll see a **URL**
   near the top (something like
   `https://polite-stone-0123456.azurestaticapps.net`).
2. Open it — you should see the Abbeyview Golf Society tee sheet.
3. Try the **Admin sign in** tab with the password `view` (see below).

---

## Before you share the link with anyone

- **Change the admin password.** It's currently set to `view` for testing.
  Open `src/App.jsx` in GitHub (or any text editor), find this line near
  the top:

  ```js
  const ADMIN_PASSWORD = "view"; // ask Claude to change this any time
  ```

  Change `"view"` to whatever you'd like, save, and commit the change on
  GitHub. Azure will automatically redeploy the site with the new
  password within a couple of minutes.

- Note this is a simple, friendly gate to stop casual visitors editing
  things — it isn't bank-grade security. Don't store anything truly
  sensitive behind it.

---

## Making changes later

Any time you want to change something (wording, colours, new features):

1. Edit the file(s) on GitHub (or ask Claude to help and re-upload the
   changed files).
2. Commit the change.
3. Azure automatically rebuilds and redeploys — check the **Actions** tab
   on GitHub to see progress. It usually takes 1–3 minutes.

---

## If something looks wrong

- **Site loads but data doesn't save** — double-check the
  `STORAGE_CONNECTION_STRING` setting in Part 4 is saved correctly, and
  that the storage account from Part 2 hasn't been deleted.
- **Build fails in the GitHub Actions tab** — click into the failed run
  to see the error, or share the error message so it can be looked into.
- **Folder structure looks wrong on GitHub** (e.g. everything's in one
  file, or `src`/`api` folders are missing) — this usually means the
  upload was done in Chrome rather than Firefox (see Part 1, step 4).
  Delete the files and re-upload using Firefox.

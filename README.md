# My Notes - static resource site (GitHub Pages)

Pure HTML, CSS and JavaScript. No server, no database.

## Files
`index.html`, `style.css`, `script.js`, `robots.txt`, `sitemap.xml`, plus your own `images/` folder (`images/logo.png`, `images/thumbnails/...`).

## 1. Upload to GitHub
1. Create a free account at github.com and click **New repository** (public, any name).
2. Click **uploading an existing file**, drag in all files and the `images` folder, then **Commit changes**.

## 2. Turn on GitHub Pages
Repository **Settings > Pages > Build and deployment**: Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)**, then **Save**. After about a minute the site is live at `https://USERNAME.github.io/REPO/`.

## 3. Ads
Open `script.js` and edit `CONFIG.ads`. Each place has its own entry:
`top`, `belowHeading`, `between`, `aboveTimer`, `belowTimer`, `bottom`.
Set `host`, `key`, `w` and `h` from your ad code (banner code with `atOptions` and `invoke.js`). Every ad runs inside its own sandboxed iframe and only after its place exists on the page, so it cannot cover the timer or Continue button. `minWidth` hides big banners on phones.

Not wired in on purpose: pop-under / social-bar scripts and the direct link. They open or overlay other pages and can break your own rules and the ad network's rules. Keep only normal banner placements.

## 4. Add notes, apps or files (Google Sheet, no code change)
All resources come from your Google Sheet. Open it, add one row per resource, columns in row 1:
`id`, `title`, `category`, `description`, `image`, `downloadurl`.
- `id`: short unique name, no spaces (example `math-notes`)
- `image`: full image link (https://...)
- `downloadurl`: the final file link, one link only
The sheet must be shared as **Share > General access > Anyone with the link > Viewer**. The site reads it on every visit, so new rows appear without touching GitHub. If the sheet cannot be reached, the last saved list is shown. The sheet id is in `CONFIG.sheetId` and the tab name in `CONFIG.sheetName` (`script.js`).

## 5. Countdown times
`CONFIG.stepDurations`, for example `[30, 30, 30, 30, 30, 30]`. One number per step, in seconds. The number of steps equals the number of values. Step texts are in `CONFIG.stepText`.

## 6. Final download links
The `downloadurl` column of your Google Sheet. It opens in a new tab.

## Other edits
Site name, logo, contact email and the About / Privacy / Disclaimer / Terms texts are all in `CONFIG`. Replace `YOUR-USERNAME` and `YOUR-REPO` in `index.html`, `robots.txt` and `sitemap.xml` with your real address. Write your own Privacy Policy before going live, ad networks require one.

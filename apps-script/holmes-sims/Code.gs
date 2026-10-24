/**
 * Holmes Sims web app: serves one unit page per link, e.g.  .../exec?unit=P1-09
 *
 * Unit pages now come from GitHub (public repo "holmes-site", folder "units").
 * Google's servers fetch them, not the student Chromebooks, so the school filter never sees GitHub.
 * If GitHub can't be reached, it falls back to the old copy in the Drive "sites" folder.
 *
 * Setup: 1) put your GitHub username in GH_USER  2) Save  3) Deploy > Manage deployments >
 * pencil icon > Version: "New version" > Deploy  (editing the existing deployment keeps the same link).
 */
const GH_USER = 'cybertitans3793';
const GH_REPO = 'Holmes-site';
const GH_BRANCH = 'main';
const GH_FOLDER = 'units';
const DRIVE_FOLDER_ID = '1i3dMp1juBZn7r8D-8morTyHhEKjRoL9Z';   // old "sites" folder, used only as a backup
const CACHE_MINUTES = 10;   // how long a page is reused before checking GitHub again

function doGet(e) {
  const unit = String((e && e.parameter && e.parameter.unit) || '').trim().toUpperCase();
  if (!/^(P1|P2|AB)-\d{2}$/.test(unit)) {
    return HtmlService.createHtmlOutput('<p style="font:16px sans-serif">Pick a unit, e.g. <code>?unit=P1-09</code>.</p>');
  }
  const html = getUnit_(unit, e.parameter.refresh === '1');
  if (!html) {
    return HtmlService.createHtmlOutput('<p style="font:16px sans-serif">The ' + unit + ' sims page isn’t ready yet.</p>');
  }
  return HtmlService.createHtmlOutput(html)
    .setTitle(unit + ' Sims')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Cached copy if fresh, else GitHub, else the Drive backup. */
function getUnit_(unit, force) {
  const cache = CacheService.getScriptCache();
  if (!force) {
    const hit = cacheGet_(cache, unit);
    if (hit) return hit;
  }
  let html = null;
  try {
    const url = 'https://raw.githubusercontent.com/' + GH_USER + '/' + GH_REPO + '/' + GH_BRANCH + '/' + GH_FOLDER + '/' + unit + '.html';
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) html = res.getContentText('UTF-8');
  } catch (err) {
    console.warn('GitHub fetch failed for ' + unit + ': ' + err);
  }
  if (!html) html = fromDrive_(unit);
  if (html) cachePut_(cache, unit, html);
  return html;
}

function fromDrive_(unit) {
  try {
    const files = DriveApp.getFolderById(DRIVE_FOLDER_ID).getFilesByName(unit + '.html');
    let newest = null;
    while (files.hasNext()) {
      const f = files.next();
      if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
    }
    return newest ? newest.getBlob().getDataAsString('UTF-8') : null;
  } catch (err) {
    console.warn('Drive backup failed for ' + unit + ': ' + err);
    return null;
  }
}

/* The script cache holds at most 100 KB per entry, so big pages are stored in pieces. */
const CHUNK = 90000;
function cachePut_(cache, key, text) {
  const parts = {};
  const n = Math.ceil(text.length / CHUNK);
  for (let i = 0; i < n; i++) parts[key + ':' + i] = text.substr(i * CHUNK, CHUNK);
  parts[key + ':n'] = String(n);
  try { cache.putAll(parts, CACHE_MINUTES * 60); } catch (err) { console.warn('Cache skipped for ' + key + ': ' + err); }
}
function cacheGet_(cache, key) {
  const n = Number(cache.get(key + ':n'));
  if (!n) return null;
  const keys = [];
  for (let i = 0; i < n; i++) keys.push(key + ':' + i);
  const got = cache.getAll(keys);
  let out = '';
  for (let i = 0; i < n; i++) {
    const part = got[key + ':' + i];
    if (part == null) return null;
    out += part;
  }
  return out;
}

/** Run this once from the editor (select testFetch, press Run) to check GitHub is reachable. */
function testFetch() {
  const html = getUnit_('P1-09', true);
  console.log(html ? 'OK: P1-09 is ' + Math.round(html.length / 1024) + ' KB' : 'Not found. Check GH_USER, the repo name, and that the repo is public.');
}

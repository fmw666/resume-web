import puppeteer from 'puppeteer-core';

const URL = 'http://localhost:4173/';

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new',
});

const page = await browser.newPage();

const errors = [];
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
});
page.on('requestfailed', (req) => {
  errors.push(`[requestfailed] ${req.url()} -> ${req.failure()?.errorText}`);
});

await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
await new Promise((r) => setTimeout(r, 4000));

const status = await page.evaluate(() => ({
  hasSectionHome: !!document.getElementById('home'),
  hasSectionAbout: !!document.getElementById('about'),
  hasSectionWorks: !!document.getElementById('works'),
  hasSectionProjects: !!document.getElementById('projects'),
  hasSectionBlog: !!document.getElementById('blog'),
  hasSectionContact: !!document.getElementById('contact'),
  hasjQuery: typeof window.jQuery === 'function',
  hasWOW: typeof window.WOW === 'function',
  hasParallax: typeof window.Parallax === 'function',
  hasMorphext: !!(window.jQuery && window.jQuery.fn.Morphext),
  hasCounterUp: !!(window.jQuery && window.jQuery.fn.counterUp),
  hasWaypoint: typeof window.Waypoint === 'function',
  demoCardsCount: document.querySelectorAll('.demo-card').length,
  portfolioItemCount: document.querySelectorAll('.grid-item').length,
  themeClassOnBody: document.body.className,
  preloaderOpacity: document.getElementById('preloader')?.style.opacity,
}));

console.log(JSON.stringify(status, null, 2));
if (errors.length) {
  console.log('\n--- ERRORS ---');
  for (const e of errors) console.log(e);
} else {
  console.log('\nNo errors.');
}

await browser.close();

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const FRAMES_DIR = join(import.meta.dirname, 'frames');
mkdirSync(FRAMES_DIR, { recursive: true });

const URL = 'http://localhost:4000';
const VIEWPORT = { width: 1440, height: 900 };
const FPS = 24;

let frameNum = 0;

async function snap(page, label, count = 1) {
  for (let i = 0; i < count; i++) {
    const path = join(FRAMES_DIR, `frame_${String(frameNum++).padStart(4, '0')}.png`);
    await page.screenshot({ path });
  }
  console.log(`  [${String(frameNum).padStart(4)}] ${label}`);
}

async function hold(page, label, seconds) {
  await snap(page, label, Math.round(seconds * FPS));
}

async function smoothScroll(page, target, steps = 8, holdSec = 0.8) {
  const current = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i++) {
    const y = current + (target - current) * (i / steps);
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY }), y);
    await page.waitForTimeout(20);
    await snap(page, `scroll ${i}/${steps}`);
  }
  await hold(page, 'hold', holdSec);
}

async function clickByText(page, text) {
  await page.evaluate((t) => {
    const all = document.querySelectorAll('button, a, span, div');
    for (const el of all) {
      if (el.childElementCount === 0 && el.textContent.trim() === t) {
        el.click();
        return;
      }
    }
    // Fallback: partial match on buttons
    for (const el of document.querySelectorAll('button')) {
      if (el.textContent.includes(t)) { el.click(); return; }
    }
  }, text);
  await page.waitForTimeout(500);
}

async function typeInSearch(page, text) {
  // Focus the input by clicking it
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if (input) { input.focus(); input.click(); }
  });
  await page.waitForTimeout(200);
  await snap(page, 'search focused', 6);

  for (const char of text) {
    await page.evaluate((c) => {
      const input = document.querySelector('input');
      if (input) {
        input.value += c;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, char);
    await page.waitForTimeout(80);
    await snap(page, 'type', 3);
  }
}

async function clearSearch(page) {
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await page.waitForTimeout(300);
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chromium',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: VIEWPORT });

  // ── 1: Homepage ──
  console.log('\n1: Homepage');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await hold(page, 'hero', 2);

  // ── 2: Scroll to stats ──
  console.log('2: Stats');
  await smoothScroll(page, 320, 12, 1.5);

  // ── 3: Skill cards ──
  console.log('3: Cards');
  await smoothScroll(page, 580, 12, 1.5);

  // ── 4: Domain filter ──
  console.log('4: Filter');
  await smoothScroll(page, 360, 8, 0.3);
  await clickByText(page, 'Perception');
  await hold(page, 'filtered', 1.5);
  await clickByText(page, 'All');
  await hold(page, 'all', 0.5);

  // ── 5: Search ──
  console.log('5: Search');
  await smoothScroll(page, 200, 6, 0.3);
  await typeInSearch(page, 'grasp');
  await hold(page, 'results', 1.5);
  await clearSearch(page);
  await hold(page, 'cleared', 0.5);

  // ── 6: Skill detail ──
  console.log('6: Detail');
  await smoothScroll(page, 500, 8, 0.3);
  await page.evaluate(() => {
    const card = document.querySelector('.nv-up');
    if (card) card.click();
  });
  await page.waitForTimeout(600);
  await hold(page, 'detail top', 2);
  await smoothScroll(page, 380, 10, 1.2);
  await smoothScroll(page, 680, 10, 1.2);

  // ── 7: Docs overview ──
  console.log('7: Docs');
  await clickByText(page, 'Back');
  await hold(page, 'home', 0.4);
  await clickByText(page, 'Docs');
  await hold(page, 'docs overview', 2);
  await smoothScroll(page, 500, 10, 1.5);

  // ── 8: Agent Protocol ──
  console.log('8: Agent Protocol');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(150);
  await clickByText(page, 'Agent Protocol');
  await hold(page, 'agent protocol', 1.5);
  await smoothScroll(page, 400, 10, 1);
  await smoothScroll(page, 750, 10, 1);

  // ── 9: Validator ──
  console.log('9: Validator');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(150);
  await clickByText(page, 'Validator');
  await hold(page, 'validator', 1.5);
  await smoothScroll(page, 400, 10, 1.2);

  // ── 10: Knowledge Docs ──
  console.log('10: Knowledge');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(150);
  await clickByText(page, 'Knowledge Docs');
  await hold(page, 'knowledge', 1.5);
  await smoothScroll(page, 400, 10, 1.2);

  // ── 11: Install Flow ──
  console.log('11: Install');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(150);
  await clickByText(page, 'Install Flow');
  await hold(page, 'install', 1.5);
  await smoothScroll(page, 400, 10, 1.2);

  // ── 12: Contribute ──
  console.log('12: Contribute');
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await page.waitForTimeout(150);
  // Go home via logo click
  await page.evaluate(() => {
    const el = document.querySelector('[style*="cursor: pointer"]');
    if (el) el.click();
  });
  await page.waitForTimeout(400);
  await clickByText(page, 'Contribute');
  await hold(page, 'contribute', 1.5);
  await smoothScroll(page, 400, 10, 1);
  await smoothScroll(page, 700, 10, 1.5);

  await hold(page, 'end', 1);

  await browser.close();
  console.log(`\nDone: ${frameNum} frames @ ${FPS}fps = ~${(frameNum / FPS).toFixed(1)}s`);
}

main().catch(console.error);

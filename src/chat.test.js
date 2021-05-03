//  @ts-check
///  <reference types="jest" />
const { chromium } = require("playwright");
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { waitForNetworkSettled, wait, imgSnap } = require('./util');

expect.extend({ toMatchImageSnapshot });

const { code } = require('../.urbitrc');


const login = async (p) => {
  await p.goto("http://localhost:9000");
  await p.waitForSelector("input[type=password]");
  await p.fill("input[type=password]", code);
  await p.click("button[type=submit]");
  await p.waitForLoadState("networkidle");
  await p.waitForSelector("#root");
};

const clickInView = async (p, s) => {
  await p.waitForSelector(s);
  p.click(s);
  return;
};

let browser, page;


beforeAll(async () => {
  browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    logger: {
      isEnabled: () => false,
      log: (name, serv, mess) => console.log(`${name}: ${mess}`),
    },
  });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage({ recordVideo: { dir: "videos/" } });
});

afterEach(async () => {
  await page.close();
});

it("should be able to send a message", async () => {
  await login(page);
  await clickInView(page, "text=Interface Testing Facility");
  await page.click("text=Bot Land");
  await wait(180);
  await page.keyboard.type("Automated test");
  await wait(30);
  await page.keyboard.press("Enter");
}, 20000);


it("should match Chat images", async () => {
  await login(page);
  await clickInView(page, "text=Urbit Community");
  await clickInView(page, "text=Watercooler");
  await waitForNetworkSettled(page, async () => {
    await page.waitForSelector('.ChatWindow');
  });
  const image = await page.screenshot();
  expect(image).toMatchImageSnapshot(imgSnap);
}, 200000);




import type { BrowserlessContext, BrowserlessInstance } from "browserless";
import browserless from "browserless";
import getHTML from "html-get";
import metascraper from "metascraper";
import metascraperAmazon from "metascraper-amazon";
import metascraperAuthor from "metascraper-author";
// import metascraperClearbit from "metascraper-clearbit";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperIframe from "metascraper-iframe";
import metascraperImage from "metascraper-image";
import metascraperInstagram from "metascraper-instagram";
import metascraperLogo from "metascraper-logo";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import metascraperVideo from "metascraper-video";
import metascraperX from "metascraper-x";

let browserlessInstance: BrowserlessInstance | null = null;
let browserContext: BrowserlessContext | null = null;

async function getBrowserContext() {
  if (browserContext) {
    return browserContext;
  }

  const browser = getBrowserless();
  browserContext = await browser.createContext();
  return browserContext;
}

function getBrowserless() {
  if (browserlessInstance) {
    return browserlessInstance;
  }

  browserlessInstance = browserless();

  return browserlessInstance;
}

function closeBrowserless() {
  if (browserlessInstance) {
    browserlessInstance.close();
    browserlessInstance = null;
  }
}

function closeBrowserContext() {
  if (browserContext) {
    browserContext.destroyContext();
    browserContext = null;
  }
}

const getContent = async (url: string) => {
  const browserContext = await getBrowserContext();

  const promise = getHTML(url, { getBrowserless: () => browserContext });

  void promise.then(() => closeBrowserContext());

  return promise;
};

const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogo(),
  // metascraperClearbit(),
  metascraperPublisher(),
  metascraperTitle(),
  metascraperVideo(),
  metascraperIframe(),
  metascraperUrl(),
  metascraperInstagram(),
  metascraperX(),
  metascraperAmazon(),
]);

export async function getInfo(url: string) {
  const content = await getContent(url);

  const result = await scraper(content);

  closeBrowserless();

  return result;
}

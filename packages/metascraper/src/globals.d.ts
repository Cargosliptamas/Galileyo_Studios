declare module "browserless" {
  export const createContext: () => Promise<BrowserlessContext>;
  export const close: () => void;
  interface BrowserlessContext {
    destroyContext: () => void;
  }
  interface BrowserlessInstance {
    createContext: () => Promise<BrowserlessContext>;
    close: () => void;
  }
  export default function browserless(): BrowserlessInstance;
}

declare module "html-get" {
  export default function getHTML(
    url: string,
    options: { getBrowserless: () => BrowserlessContext },
  ): Promise<{ html?: string; url: string }>;
}

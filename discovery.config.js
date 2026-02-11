module.exports = {
  seo: {
    title: "FastStore",
    description: "A fast and performant store framework",
    titleTemplate: "%s | FastStore",
    author: "FastStore",
  },

  // Theming
  theme: "custom-theme",

  // Ecommerce Platform
  platform: "vtex",

  // Platform specific configs for API
  api: {
    storeId: process.env.NEXT_PUBLIC_STORE_ID || "synerisedemofaststore",
    workspace: "master",
    environment: "vtexcommercestable",
    hideUnavailableItems: true,
    incrementAddress: false,
  },

  // Default session
  session: {
    currency: {
      code: "USD",
      symbol: "$",
    },
    locale: "en-US",
    channel: '{"salesChannel":1,"regionId":""}',
    country: "USA",
    deliveryMode: null,
    addressType: null,
    postalCode: null,
    geoCoordinates: null,
    person: null,
  },

  cart: {
    id: "",
    items: [],
    messages: [],
    shouldSplitItem: true,
  },

  // Production URLs
  storeUrl: "https://synerisedemofaststore.vtex.app",
  secureSubdomain: "https://secure.vtexfaststore.com/",
  checkoutUrl: "https://secure.vtexfaststore.com/checkout",
  loginUrl: "https://secure.vtexfaststore.com/api/io/login",
  accountUrl: "https://secure.vtexfaststore.com/api/io/account",

  previewRedirects: {
    home: "/",
    plp: "/grocery",
    search: "/s?q=Veja",
    pdp: "/limpador-perfumado-veja-flores-do-mediterraneo--1l-8853860/p",
  },

  // Lighthouse CI
  lighthouse: {
    server: process.env.BASE_SITE_URL || "http://localhost:3000",
    pages: {
      home: "/",
      pdp: "/limpador-perfumado-veja-flores-do-mediterraneo--1l-8853860/p",
      collection: "/grocery",
    },
  },

  // E2E CI
  cypress: {
    pages: {
      home: "/",
      pdp: "/limpador-perfumado-veja-flores-do-mediterraneo--1l-8853860/p",
      collection: "/grocery",
      collection_filtered:
        "/grocery/?category-1=grocery&brand=Veja&facets=category-1%2Cbrand%27",
      search: "/s?q=Veja",
    },
    browser: "electron",
  },

  analytics: {
    // https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation,
    gtmContainerId: "",
  },

  experimental: {
    nodeVersion: 18,
    cypressVersion: 12,
  },

  vtexHeadlessCms: {
    webhookUrls: [
      "https://synerisedemofaststore.myvtex.com/cms-releases/webhook-releases",
    ],
  },
};

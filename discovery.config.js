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
    storeId: "synerisedemofaststore",
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
  storeUrl: "https://www.demovtexfaststore.synerise.com",
  checkoutUrl: "https://www.demovtexfaststore.synerise.com/checkout",
  loginUrl: "https://www.demovtexfaststore.synerise.com/api/io/login",
  accountUrl: "https://www.demovtexfaststore.synerise.com/api/io/account",

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
  synerise: {
    apiHost: "https://api.azu.synerise.com",
    trackerKey: "b8349350-8569-4232-99a8-0e08818c3b99",
  }
};

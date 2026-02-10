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
    hideUnavailableItems: false,
    incrementAddress: false,
  },

  // Default session
  session: {
    currency: {
      code: "PLN",
      symbol: "zł",
    },
    locale: "pl-PL",
    channel: '{"salesChannel":1,"regionId":""}',
    country: "POL",
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
  storeUrl: "https://www.faststore-demo.stage.snrstage.com",
  secureSubdomain: "https://secure.faststore-demo.stage.snrstage.com",
  checkoutUrl: "https://secure.faststore-demo.stage.snrstage.com/checkout",
  loginUrl: "https://secure.faststore-demo.stage.snrstage.com/api/io/login",
  accountUrl: "https://secure.faststore-demo.stage.snrstage.com/api/io/account",

  previewRedirects: {
    home: "/",
    plp: "/women",
    search: "/s?q=Stylinger",
    pdp: "/stylinger-kemiah-top-qoj/p",
  },

  // Lighthouse CI
  lighthouse: {
    server: process.env.BASE_SITE_URL || "https://localhost",
    pages: {
      home: "/",
      pdp: "/stylinger-kemiah-top-qoj/p",
      collection: "/women",
    },
  },

  // E2E CI
  cypress: {
    pages: {
      home: "/",
      pdp: "/stylinger-kemiah-top-qoj/p",
      collection: "/women",
      collection_filtered:
        "/women/?category-1=women&brand=Stylinger&facets=category-1%2Cbrand%27",
      search: "/s?q=Stylinger",
    },
    browser: "electron",
  },

  analytics: {
    // https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation,
    gtmContainerId: "GTM-1234567",
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

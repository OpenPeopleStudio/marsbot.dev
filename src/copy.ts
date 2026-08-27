const lede =
  "A sovereign personal AI platform. One plant: phone, desk, gateway.";

export const COPY = {
  wordmark: "Mars",
  title: "Mars",
  lede,
  description: lede,
  layers:
    "Open People is the company. Sol is who you talk to. Mars is what you touch.",
  refusal:
    "Not a product you can sign up for. Not a dataset you export. Not on GitHub.",
  marks: {
    mars: ">",
    sol: "╭·╮",
    openPeople: "( · )",
  },
  sol: {
    name: "Sol",
    line: "the phone. Where you go for an answer.",
  },
  desk: {
    name: "mars.bot",
    line: "the Mac. Where you decide and do.",
  },
  gateway: {
    name: "marsbase",
    line: "the gateway. Every surface hits this edge.",
  },
  footer: {
    studio: "Open People · est. 2024",
    copyright: "© 2026 Open People",
    href: "https://openpeople.ai",
  },
} as const;

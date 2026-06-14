export const ETHNIC_SIZE_ROWS_IN = [
  {
    size: "XS",
    bust: "32",
    waist: "28",
    hip: "36",
  },
  {
    size: "S",
    bust: "34",
    waist: "30",
    hip: "38",
  },
  {
    size: "M",
    bust: "36",
    waist: "32",
    hip: "40",
  },
  {
    size: "L",
    bust: "38",
    waist: "34",
    hip: "42",
  },
  {
    size: "XL",
    bust: "40",
    waist: "36",
    hip: "44",
  },
  {
    size: "XXL",
    bust: "42",
    waist: "38",
    hip: "46",
  },
  {
    size: "3XL",
    bust: "44",
    waist: "40",
    hip: "48",
  },
  {
    size: "4XL",
    bust: "46",
    waist: "42",
    hip: "50",
  }
];

export const ETHNIC_INTERNATIONAL_SIZE_ROWS = [
  {
    size: "XS",
    bust: "32",
    india: "XS",
    us: "2",
    uk: "6",
    eu: "34"
  },
  {
    size: "S",
    bust: "34",
    india: "S",
    us: "4",
    uk: "8",
    eu: "36"
  },
  {
    size: "M",
    bust: "36",
    india: "M",
    us: "6",
    uk: "10",
    eu: "38"
  },
  {
    size: "L",
    bust: "38",
    india: "L",
    us: "8",
    uk: "12",
    eu: "40"
  },
  {
    size: "XL",
    bust: "40",
    india: "XL",
    us: "10",
    uk: "14",
    eu: "42"
  },
  {
    size: "XXL",
    bust: "42",
    india: "XXL",
    us: "12",
    uk: "16",
    eu: "44"
  },
  {
    size: "3XL",
    bust: "44",
    india: "3XL",
    us: "14",
    uk: "18",
    eu: "46"
  },
  {
    size: "4XL",
    bust: "46",
    india: "4XL",
    us: "16",
    uk: "20",
    eu: "48"
  }
];

export const SIZE_CHART_CONFIG = {
  suit: {
    type: "ethnic",
    heading: "Suit Size Chart",
  },

  "suit-set": {
    type: "ethnic",
    heading: "Suit Size Chart",
  },

  kurta: {
    type: "ethnic",
    heading: "Kurta Size Chart",
  },

  "kurta-set": {
    type: "ethnic",
    heading: "Kurta Set Size Chart",
  },

  palazzo: {
    type: "ethnic",
    heading: "Palazzo Size Chart",
  },

  sharara: {
    type: "ethnic",
    heading: "Sharara Size Chart",
  },

  gharara: {
    type: "ethnic",
    heading: "Gharara Size Chart",
  },

  anarkali: {
    type: "ethnic",
    heading: "Anarkali Size Chart",
  },

  "co-ord-set": {
    type: "ethnic",
    heading: "Co-ord Set Size Chart",
  },

  festive: {
    type: "ethnic",
    heading: "Ethnic Wear Size Chart",
  },

  partywear: {
    type: "ethnic",
    heading: "Party Wear Size Chart",
  }
};

export function getSizeChartType(category) {
  return SIZE_CHART_CONFIG[category] ?? { type: "bra", heading: "Size Chart" };
}

sizeAndFits: [
  {
    label: "Fit",
    value: "Regular Fit"
  },
  {
    label: "Length",
    value: "46 Inches"
  },
  {
    label: "Neck",
    value: "V Neck"
  },
  {
    label: "Sleeve Length",
    value: "3/4 Sleeves"
  },
  {
    label: "Bottom Type",
    value: "Palazzo"
  },
  {
    label: "Dupatta",
    value: "Organza Dupatta Included"
  }
]

sizes: [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL"
]
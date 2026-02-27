// src/data/products.js

export const allProducts = [
  {
    id: "delimira-wireless-01",
    name: "DELIMIRA Women's Wireless Plus Size Full Coverage Bra",
    category: "non-padded",
    description: "Comfortable unlined bra for everyday wear.",
    variants: [
      {
        id: "v1-grey",
        colorName: "Quantum Grey",
        price: "2,572.92",
        images: [
          "/image/non-padded/Non-Padded-Bras-1.jpg",
          "/image/non-padded/Non-Padded-Bras-2.jpg",
          "/image/non-padded/Non-Padded-Bras-3.jpg",
          "/image/non-padded/Non-Padded-Bras-large.jpg"
        ],
        swatchImg: "/image/non-padded/Non-Padded-Bras-1.jpg"
      },
      {
        id: "v1-blue",
        colorName: "Sargasso Blue",
        price: "2,389.08",
        images: [
          "/image/non-padded/Non-Padded-Bras-4.jpg",
          "/image/non-padded/Non-Padded-Bras-5.jpg"
        ],
        swatchImg: "image/non-padded/Non-Padded-Bras-4.jpg"
      },
      {
        id: "v1-black",
        colorName: "Jet Black",
        price: "2,572.92",
        images: [
          "/image/non-padded/Non-Padded-Bras-6.jpg",
          "/image/non-padded/Non-Padded-Bras-7.jpg",
          "/image/non-padded/Non-Padded-Bras-8.jpg"
        ],
        swatchImg: "/image/non-padded/Non-Padded-Bras-6.jpg"
      }
    ]
  },

  {
    id: "padded-bra-02",
    name: "Clovia Style Padded Comfort Bra",
    category: "padded",
    description: "Lightly padded for a smooth look under t-shirts.",
    variants: [
      {
        id: "v2-nude",
        colorName: "Skin",
        price: "1,299.00",
        images: [
          "/image/padded/padded-1.jpg",
          "/image/padded/padded-2.jpg"
        ],
        swatchImg: "/image/padded/padded-1.jpg"
      }
    ]
  }
];

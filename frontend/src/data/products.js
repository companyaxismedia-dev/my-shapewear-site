export const allProducts = [
  {
    id: "delimira-wireless-01",
    name: "DELIMIRA Women's Wireless Plus Size Full Coverage Bra",
    category: "non-padded", // Clovia style category
    description: "Comfortable unlined bra for everyday wear.",
    variants: [
      {
        id: "v1-grey",
        colorName: "Quantum Grey",
        price: "2,572.92",
        // Amazon style: Har color ki apni unique images ka array
        images: [
          "/non-padded/Non-Padded-Bras-1.jpg", 
          "/non-padded/Non-Padded-Bras-2.jpg",
          "/non-padded/Non-Padded-Bras-3.jpg",
          "/non-padded/Non-Padded-Bras-large.jpg"
        ],
        // Ye image color selection box (swatch) mein dikhegi
        swatchImg: "/non-padded/Non-Padded-Bras-1.jpg"
      },
      {
        id: "v1-blue",
        colorName: "Sargasso Blue",
        price: "2,389.08",
        images: [
          "/non-padded/Non-Padded-Bras-4.jpg",
          "/non-padded/Non-Padded-Bras-5.jpg"
        ],
        swatchImg: "/non-padded/Non-Padded-Bras-4.jpg"
      },
      {
        id: "v1-black",
        colorName: "Jet Black",
        price: "2,572.92",
        images: [
          "/non-padded/Non-Padded-Bras-6.jpg",
          "/non-padded/Non-Padded-Bras-7.jpg",
          "/non-padded/Non-Padded-Bras-8.jpg"
        ],
        swatchImg: "/non-padded/Non-Padded-Bras-6.jpg"
      }
    ]
  },
  {
    id: "padded-bra-02",
    name: "Clovia Style Padded Comfort Bra",
    category: "padded", // Dusri category
    description: "Lightly padded for a smooth look under t-shirts.",
    variants: [
      {
        id: "v2-nude",
        colorName: "Skin",
        price: "1,299.00",
        images: ["/padded/padded-1.jpg", "/padded/padded-2.jpg"],
        swatchImg: "/padded/padded-1.jpg"
      }
    ]
  }
];
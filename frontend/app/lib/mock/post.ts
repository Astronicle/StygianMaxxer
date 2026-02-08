export const mockPost = [
  {
    postID: 232,
    title: "First post",
    description: "Hello world",
    rating: 5,
    videoLink: null,
    createdAt: "2025-01-10T12:00:00Z",

    author: {
      accountID: 1,
      username: "Astronicle",
    },

    stygianAttempt: {
      stygianID: 1,
      version: "6.2",

      bosses: [
        {
          id: 1,
          name: "Overseer",
          icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHfI1dIH0BWPtYYXrbS2fLoZcqLhCWKjOtiw&s",

          characters: [
            {
              id: 1,
              name: "Amber",
              icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-z6P-YcU24-CPeOFQgWuuVfKkOXJJo57r_w&s",
              element: "Pyro",
              weapon: "Bow",
              cons: 6,
              hasSig: false,
              rarity: 4,
            },
            {
              id: 2,
              name: "Furina",
              icon: "https://static.wikia.nocookie.net/gensin-impact/images/2/27/Furina_Card.png/revision/latest?cb=20230925100151",
              element: "Hydro",
              weapon: "Sword",
              cons: 2,
              hasSig: false,
              rarity: 5,
            },
          ],
        },

        {
          id: 2,
          name: "Lava Dragon",
          icon: "https://static.wikia.nocookie.net/gensin-impact/images/e/ee/Enemy_Lava_Dragon_Statue.png/revision/latest/scale-to-width-down/1200?cb=20250326024556",

          characters: [
            {
              id: 3,
              name: "Varka",
              icon: "https://static.wikia.nocookie.net/gensin-impact/images/e/e5/Varka_Card.png/revision/latest?cb=20260123040343",
              element: "Anemo",
              weapon: "Claymore",
              cons: 6,
              hasSig: true,
              rarity: 5,
            },
            {
              id: 4,
              name: "Zibai",
              icon: "https://static.wikia.nocookie.net/gensin-impact/images/f/fb/Zibai_Card.png/revision/latest?cb=20251211040212",
              element: "Electro",
              weapon: "Sword",
              cons: 4,
              hasSig: false,
              rarity: 5,
            },
          ],
        },
      ],
    },
  },

  // {
  //   postID: 2232,
  //   title: "Second post",
  //   description: "Another post",
  //   rating: 4,
  //   videoLink: "https://...",
  //   createdAt: "2025-01-12T09:30:00Z",

  //   author: {
  //     accountID: 1,
  //     username: "Astronicle",
  //   },

  //   stygianAttempt: {
  //     stygianID: 1,
  //     version: "6.2",

  //     bosses: [
  //       {
  //         id: 3,
  //         name: "Suanni",
  //         icon: "https://static.wikia.nocookie.net/gensin-impact/images/0/0d/Enemy_Solitary_Suanni.png/revision/latest/scale-to-width-down/300?cb=20240916082016",

  //         characters: [
  //           {
  //             id: 2,
  //             name: "Furina",
  //             icon: "https://static.wikia.nocookie.net/gensin-impact/images/2/27/Furina_Card.png/revision/latest?cb=20230925100151",
  //             element: "Hydro",
  //             weapon: "Sword",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },
];

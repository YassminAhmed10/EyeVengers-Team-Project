export const LENS_OPTIONS = [
  {
    id: "standard",
    name: "Standard",
    description: "Lightweight daily lens with anti-glare coating.",
    extraPrice: 0,
  },
  {
    id: "blue-light",
    name: "Blue Light Block",
    description: "Filters digital screen glare for eye comfort.",
    extraPrice: 35,
  },
  {
    id: "photochromic",
    name: "Photochromic",
    description: "Adapts to sunlight and darkens outdoors.",
    extraPrice: 60,
  },
  {
    id: "polarized",
    name: "Polarized",
    description: "Reduces reflections and improves outdoor clarity.",
    extraPrice: 75,
  },
];

const GLASS_IMAGES = import.meta.glob("../../GLASS/**/*.{webp,png,jpg,jpeg}", {
  eager: true,
  import: "default",
});

const COLOR_HEX = {
  black: "#111827",
  blue: "#1d4ed8",
  clear: "#dbeafe",
  gray: "#6b7280",
  green: "#2f855a",
  tortoise: "#7a4b2e",
  gold: "#d4af37",
  burgundy: "#800020",
  pattern: "#8b6a42",
  pink: "#ec4899",
  purple: "#7c3aed",
  skiblue: "#38bdf8",
  "pink&gold": "#d97706",
  rosegold: "#b76e79",
};

const COLOR_LABELS = {
  gray: "Gray",
  rosegold: "Rose Gold",
  skiblue: "Sky Blue",
  "pink&gold": "Pink & Gold",
};

const IMAGE_INDEX = Object.entries(GLASS_IMAGES).reduce((acc, [assetPath, imageUrl]) => {
  const match = assetPath.match(/GLASS\/(?:Kids\/)?([^/]+)\/([^/]+)\/([^/]+)$/i);

  if (!match) {
    return acc;
  }

  const model = match[1].toLowerCase();
  const color = match[2].toLowerCase();
  const file = match[3];
  const key = `${model}/${color}`;

  if (!acc[key]) {
    acc[key] = [];
  }

  acc[key].push({ file, url: imageUrl });

  return acc;
}, {});

const fileRank = (fileName, model) => {
  const lower = fileName.toLowerCase();

  if (lower.startsWith(`${model.toLowerCase()}_`)) {
    return 0;
  }

  const numbered = lower.match(/^(\d+)-/);

  if (numbered) {
    return Number(numbered[1]);
  }

  return 99;
};

const resolveColorImages = (model, colorFolder) => {
  const key = `${model.toLowerCase()}/${colorFolder.toLowerCase()}`;
  const files = IMAGE_INDEX[key] ?? [];

  return [...files]
    .sort((a, b) => {
      const rankA = fileRank(a.file, model);
      const rankB = fileRank(b.file, model);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return a.file.localeCompare(b.file);
    })
    .map((item) => item.url);
};

const toLabel = (name) =>
  COLOR_LABELS[name.toLowerCase()] ??
  name
    .split("&")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" & ");

const color = (model, folderName) => {
  const name = folderName.toLowerCase();
  const images = resolveColorImages(model, folderName);

  return {
    name,
    label: toLabel(folderName),
    hex: COLOR_HEX[name] ?? "#9ca3af",
    image: images[0] ?? "",
    images,
  };
};

const buildProduct = ({ id, model, name, subtitle, price, colorFolders, ...meta }) => {
  const colorOptions = colorFolders.map((folder) => color(model, folder));

  return {
    id,
    name,
    subtitle,
    price,
    image: colorOptions[0]?.image ?? "",
    colorOptions,
    ...meta,
  };
};

const PRODUCT_CONFIG = [
  {
    id: 1,
    model: "N1",
    audience: "adult",
    name: "Noor Avenue",
    subtitle: "Classic Everyday",
    price: 245,
    colorFolders: ["black", "clear", "green", "Tortoise"],
    badge: "Best Seller",
    badgeVariant: "outline",
    style: "Square",
    frameMaterial: "Acetate",
    fit: "Medium",
    description:
      "Clean and balanced frame shape made for daily wear with lightweight comfort.",
  },
  {
    id: 2,
    model: "N2",
    audience: "adult",
    name: "Sahara Round",
    subtitle: "Modern Refined",
    price: 210,
    colorFolders: ["black", "gold", "Tortoise"],
    style: "Round",
    frameMaterial: "Acetate",
    fit: "Narrow",
    description:
      "Refined rounded silhouette with clean lines and balanced proportions.",
  },
  {
    id: 3,
    model: "N3",
    audience: "adult",
    name: "Ruby Cat-Eye",
    subtitle: "Expressive Look",
    price: 195,
    colorFolders: ["black", "burgundy", "pattern", "tortoise"],
    badge: "New",
    badgeVariant: "solid",
    style: "Cat-eye",
    frameMaterial: "Premium Acetate",
    fit: "Medium",
    description:
      "Bold cat-eye geometry with standout character and polished finishing.",
  },
  {
    id: 4,
    model: "N4",
    audience: "adult",
    name: "Luxe Horizon",
    subtitle: "Signature Collection",
    price: 230,
    colorFolders: ["black", "gold", "pink", "pink&gold", "rosegold"],
    style: "Square",
    frameMaterial: "Steel Core",
    fit: "Wide",
    description:
      "Distinctive square profile with premium build and fashion-forward color options.",
  },
  {
    id: 5,
    model: "N5",
    audience: "adult",
    name: "Emerald Edge",
    subtitle: "Premium Edition",
    price: 260,
    colorFolders: ["black", "green", "pink", "Tortoise"],
    style: "Geometric",
    frameMaterial: "Carbon Blend",
    fit: "Medium",
    description:
      "Angular premium frame inspired by avant-garde silhouettes and confident styling.",
  },
  {
    id: 6,
    model: "K1",
    audience: "kids",
    name: "Mini Pop",
    subtitle: "Kids Everyday",
    price: 165,
    colorFolders: ["pink", "skiblue"],
    badge: "Kids",
    badgeVariant: "solid",
    style: "Round",
    frameMaterial: "Flexible Acetate",
    fit: "Narrow",
    description: "Lightweight and playful frame designed for all-day school comfort.",
  },
  {
    id: 7,
    model: "K2",
    audience: "kids",
    name: "Tiny Spark",
    subtitle: "Active Kids",
    price: 175,
    colorFolders: ["Gray", "pink"],
    badge: "Kids",
    badgeVariant: "solid",
    style: "Square",
    frameMaterial: "Rubberized Flex",
    fit: "Narrow",
    description: "Durable hinges and soft temples for active children.",
  },
  {
    id: 8,
    model: "K3",
    audience: "kids",
    name: "Junior Edge",
    subtitle: "Fun & Confident",
    price: 185,
    colorFolders: ["Black", "blue", "Purple"],
    badge: "Kids",
    badgeVariant: "solid",
    style: "Geometric",
    frameMaterial: "TR90",
    fit: "Narrow",
    description: "Modern geometric shape with soft-touch finish and bright colors.",
  },
  {
    id: 9,
    model: "K4",
    audience: "kids",
    name: "Play Beam",
    subtitle: "Color Splash",
    price: 180,
    colorFolders: ["black", "green", "purple"],
    badge: "Kids",
    badgeVariant: "solid",
    style: "Square",
    frameMaterial: "Acetate",
    fit: "Narrow",
    description: "Colorful and balanced frame made to fit younger faces comfortably.",
  },
  {
    id: 10,
    model: "K5",
    audience: "kids",
    name: "Kiddo Wave",
    subtitle: "Bright Edition",
    price: 170,
    colorFolders: ["Blue", "Purple"],
    badge: "Kids",
    badgeVariant: "solid",
    style: "Round",
    frameMaterial: "TR90",
    fit: "Narrow",
    description: "Curved playful profile with vibrant tones and extra flexibility.",
  },
];

export const PRODUCTS = PRODUCT_CONFIG.map(buildProduct);

/* ─────────────────────────────────────────────────────────────
   HTML_PRODUCTS — the 8 products from the HTML reference.
   Images are served from the public folder as /prod1_1.avif etc.
   (place prod1_1.avif … prod8_2.avif in your /public directory)
───────────────────────────────────────────────────────────── */
export const HTML_PRODUCTS = [
  {
    id: "h1",
    brand: "Ray-Ban",
    model: "PO3292V",
    name: "Wayfarer",
    oldPrice: "399.00",
    price: "339.15",
    discount: "-15%",
    img1: "/prod1_1.avif",
    img2: "/prod1_2.avif",
  },
  {
    id: "h2",
    brand: "Oakley",
    model: "Oakley Meta HSTN Transitions®",
    name: "Holbrook",
    oldPrice: "210.00",
    price: "178",
    discount: "-15%",
    img1: "/prod2_1.avif",
    img2: "/prod2_2.avif",
  },
  {
    id: "h3",
    brand: "Ray-Ban",
    model: "RB3025 Classic",
    name: "Aviator",
    oldPrice: "195.00",
    price: "165",
    discount: "-15%",
    img1: "/prod3_1.avif",
    img2: "/prod3_2.avif",
  },
  {
    id: "h4",
    brand: "Oakley",
    model: "OO9013 Prizm™",
    name: "Frogskins",
    oldPrice: "170.00",
    price: "145",
    discount: "-15%",
    img1: "/prod4_1.avif",
    img2: "/prod4_2.avif",
  },
  {
    id: "h5",
    brand: "Ray-Ban",
    model: "RB3016 Polarized",
    name: "Clubmaster",
    oldPrice: "222.00",
    price: "189",
    discount: "-15%",
    img1: "/prod5_1.avif",
    img2: "/prod5_2.avif",
  },
  {
    id: "h6",
    brand: "Oakley",
    model: "EV Path Photochromic",
    name: "Radar EV",
    oldPrice: "230.00",
    price: "195",
    discount: "-15%",
    img1: "/prod6_1.avif",
    img2: "/prod6_2.avif",
  },
  {
    id: "h7",
    brand: "Burberry",
    model: "RB2180V Optics",
    name: "Round Metal",
    oldPrice: "199.00",
    price: "169",
    discount: "-15%",
    img1: "/prod7_1.avif",
    img2: "/prod7_2.avif",
  },
  {
    id: "h8",
    brand: "Prada",
    model: "OO9406 Lite Matte",
    name: "Sutro Lite",
    oldPrice: "218.00",
    price: "185",
    discount: "-15%",
    img1: "/prod8_1.avif",
    img2: "/prod8_2.avif",
  },
];
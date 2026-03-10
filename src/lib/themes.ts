export interface Theme {
  id: string;
  name: string;
  colors: {
    dark: string;
    tan: string;
    cream: string;
    tanLight: string;
    tanDark: string;
    creamDark: string;
  };
  fonts: {
    script: string;
    serif: string;
    sans: string;
  };
  googleFontsUrl: string;
}

export const themes: Theme[] = [
  {
    id: "elegant-cream",
    name: "Elegant Cream",
    colors: {
      dark: "#2d2b25",
      tan: "#cdc1ab",
      cream: "#faf1e1",
      tanLight: "#d9d0be",
      tanDark: "#b5a992",
      creamDark: "#efe4d0",
    },
    fonts: {
      script: "'Pinyon Script', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Pinyon+Script&family=Josefin+Sans:wght@300;400;500;600&display=swap",
  },
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    colors: {
      dark: "#0f1a2e",
      tan: "#8a9bb5",
      cream: "#eef1f6",
      tanLight: "#a3b1c8",
      tanDark: "#6e7f99",
      creamDark: "#dde2ea",
    },
    fonts: {
      script: "'Great Vibes', cursive",
      serif: "'Libre Baskerville', Georgia, serif",
      sans: "'Raleway', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Raleway:wght@300;400;500;600&display=swap",
  },
  {
    id: "sage-garden",
    name: "Sage Garden",
    colors: {
      dark: "#2c3528",
      tan: "#b5c4a8",
      cream: "#f4f7f0",
      tanLight: "#c8d4bc",
      tanDark: "#97a88a",
      creamDark: "#e5ebe0",
    },
    fonts: {
      script: "'Dancing Script', cursive",
      serif: "'Lora', Georgia, serif",
      sans: "'Nunito Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Nunito+Sans:wght@300;400;500;600&display=swap",
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    colors: {
      dark: "#3a2a2e",
      tan: "#cdb5b5",
      cream: "#faf2f2",
      tanLight: "#dbc8c8",
      tanDark: "#b89a9a",
      creamDark: "#f0e2e2",
    },
    fonts: {
      script: "'Alex Brush', cursive",
      serif: "'Playfair Display', Georgia, serif",
      sans: "'Lato', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lato:wght@300;400;700&display=swap",
  },
  {
    id: "classic-black",
    name: "Classic Black & White",
    colors: {
      dark: "#1a1a1a",
      tan: "#a0a0a0",
      cream: "#f5f5f5",
      tanLight: "#b8b8b8",
      tanDark: "#888888",
      creamDark: "#e8e8e8",
    },
    fonts: {
      script: "'Tangerine', cursive",
      serif: "'EB Garamond', Georgia, serif",
      sans: "'Inter', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
  },
];

export function getTheme(templateId: string): Theme {
  return themes.find((t) => t.id === templateId) ?? themes[0];
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    dark: string;
    accent: string;      // was tan
    primary: string;     // was cream
    accentLight: string; // was tanLight
    accentDark: string;  // was tanDark
    primaryDark: string; // was creamDark
  };
  fonts: {
    script: string;
    serif: string;
    sans: string;
  };
  googleFontsUrl: string;
}

export interface FontStyle {
  id: "timeless" | "modern" | "playful" | "vintage" | "editorial" | "bohemian" | "classic-serif" | "bold-modern";
  name: string;
  fonts: {
    script: string;
    serif: string;
    sans: string;
  };
  googleFontsUrl: string;
  overrides?: {
    letterSpacingSans?: string;
    letterSpacingSerif?: string;
    lineHeightScript?: string;
    fontWeightSans?: string;
  };
}

export const fontStyles: FontStyle[] = [
  {
    id: "timeless",
    name: "Timeless Elegance",
    fonts: {
      script: "'Pinyon Script', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Pinyon+Script&family=Josefin+Sans:wght@300;400;500;600&display=swap",
    overrides: {
      letterSpacingSans: "0.1em",
      letterSpacingSerif: "0.02em",
      lineHeightScript: "1.2",
    }
  },
  {
    id: "editorial",
    name: "Editorial Luxe",
    fonts: {
      script: "'Mea Culpa', cursive",
      serif: "'Tenor Sans', sans-serif",
      sans: "'Montserrat', sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Mea+Culpa&family=Tenor+Sans&family=Montserrat:wght@200;300;400&display=swap",
    overrides: {
      letterSpacingSans: "0.25em",
      letterSpacingSerif: "0.15em",
      lineHeightScript: "1.1",
      fontWeightSans: "200",
    }
  },
  {
    id: "bohemian",
    name: "Wild & Free",
    fonts: {
      script: "'La Belle Aurore', cursive",
      serif: "'Lora', serif",
      sans: "'Work Sans', sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=La+Belle+Aurore&family=Lora:ital,wght@0,400;1,400&family=Work+Sans:wght@300;400&display=swap",
    overrides: {
      letterSpacingSans: "0.05em",
      letterSpacingSerif: "-0.01em",
      lineHeightScript: "1.4",
    }
  },
  {
    id: "classic-serif",
    name: "Heritage Serif",
    fonts: {
      script: "'Mrs Saint Delafield', cursive",
      serif: "'Libre Baskerville', serif",
      sans: "'Source Sans 3', sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap",
    overrides: {
      letterSpacingSans: "0.08em",
      letterSpacingSerif: "0.01em",
      lineHeightScript: "1.3",
    }
  },
  {
    id: "bold-modern",
    name: "Urban Bold",
    fonts: {
      script: "'Monsieur La Doulaise', cursive",
      serif: "'Fraunces', serif",
      sans: "'Archivo', sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=Archivo:wght@300;400;700&display=swap",
    overrides: {
      letterSpacingSans: "-0.02em",
      letterSpacingSerif: "-0.03em",
      lineHeightScript: "1.0",
      fontWeightSans: "700",
    }
  },
  {
    id: "modern",
    name: "Modern Minimalist",
    fonts: {
      script: "'Great Vibes', cursive",
      serif: "'Libre Baskerville', Georgia, serif",
      sans: "'Raleway', system-ui, sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Raleway:wght@300;400;500;600&display=swap",
    overrides: {
      letterSpacingSans: "0.15em",
      letterSpacingSerif: "0.05em",
      lineHeightScript: "1.2",
    }
  },
  {
    id: "playful",
    name: "Playful Romance",
    fonts: {
      script: "'Dancing Script', cursive",
      serif: "'Lora', Georgia, serif",
      sans: "'Nunito Sans', system-ui, sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Nunito+Sans:wght@300;400;500;600&display=swap",
    overrides: {
      letterSpacingSans: "0.02em",
      letterSpacingSerif: "0em",
      lineHeightScript: "1.5",
    }
  },
  {
    id: "vintage",
    name: "Vintage Heritage",
    fonts: {
      script: "'Alex Brush', cursive",
      serif: "'Playfair Display', Georgia, serif",
      sans: "'Lato', system-ui, sans-serif",
    },
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lato:wght@300;400;700&display=swap",
    overrides: {
      letterSpacingSans: "0.12em",
      letterSpacingSerif: "0.08em",
      lineHeightScript: "1.2",
    }
  },
];

export const themes: Theme[] = [
  {
    id: "elegant-cream",
    name: "Elegant Cream",
    colors: {
      dark: "#2d2b25",
      accent: "#cdc1ab",
      primary: "#faf1e1",
      accentLight: "#d9d0be",
      accentDark: "#b5a992",
      primaryDark: "#efe4d0",
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
      accent: "#8a9bb5",
      primary: "#eef1f6",
      accentLight: "#a3b1c8",
      accentDark: "#6e7f99",
      primaryDark: "#dde2ea",
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
      accent: "#b5c4a8",
      primary: "#f4f7f0",
      accentLight: "#c8d4bc",
      accentDark: "#97a88a",
      primaryDark: "#e5ebe0",
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
      accent: "#cdb5b5",
      primary: "#faf2f2",
      accentLight: "#dbc8c8",
      accentDark: "#b89a9a",
      primaryDark: "#f0e2e2",
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
      accent: "#a0a0a0",
      primary: "#f5f5f5",
      accentLight: "#b8b8b8",
      accentDark: "#888888",
      primaryDark: "#e8e8e8",
    },
    fonts: {
      script: "'Tangerine', cursive",
      serif: "'EB Garamond', Georgia, serif",
      sans: "'Inter', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
  },

  // ─── Summer Palettes ───

  {
    id: "golden-sunset",
    name: "Golden Sunset",
    colors: {
      dark: "#4a2c17",
      accent: "#e8a84c",
      primary: "#fff8ed",
      accentLight: "#f0c078",
      accentDark: "#c98b30",
      primaryDark: "#faecd4",
    },
    fonts: {
      script: "'Great Vibes', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Josefin+Sans:wght@300;400;500;600&display=swap",
  },
  {
    id: "tropical-teal",
    name: "Tropical Teal",
    colors: {
      dark: "#134242",
      accent: "#5ab8a4",
      primary: "#f0faf7",
      accentLight: "#7ecfbe",
      accentDark: "#3a9a86",
      primaryDark: "#daf0ea",
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
    id: "coral-breeze",
    name: "Coral Breeze",
    colors: {
      dark: "#3d2020",
      accent: "#e07858",
      primary: "#fff5f0",
      accentLight: "#eca088",
      accentDark: "#c45a3a",
      primaryDark: "#fce4da",
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
    id: "ocean-azure",
    name: "Ocean Azure",
    colors: {
      dark: "#14283d",
      accent: "#5b9cc7",
      primary: "#f0f6fb",
      accentLight: "#82b5d8",
      accentDark: "#3d7fae",
      primaryDark: "#d8e8f4",
    },
    fonts: {
      script: "'Pinyon Script', cursive",
      serif: "'Libre Baskerville', Georgia, serif",
      sans: "'Raleway', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Raleway:wght@300;400;500;600&display=swap",
  },

  // ─── Pastel Palettes ───

  {
    id: "pastel-lavender",
    name: "Pastel Lavender",
    colors: {
      dark: "#3b3454",
      accent: "#c4b5dc",
      primary: "#f8f5fc",
      accentLight: "#d6cce8",
      accentDark: "#a899c4",
      primaryDark: "#ede7f5",
    },
    fonts: {
      script: "'Great Vibes', cursive",
      serif: "'EB Garamond', Georgia, serif",
      sans: "'Inter', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
  },
  {
    id: "pastel-blush",
    name: "Pastel Blush",
    colors: {
      dark: "#4a3038",
      accent: "#e8b4bc",
      primary: "#fdf5f7",
      accentLight: "#f0cdd3",
      accentDark: "#d4949e",
      primaryDark: "#f7e4e8",
    },
    fonts: {
      script: "'Dancing Script', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Josefin+Sans:wght@300;400;500;600&display=swap",
  },
  {
    id: "pastel-mint",
    name: "Pastel Mint",
    colors: {
      dark: "#2b3d35",
      accent: "#a8d5c0",
      primary: "#f3faf6",
      accentLight: "#c0e4d4",
      accentDark: "#88c0a6",
      primaryDark: "#e2f2ea",
    },
    fonts: {
      script: "'Tangerine', cursive",
      serif: "'Lora', Georgia, serif",
      sans: "'Nunito Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Nunito+Sans:wght@300;400;500;600&display=swap",
  },
  {
    id: "pastel-peach",
    name: "Pastel Peach",
    colors: {
      dark: "#4a3328",
      accent: "#f0c4a8",
      primary: "#fef8f3",
      accentLight: "#f5d6c2",
      accentDark: "#e0a888",
      primaryDark: "#f9eae0",
    },
    fonts: {
      script: "'Pinyon Script', cursive",
      serif: "'Playfair Display', Georgia, serif",
      sans: "'Raleway', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Raleway:wght@300;400;500;600&display=swap",
  },
  {
    id: "pastel-sky",
    name: "Pastel Sky",
    colors: {
      dark: "#2a3545",
      accent: "#a8c8e0",
      primary: "#f4f8fc",
      accentLight: "#c0d8ec",
      accentDark: "#88b0cc",
      primaryDark: "#e2edf6",
    },
    fonts: {
      script: "'Alex Brush', cursive",
      serif: "'Libre Baskerville', Georgia, serif",
      sans: "'Lato', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap",
  },
  {
    id: "earthy-savannah",
    name: "Earthy Savannah",
    colors: {
      dark: "#3d3124",
      accent: "#c49b66",
      primary: "#f7f2e8",
      accentLight: "#d9bc91",
      accentDark: "#a67c4d",
      primaryDark: "#ebe3d5",
    },
    fonts: {
      script: "'Great Vibes', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Josefin+Sans:wght@300;400;500;600&display=swap",
  },

  // ─── Luxury Palettes ───

  {
    id: "black-tie-gold",
    name: "Black Tie Gold",
    colors: {
      dark: "#1a1a1a",
      accent: "#c9a84c",
      primary: "#faf8f4",
      accentLight: "#dcc477",
      accentDark: "#a68a2e",
      primaryDark: "#f0ece4",
    },
    fonts: {
      script: "'Pinyon Script', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Josefin+Sans:wght@300;400;500;600&display=swap",
  },
  {
    id: "champagne-noir",
    name: "Champagne Noir",
    colors: {
      dark: "#0d0d0d",
      accent: "#d4af37",
      primary: "#f5f0e8",
      accentLight: "#e2c864",
      accentDark: "#b8941e",
      primaryDark: "#e8e0d2",
    },
    fonts: {
      script: "'Mrs Saint Delafield', cursive",
      serif: "'Libre Baskerville', Georgia, serif",
      sans: "'Raleway', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Raleway:wght@300;400;500;600&display=swap",
  },
  {
    id: "burgundy-gold",
    name: "Burgundy & Gold",
    colors: {
      dark: "#4a0e1a",
      accent: "#b8860b",
      primary: "#fdf8f5",
      accentLight: "#d4a830",
      accentDark: "#8c6508",
      primaryDark: "#f5ece6",
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
    id: "emerald-luxe",
    name: "Emerald Luxe",
    colors: {
      dark: "#0b3d2e",
      accent: "#d4af37",
      primary: "#f5f9f6",
      accentLight: "#e2c864",
      accentDark: "#b8941e",
      primaryDark: "#e4ede8",
    },
    fonts: {
      script: "'Great Vibes', cursive",
      serif: "'EB Garamond', Georgia, serif",
      sans: "'Inter', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
  },
  {
    id: "marble-onyx",
    name: "Marble & Onyx",
    colors: {
      dark: "#121212",
      accent: "#c0b283",
      primary: "#fafafa",
      accentLight: "#d4c9a0",
      accentDark: "#9e9060",
      primaryDark: "#eeeeee",
    },
    fonts: {
      script: "'Monsieur La Doulaise', cursive",
      serif: "'Tenor Sans', sans-serif",
      sans: "'Montserrat', sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&family=Tenor+Sans&family=Montserrat:wght@200;300;400&display=swap",
  },
  {
    id: "rose-champagne",
    name: "Rosé Champagne",
    colors: {
      dark: "#2e1a1a",
      accent: "#c4956a",
      primary: "#fdf6f2",
      accentLight: "#d8b48e",
      accentDark: "#a87548",
      primaryDark: "#f5e8e0",
    },
    fonts: {
      script: "'Dancing Script', cursive",
      serif: "'Cormorant Garamond', Georgia, serif",
      sans: "'Josefin Sans', system-ui, sans-serif",
    },
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Josefin+Sans:wght@300;400;500;600&display=swap",
  },
];

export function getTheme(templateId: string): Theme {
  return themes.find((t) => t.id === templateId) ?? themes[0];
}

export function getFontStyle(fontStyleId?: string): FontStyle {
  return fontStyles.find((f) => f.id === fontStyleId) ?? fontStyles[0];
}

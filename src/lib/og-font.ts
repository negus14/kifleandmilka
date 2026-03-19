import { readFile } from "fs/promises";
import { join } from "path";

let fontCache: ArrayBuffer | null = null;

export async function getOgFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const fontPath = join(process.cwd(), "src/lib/fonts/PlayfairDisplay-BoldItalic.ttf");
  const buffer = await readFile(fontPath);
  fontCache = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return fontCache;
}

export const ogFontConfig = {
  name: "Playfair Display",
  style: "italic" as const,
  weight: 700 as const,
};

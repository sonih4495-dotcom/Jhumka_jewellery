import fs from 'fs';
import path from 'path';
import { HeroBannerConfig, DEFAULT_HERO_BANNER } from '@/lib/banner-data';

export { type HeroBannerConfig, DEFAULT_HERO_BANNER } from '@/lib/banner-data';

const BANNER_FILE_PATH = path.join(process.cwd(), 'data', 'hero-banner.json');

export function getStoredHeroBanner(): HeroBannerConfig {
  try {
    if (!fs.existsSync(BANNER_FILE_PATH)) {
      const dir = path.dirname(BANNER_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(BANNER_FILE_PATH, JSON.stringify(DEFAULT_HERO_BANNER, null, 2), 'utf-8');
      return DEFAULT_HERO_BANNER;
    }
    const content = fs.readFileSync(BANNER_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      ...DEFAULT_HERO_BANNER,
      ...parsed,
    };
  } catch (err) {
    console.warn('Error reading hero-banner.json file:', err);
    return DEFAULT_HERO_BANNER;
  }
}

export function saveStoredHeroBanner(config: Partial<HeroBannerConfig>): HeroBannerConfig {
  try {
    const current = getStoredHeroBanner();
    const updated: HeroBannerConfig = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString(),
    };
    const dir = path.dirname(BANNER_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BANNER_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error writing hero-banner.json file:', err);
    throw err;
  }
}

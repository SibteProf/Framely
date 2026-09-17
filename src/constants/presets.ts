export type Preset = {
  id: string;
  label: string;
  platform: string;
  ratio: number; // width / height
  exportWidth: number;
  exportHeight: number;
};

export const PRESETS: Preset[] = [
  {
    id: 'ig-post',
    label: 'Feed Post',
    platform: 'Instagram',
    ratio: 1,
    exportWidth: 1080,
    exportHeight: 1080,
  },
  {
    id: 'ig-portrait',
    label: 'Portrait',
    platform: 'Instagram',
    ratio: 4 / 5,
    exportWidth: 1080,
    exportHeight: 1350,
  },
  {
    id: 'ig-story',
    label: 'Story / Reel',
    platform: 'Instagram',
    ratio: 9 / 16,
    exportWidth: 1080,
    exportHeight: 1920,
  },
  {
    id: 'tiktok',
    label: 'Video Cover',
    platform: 'TikTok',
    ratio: 9 / 16,
    exportWidth: 1080,
    exportHeight: 1920,
  },
  {
    id: 'x-post',
    label: 'Post Image',
    platform: 'X',
    ratio: 16 / 9,
    exportWidth: 1600,
    exportHeight: 900,
  },
  {
    id: 'yt-thumb',
    label: 'Thumbnail',
    platform: 'YouTube',
    ratio: 16 / 9,
    exportWidth: 1280,
    exportHeight: 720,
  },
  {
    id: 'fb-cover',
    label: 'Cover Photo',
    platform: 'Facebook',
    ratio: 205 / 78,
    exportWidth: 820,
    exportHeight: 312,
  },
  {
    id: 'li-post',
    label: 'Post Image',
    platform: 'LinkedIn',
    ratio: 1.91,
    exportWidth: 1200,
    exportHeight: 628,
  },
  {
    id: 'wa-profile',
    label: 'Profile Picture',
    platform: 'WhatsApp',
    ratio: 1,
    exportWidth: 640,
    exportHeight: 640,
  },
  {
    id: 'wa-status',
    label: 'Status',
    platform: 'WhatsApp',
    ratio: 9 / 16,
    exportWidth: 1080,
    exportHeight: 1920,
  },
];

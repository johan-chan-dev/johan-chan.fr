export const languages = { fr: 'Français', en: 'English' } as const;
export const defaultLang = 'fr';

export const ui = {
  fr: {
    'nav.about': 'À propos',
    'site.tagline': "Ce que je pense. Ce que j’apprends.",
  },
  en: {
    'nav.about': 'About',
  },
} as const;

export type Lang = keyof typeof ui;
export type UIKey = keyof (typeof ui)[typeof defaultLang];

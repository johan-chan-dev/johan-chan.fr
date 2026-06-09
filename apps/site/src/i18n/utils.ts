import { ui, defaultLang, type Lang, type UIKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg in ui) return seg as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}

/** Map the current URL's pathname to its equivalent under another locale (segments not localized). */
export function getSiblingLocalePath(url: URL, target: Lang): string {
  // strip a leading "/en" to get the canonical FR path
  const frPath = url.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  if (target === 'fr') return frPath;
  return frPath === '/' ? '/en/' : `/en${frPath}`;
}

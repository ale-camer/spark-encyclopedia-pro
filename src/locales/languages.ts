export type LanguageCode =
  | 'en'
  | 'es'
  | 'zh'
  | 'hi'
  | 'pt'
  | 'fr'
  | 'de'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'ar'
  | 'it'
  | 'tr'
  | 'nl'
  | 'pl'
  | 'vi'
  | 'id'
  | 'th'
  | 'uk'
  | 'sv';

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  spanishName: string;
  flag: string;
  region: string;
  speakers: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    spanishName: 'Inglés',
    flag: '🇺🇸',
    region: 'Global / US / UK',
    speakers: '1.5B',
    dir: 'ltr',
  },
  {
    code: 'es',
    nativeName: 'Español',
    englishName: 'Spanish',
    spanishName: 'Español',
    flag: '🇪🇸',
    region: 'LATAM / España',
    speakers: '560M',
    dir: 'ltr',
  },
  {
    code: 'zh',
    nativeName: '简体中文',
    englishName: 'Chinese (Simplified)',
    spanishName: 'Chino Simplificado',
    flag: '🇨🇳',
    region: 'China / Singapore',
    speakers: '1.14B',
    dir: 'ltr',
  },
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    spanishName: 'Hindi',
    flag: '🇮🇳',
    region: 'India',
    speakers: '610M',
    dir: 'ltr',
  },
  {
    code: 'pt',
    nativeName: 'Português',
    englishName: 'Portuguese',
    spanishName: 'Portugués',
    flag: '🇧🇷',
    region: 'Brasil / Portugal',
    speakers: '265M',
    dir: 'ltr',
  },
  {
    code: 'fr',
    nativeName: 'Français',
    englishName: 'French',
    spanishName: 'Francés',
    flag: '🇫🇷',
    region: 'France / Canada / Europe',
    speakers: '310M',
    dir: 'ltr',
  },
  {
    code: 'de',
    nativeName: 'Deutsch',
    englishName: 'German',
    spanishName: 'Alemán',
    flag: '🇩🇪',
    region: 'Deutschland / DACH',
    speakers: '135M',
    dir: 'ltr',
  },
  {
    code: 'ja',
    nativeName: '日本語',
    englishName: 'Japanese',
    spanishName: 'Japonés',
    flag: '🇯🇵',
    region: 'Japan',
    speakers: '125M',
    dir: 'ltr',
  },
  {
    code: 'ko',
    nativeName: '한국어',
    englishName: 'Korean',
    spanishName: 'Coreano',
    flag: '🇰🇷',
    region: 'South Korea',
    speakers: '82M',
    dir: 'ltr',
  },
  {
    code: 'ru',
    nativeName: 'Русский',
    englishName: 'Russian',
    spanishName: 'Ruso',
    flag: '🌐',
    region: 'Eastern Europe / Central Asia',
    speakers: '255M',
    dir: 'ltr',
  },
  {
    code: 'ar',
    nativeName: 'العربية',
    englishName: 'Arabic',
    spanishName: 'Árabe',
    flag: '🇸🇦',
    region: 'MENA',
    speakers: '370M',
    dir: 'rtl',
  },
  {
    code: 'it',
    nativeName: 'Italiano',
    englishName: 'Italian',
    spanishName: 'Italiano',
    flag: '🇮🇹',
    region: 'Italia / Svizzera',
    speakers: '68M',
    dir: 'ltr',
  },
  {
    code: 'tr',
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    spanishName: 'Turco',
    flag: '🇹🇷',
    region: 'Türkiye',
    speakers: '90M',
    dir: 'ltr',
  },
  {
    code: 'nl',
    nativeName: 'Nederlands',
    englishName: 'Dutch',
    spanishName: 'Neerlandés',
    flag: '🇳🇱',
    region: 'Nederland / België',
    speakers: '30M',
    dir: 'ltr',
  },
  {
    code: 'pl',
    nativeName: 'Polski',
    englishName: 'Polish',
    spanishName: 'Polaco',
    flag: '🇵🇱',
    region: 'Polska',
    speakers: '45M',
    dir: 'ltr',
  },
  {
    code: 'vi',
    nativeName: 'Tiếng Việt',
    englishName: 'Vietnamese',
    spanishName: 'Vietnamita',
    flag: '🇻🇳',
    region: 'Việt Nam',
    speakers: '86M',
    dir: 'ltr',
  },
  {
    code: 'id',
    nativeName: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    spanishName: 'Indonesio',
    flag: '🇮🇩',
    region: 'Indonesia',
    speakers: '200M',
    dir: 'ltr',
  },
  {
    code: 'th',
    nativeName: 'ไทย',
    englishName: 'Thai',
    spanishName: 'Tailandés',
    flag: '🇹🇭',
    region: 'Thailand',
    speakers: '70M',
    dir: 'ltr',
  },
  {
    code: 'uk',
    nativeName: 'Українська',
    englishName: 'Ukrainian',
    spanishName: 'Ucraniano',
    flag: '🇺🇦',
    region: 'Україна',
    speakers: '40M',
    dir: 'ltr',
  },
  {
    code: 'sv',
    nativeName: 'Svenska',
    englishName: 'Swedish',
    spanishName: 'Sueco',
    flag: '🇸🇪',
    region: 'Sverige / Norden',
    speakers: '13M',
    dir: 'ltr',
  },
];

export const LANGUAGE_MAP: Record<LanguageCode, LanguageMeta> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l])
) as Record<LanguageCode, LanguageMeta>;

export function isValidLanguageCode(code: string | null | undefined): code is LanguageCode {
  if (!code) return false;
  return Object.prototype.hasOwnProperty.call(LANGUAGE_MAP, code);
}

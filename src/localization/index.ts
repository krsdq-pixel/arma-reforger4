import { Language } from '../types/settings';
import { en, TranslationKeys } from './en';
import { ar } from './ar';

export const translations: Record<Language, TranslationKeys> = {
  en,
  ar,
};

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang] || en;
}

import { describe, it, expect } from 'vitest';
import { en } from '../localization/en';
import { ar } from '../localization/ar';

describe('Localization Integrity (Arabic and English)', () => {
  it('ensures Arabic dictionary has matching keys with English dictionary', () => {
    function compareKeys(obj1: Record<string, any>, obj2: Record<string, any>, path = '') {
      for (const key of Object.keys(obj1)) {
        const fullPath = path ? `${path}.${key}` : key;
        expect(obj2).toHaveProperty(key);
        if (typeof obj1[key] === 'object' && obj1[key] !== null) {
          compareKeys(obj1[key], obj2[key], fullPath);
        } else {
          expect(typeof obj2[key]).toBe('string');
          expect(obj2[key].length).toBeGreaterThan(0);
        }
      }
    }

    compareKeys(en, ar);
  });
});

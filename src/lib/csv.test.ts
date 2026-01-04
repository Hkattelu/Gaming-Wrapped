import { describe, expect, it } from '@jest/globals';

import { sanitizeCsvField } from '@/lib/csv';

const TAB = String.fromCharCode(9);
const NL = String.fromCharCode(10);

describe('sanitizeCsvField', () => {
  it('returns an empty quoted field for null and undefined', () => {
    expect(sanitizeCsvField(null)).toBe('""');
    expect(sanitizeCsvField(undefined)).toBe('""');
  });

  it('wraps values in quotes and escapes embedded quotes', () => {
    expect(sanitizeCsvField('a"b')).toBe('"a""b"');
  });

  it('prefixes a tab for formula triggers at the start of the value', () => {
    expect(sanitizeCsvField('=1+1')).toBe(`"${TAB}=1+1"`);
    expect(sanitizeCsvField('+1')).toBe(`"${TAB}+1"`);
    expect(sanitizeCsvField('-1')).toBe(`"${TAB}-1"`);
    expect(sanitizeCsvField('@SUM(1,2)')).toBe(`"${TAB}@SUM(1,2)"`);
  });

  it('prefixes a tab for formula triggers after leading whitespace/control characters', () => {
    expect(sanitizeCsvField('  =1+1')).toBe(`"${TAB}  =1+1"`);
    expect(sanitizeCsvField(`${NL}=1+1`)).toBe(`"${TAB}${NL}=1+1"`);
  });

  it('does not double-prefix values that are already tab-prefixed', () => {
    expect(sanitizeCsvField(`${TAB}=1+1`)).toBe(`"${TAB}=1+1"`);
  });

  it('does not prefix values that do not become formula triggers after trimming', () => {
    expect(sanitizeCsvField('  hello')).toBe('"  hello"');
  });
});

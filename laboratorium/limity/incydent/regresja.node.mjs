import test from 'node:test';
import assert from 'node:assert/strict';
import { limitWChwili } from './ocena-incydent.mjs';

test('chwile przed "do" nadal obowiazuje limit czasowy', () => {
  const limit = limitWChwili({
    limitBazowyGrosze: 10000,
    teraz: '2026-09-22T09:59:59.999Z',
    wniosek: {
      limitGrosze: 15000,
      od: '2026-09-22T08:00:00Z',
      do: '2026-09-22T10:00:00Z',
    },
  });

  assert.equal(limit, 15000);
});

test('dokladnie w chwili "do" obowiazuje limit bazowy', () => {
  const limit = limitWChwili({
    limitBazowyGrosze: 10000,
    teraz: '2026-09-22T10:00:00Z',
    wniosek: {
      limitGrosze: 15000,
      od: '2026-09-22T08:00:00Z',
      do: '2026-09-22T10:00:00Z',
    },
  });

  assert.equal(limit, 10000);
});

test('chwile po "do" obowiazuje limit bazowy', () => {
  const limit = limitWChwili({
    limitBazowyGrosze: 10000,
    teraz: '2026-09-22T10:00:00.001Z',
    wniosek: {
      limitGrosze: 15000,
      od: '2026-09-22T08:00:00Z',
      do: '2026-09-22T10:00:00Z',
    },
  });

  assert.equal(limit, 10000);
});
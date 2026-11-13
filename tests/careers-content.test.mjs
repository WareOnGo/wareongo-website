import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCareersContent } from '../scripts/lib/careers-content.mjs';

const sample = JSON.parse(fs.readFileSync(new URL('../src/data/careers.sample.json', import.meta.url)));
const approved = () => ({ ...structuredClone(sample), applicationEmail: 'hiring@example.com' });

test('widget copy survives build validation and older content remains compatible', () => {
  const keys = ['interestTitle', 'interestDescription', 'interestSubmitLabel', 'interestSuccessMessage'];
  const content = validateCareersContent(sample);
  const legacy = structuredClone(sample);
  for (const key of keys) {
    assert.equal(content[key], sample[key]); delete legacy[key];
    for (const value of [null, {}, '', 'x'.repeat(1001)]) assert.throws(() => validateCareersContent({ ...sample, [key]: value }), new RegExp(key));
  }
  assert.equal(validateCareersContent(legacy).roles.length, 1);
});

test('an unpublished page and an approved empty role list are valid', () => {
  assert.equal(validateCareersContent(null), null);
  assert.deepEqual(validateCareersContent({ ...sample, roles: [] }).roles, []);
});

test('build data keeps authored order, excludes closed roles and strips private fields', () => {
  const page = approved();
  page.roles.push({ ...page.roles[0], id: 'closed-role', isOpen: false }, { ...page.roles[0], id: 'another-role' });
  page.roles.reverse();
  page.roles[0].internalNote = 'Private hiring note';
  const result = validateCareersContent(page);
  assert.equal(result.roles[0].id, page.roles[0].id);
  assert.equal(result.roles.length, page.roles.length - 1);
  assert.ok(!result.roles.some(role => role.id === page.roles[1].id));
  assert.doesNotMatch(JSON.stringify(result), /Private hiring note/);
  assert.equal(result.roles[0].duration, page.roles[0].duration);
  assert.equal(result.roles[0].compensation, page.roles[0].compensation);
});

test('open roles without an application destination cannot be approved', () => {
  const page = structuredClone(sample);
  page.roles[0].applyUrl = '';
  assert.throws(() => validateCareersContent(page), /application destination/);
});

test('published roles accept HTTPS application URLs without a shared email', () => {
  const page = structuredClone(sample);
  page.roles.forEach(role => { role.applyUrl = `https://jobs.example.com/${role.id}`; });
  assert.equal(validateCareersContent(page).roles.length, page.roles.length);
});

test('optional chips support older CMS content and reject malformed values', () => {
  const page = approved();
  delete page.roles[0].duration;
  delete page.roles[0].compensation;
  assert.equal(validateCareersContent(page).roles[0].duration, '');
  assert.equal(validateCareersContent(page).roles[0].compensation, '');
  for (const key of ['duration', 'compensation']) {
    for (const value of [123, [], 'x'.repeat(101)]) {
      const invalid = approved(); invalid.roles[0][key] = value;
      assert.throws(() => validateCareersContent(invalid), new RegExp(key));
    }
  }
});

for (const url of ['javascript:alert(1)', 'http://jobs.example.com', 'https://user:secret@jobs.example.com', '//jobs.example.com']) {
  test(`rejects unsafe application destination: ${url}`, () => {
    const page = approved(); page.roles[0].applyUrl = url;
    assert.throws(() => validateCareersContent(page), /application URL/);
  });
}

test('malformed responses and duplicate IDs fail instead of erasing a snapshot', () => {
  for (const value of [undefined, {}, { ...approved(), roles: null }, { ...approved(), title: ' ' }]) assert.throws(() => validateCareersContent(value));
  const page = approved(); page.roles.push({ ...page.roles[0] });
  assert.throws(() => validateCareersContent(page), /IDs/);
});

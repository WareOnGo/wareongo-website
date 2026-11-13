/** Published CMS contract. Validate completely before replacing the snapshot. */
export function validateCareersContent(value) {
  if (value === null) return null;
  const fail = message => { throw new Error(`Invalid careers content: ${message}`); };
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.slug !== 'careers') fail('expected the careers page');
  const read = (object, key, max, optional = false) => {
    if (typeof object[key] !== 'string') fail(`${key} must be text`);
    const text = object[key].trim();
    if ((!optional && !text) || text.length > max) fail(`${key} has an invalid length`);
    return text;
  };
  const content = { slug: 'careers' };
  for (const [key, max] of Object.entries({ seoTitle: 300, description: 1000, title: 300, intro: 2000, cultureTitle: 300, cultureDescription: 2000 })) content[key] = read(value, key, max);
  for (const [key, max] of Object.entries({ interestTitle: 300, interestDescription: 1000, interestSubmitLabel: 100, interestSuccessMessage: 1000 })) {
    if (value[key] !== undefined) content[key] = read(value, key, max);
  }
  content.applicationEmail = read(value, 'applicationEmail', 254, true);
  if (content.applicationEmail && !/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(content.applicationEmail)) fail('invalid application email');
  if (!Array.isArray(value.roles) || value.roles.length > 100) fail('expected at most 100 roles');
  const ids = new Set();
  content.roles = value.roles.map(role => {
    if (!role || typeof role !== 'object' || Array.isArray(role) || typeof role.isOpen !== 'boolean') fail('invalid role');
    const result = {};
    for (const [key, max] of Object.entries({ id: 100, title: 200, department: 100, summary: 1000, location: 200, employmentType: 100 })) result[key] = read(role, key, max);
    for (const key of ['duration', 'compensation']) result[key] = role[key] === undefined ? '' : read(role, key, 100, true);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.id) || ids.has(result.id)) fail('role IDs must be unique lowercase slugs');
    ids.add(result.id);
    result.applyUrl = read(role, 'applyUrl', 2000, true);
    if (result.applyUrl) {
      let url;
      try { url = new URL(result.applyUrl); } catch { fail('invalid application URL'); }
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) fail('application URL must use HTTPS without credentials');
    }
    if (role.isOpen && !result.applyUrl && !content.applicationEmail) fail('open roles need an application destination');
    return { ...result, isOpen: role.isOpen };
  }).filter(role => role.isOpen);
  return content;
}

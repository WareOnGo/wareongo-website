// Loading screens use the hero and a state's introductory sections. Keep full
// guides, FAQs, SEO copy and statistics out of the shared startup bundle.
const heroFields = ['kind', 'slug', 'citySlug', 'h1', 'heroEyebrow', 'heroProse', 'heroImage', 'inventoryHeading'];
const stateFields = ['marketHeading', 'marketProse', 'marketImage', 'stateCities', 'citiesHeading'];

export function editorialSkeletonContent(page) {
  const fields = page.kind === 'STATE' ? [...heroFields, ...stateFields] : heroFields;
  return Object.fromEntries(fields.filter(key => page[key] !== undefined).map(key => [key, page[key]]));
}

export function skeletonModule(pages, type, name) {
  return `// AUTO-GENERATED alongside the approved editorial content. Loading-screen fields only.\nimport type { ${type} } from './locationSkeletonContent';\nexport const ${name}: ${type}[] = ${JSON.stringify(pages.map(editorialSkeletonContent), null, 2)};\n`;
}

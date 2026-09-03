/**
 * The company's headline figures, in one place.
 *
 * They were spread across six files and drifted, which is how this module came
 * to exist: the homepage strip promised an **8-hour** shortlist while every
 * other surface on the site promised 4, and the warehouse count still read
 * 1,500+ in five places after the real figure passed 2,500. Both were caught by
 * someone reading the site rather than by anything here, which is the wrong way
 * to find out.
 *
 * One caveat that cannot be fixed from here: `public/llms.txt` carries the same
 * figures and is served verbatim, so it cannot import this module. Update it in
 * the same commit as any change below — it is the file AI assistants read, so a
 * stale number there is quoted back at customers.
 */

/** Warehouses physically inspected and validated, cumulative. */
export const VERIFIED_WAREHOUSES = 2500;

/** Square feet leased through WareOnGo, cumulative, in millions. */
export const SQFT_TRANSACTED_M = 2.5;

export const CITIES_COVERED = 90;

export const COMPANIES_SERVED = 200;

/**
 * Hours to a curated shortlist.
 *
 * Canonical, and asserted as such: the FAQ, How It Works, the request CTA, every
 * location page's copy and llms.txt all quote this figure. It is the promise the
 * homepage strip contradicted.
 */
export const SHORTLIST_HOURS = 4;

/** "2,500+" — Indian digit grouping, matching how the figure reads in prose. */
export const verifiedWarehousesLabel = `${VERIFIED_WAREHOUSES.toLocaleString('en-IN')}+`;

/** "2.5M+" */
export const sqftTransactedLabel = `${SQFT_TRANSACTED_M}M+`;

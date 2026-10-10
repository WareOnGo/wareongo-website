import type { Options } from 'beasties';

export function createCriticalCssProcessor(options?: Options): (html: string) => Promise<string>;
export function prioritizeAdPageHtml(route: string, html: string): string;

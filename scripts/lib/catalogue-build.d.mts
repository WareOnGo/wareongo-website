import type { ViteReactSSGOptions } from 'vite-react-ssg';

export function createCatalogueBuild(options: {
  outDir?: string;
  processCss: (html: string) => Promise<string>;
}): Required<Pick<ViteReactSSGOptions, 'onPageRendered' | 'onFinished'>>;

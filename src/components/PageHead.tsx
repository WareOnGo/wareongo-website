import { Head } from 'vite-react-ssg';
import { SITE_URL } from '@/config/config';

interface PageHeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  /** OG type — defaults to "website". Use "article" for case studies / blog-style pages. */
  ogType?: 'website' | 'article';
  children?: React.ReactNode;
}

const PageHead = ({ title, description, path, image, noindex, ogType = 'website', children }: PageHeadProps) => {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? `${SITE_URL}/og-image.jpg`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {children}
    </Head>
  );
};

export default PageHead;

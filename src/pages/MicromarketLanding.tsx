import { useLoaderData } from 'react-router-dom';
import BangaloreLanding from './BangaloreLanding';
import { getBangaloreAdPage } from '@/data/adPages';
import { getMicromarketAdPage, micromarketAdContent, type MicromarketLandingData } from '@/data/micromarketAdPages';

export default function MicromarketLanding() {
  const data = useLoaderData() as MicromarketLandingData;
  const page = getMicromarketAdPage(data.slug, data.citySlug)!;
  return <BangaloreLanding key={page.slug} content={micromarketAdContent(getBangaloreAdPage(), page, data)} market={{ page, data }} />;
}

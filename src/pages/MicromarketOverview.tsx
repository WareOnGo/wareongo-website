import { useLoaderData } from 'react-router-dom';
import type { MicromarketPageData } from '@/loaders/locationLoader';
import MicromarketPage from './MicromarketPage';
import NotFound from './NotFound';

export default function MicromarketOverview() {
  const data = useLoaderData() as MicromarketPageData | null;
  return data ? <MicromarketPage data={data} /> : <NotFound />;
}

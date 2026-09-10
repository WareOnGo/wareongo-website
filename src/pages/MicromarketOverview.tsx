import { useLoaderData } from 'react-router-dom';
import type { MicromarketPageData } from '@/loaders/locationLoader';
import EditorialLocationPage from './EditorialLocationPage';
import NotFound from './NotFound';

export default function MicromarketOverview() {
  const data = useLoaderData() as MicromarketPageData | null;
  return data ? <EditorialLocationPage data={data} /> : <NotFound />;
}

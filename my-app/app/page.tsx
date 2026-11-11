import StoreExplorer from './components/store-explorer';

export default async function Home({ searchParams }: PageProps<'/'>) {
  const { zip } = await searchParams;
  const initialZip = typeof zip === 'string' && /^\d{5}$/.test(zip) ? zip : '11201';
  return <StoreExplorer key={initialZip} initialZip={initialZip} />;
}

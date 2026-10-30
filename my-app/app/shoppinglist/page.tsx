import Link from 'next/link';
import ShoppingListPanel from '../components/shopping-list-panel';

export default function ShoppingListPage() {
  return <main className="shopping-list-page"><Link href="/" className="back-to-map">← Back to map &amp; stores</Link><ShoppingListPanel /></main>;
}

import Link from 'next/link';
import ShoppingListPanel from '../components/shopping-list-panel';

export default function ShoppingListPage() {
  return <main id="main-content" className="shopping-list-page"><Link href="/" className="text-link">← Back to the shop</Link><ShoppingListPanel /></main>;
}

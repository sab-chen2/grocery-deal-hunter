import Link from 'next/link';

export default function Page() {
  return <main id="main-content" className="account-page"><p className="eyebrow">THE THINGS YOU COME BACK TO</p><h1>Your usuals,<br /><em>all together.</em></h1><p>Named lists and favorite stores are coming when accounts are connected. Your current shopping list is already saved in this browser.</p><Link className="button" href="/shoppinglist">Open my shopping list →</Link></main>;
}

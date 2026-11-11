import Link from 'next/link';

export default function Page() {
  return <main id="main-content" className="account-page"><p className="eyebrow">YOUR EVERYDAY SHOP</p><h1>Good to<br /><em>see you.</em></h1><p>Account sign-in is on its way. For now, your shopping list is saved in this browser, ready whenever you are.</p><Link className="button" href="/">Keep shopping as a guest →</Link><p className="fine-print">No account needed to build a list and compare demo prices.</p></main>;
}

import AuthForm from '../components/auth-form';

export const metadata = { title: 'Log in | Grocery Deal Hunter' };

export default function Page() {
  return <main id="main-content" className="auth-page"><section className="auth-heading"><p className="eyebrow">YOUR EVERYDAY SHOP</p><h1>Good to<br /><em>see you.</em></h1><p>A little planning goes a long way. Make your next grocery run a little easier.</p><p className="auth-caption">Good groceries. Better everyday choices.</p></section><AuthForm mode="login" /></main>;
}

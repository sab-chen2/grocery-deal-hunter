import AuthForm from '../components/auth-form';

export const metadata = { title: 'Sign up | Grocery Deal Hunter' };

export default function Page() {
  return <main id="main-content" className="auth-page"><section className="auth-heading"><p className="eyebrow">A BETTER WEEKLY ROUTINE</p><h1>Make yourself<br /><em>at home.</em></h1><p>Your everyday essentials, a little less guesswork, and more room in the grocery budget.</p><p className="auth-caption">Your next good shop starts here.</p></section><AuthForm mode="signup" /></main>;
}

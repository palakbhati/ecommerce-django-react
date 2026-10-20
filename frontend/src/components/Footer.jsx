import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">PalakCart</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Thoughtfully chosen everyday essentials, delivered to your door.
          </p>
        </div>
        <div>
          <p className="eyebrow">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-bronze">All products</Link></li>
            <li><Link to="/cart" className="hover:text-bronze">Your bag</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Account</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-bronze">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-bronze">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} PalakCart. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

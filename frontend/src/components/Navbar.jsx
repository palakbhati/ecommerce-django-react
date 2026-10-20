import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { clearTokens, getAccessToken } from '../utils/auth.js';
import { BagIcon, UserIcon } from './Icons.jsx';

const navLinkClass = ({ isActive }) =>
    `text-xs uppercase tracking-[0.18em] transition hover:text-ink ${isActive ? 'text-ink' : 'text-muted'}`;

function Navbar() {
    const { cartCount, clearCart } = useCart();
    const navigate = useNavigate();
    useLocation(); // re-render on route change so the login state stays current

    const isLoggedIn = !!getAccessToken();

    const handleLogout = () => {
        clearTokens();
        clearCart();
        navigate('/login');
    };

    return (
        <header className='sticky top-0 z-50'>
            <div className='bg-ink py-2 text-center text-[11px] uppercase tracking-[0.2em] text-cream/80'>
                Free shipping<span className='hidden sm:inline'> on every order · Cash on delivery available</span>
            </div>
            <nav className='border-b border-line bg-cream/90 backdrop-blur'>
                <div className='container-page grid h-16 grid-cols-3 items-center'>
                    <div className='hidden items-center gap-8 sm:flex'>
                        <NavLink to='/' end className={navLinkClass}>Shop</NavLink>
                        <NavLink to='/cart' className={navLinkClass}>Bag</NavLink>
                    </div>

                    <Link to='/' className='col-start-1 font-serif text-2xl tracking-wide sm:col-start-2 sm:text-center sm:text-3xl'>
                        PalakCart
                    </Link>

                    <div className='col-start-3 flex items-center justify-end gap-5'>
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className='text-xs uppercase tracking-[0.18em] text-muted transition hover:text-ink'>
                                Log out
                            </button>
                        ) : (
                            <Link to='/login' aria-label='Sign in' className='text-muted transition hover:text-ink'>
                                <UserIcon className='h-5 w-5' />
                            </Link>
                        )}
                        <Link to='/cart' aria-label={`Bag, ${cartCount} items`} className='relative text-ink'>
                            <BagIcon className='h-5 w-5' />
                            {cartCount > 0 && (
                                <span className='absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[10px] font-medium text-white'>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;

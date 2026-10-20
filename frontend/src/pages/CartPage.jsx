import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";
import { getAccessToken } from "../utils/auth";
import OrderSummary from "../components/OrderSummary";

function CartPage() {
    const { cartItems, total, removeFromCart, updateQuantity } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container-page py-32 text-center">
                <p className="eyebrow">Your bag</p>
                <h1 className="mt-4 text-5xl">Your bag is empty.</h1>
                <p className="mt-4 text-muted">
                    {getAccessToken() ? "Find something you love in the collection." : "Sign in to see items you've added."}
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Link to="/" className="btn-primary">Continue shopping</Link>
                    {!getAccessToken() && <Link to="/login" className="btn-outline">Sign in</Link>}
                </div>
            </div>
        );
    }

    return (
        <div className="container-page py-12">
            <h1 className="text-5xl">Your bag</h1>

            <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
                <ul className="divide-y divide-line border-y border-line">
                    {cartItems.map((item) => (
                        <li key={item.id} className="flex gap-5 py-6">
                            <Link to={`/product/${item.product}`} className="w-24 shrink-0 sm:w-32">
                                <div className="aspect-[4/5] bg-sand">
                                    {item.product_image && (
                                        <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                    )}
                                </div>
                            </Link>

                            <div className="flex flex-1 flex-col">
                                <div className="flex justify-between gap-4">
                                    <div>
                                        <Link to={`/product/${item.product}`} className="font-serif text-xl hover:text-bronze">
                                            {item.product_name}
                                        </Link>
                                        <p className="mt-1 text-sm text-muted">{formatPrice(item.product_price)}</p>
                                    </div>
                                    <p className="text-sm font-medium">{formatPrice(item.product_price * item.quantity)}</p>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-4">
                                    <div className="flex items-center border border-line">
                                        <button
                                            aria-label="Decrease quantity"
                                            className="px-3 py-1.5 text-muted transition hover:text-ink"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >−</button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <button
                                            aria-label="Increase quantity"
                                            className="px-3 py-1.5 text-muted transition hover:text-ink"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >+</button>
                                    </div>
                                    <button
                                        className="text-xs uppercase tracking-[0.15em] text-muted underline-offset-4 hover:text-ink hover:underline"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="lg:sticky lg:top-32 lg:self-start">
                    <OrderSummary total={total}>
                        <Link to="/checkout" className="btn-primary mt-8 w-full">Checkout</Link>
                        <Link to="/" className="link-underline mt-4 block text-center text-sm">Continue shopping</Link>
                    </OrderSummary>
                </div>
            </div>
        </div>
    );
}

export default CartPage;

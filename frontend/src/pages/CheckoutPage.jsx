import { useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../utils/auth";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { API_URL } from "../utils/api";
import OrderSummary from "../components/OrderSummary";
import { CheckIcon } from "../components/Icons";

const PAYMENT_OPTIONS = [
  { value: "COD", label: "Cash on delivery", hint: "Pay when your order arrives." },
  { value: "ONLINE", label: "Online payment", hint: "UPI, cards and net banking." },
];

function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    payment_method: "COD",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);

  const { cartItems, total, clearCart } = useCart();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await authFetch(`${API_URL}/api/orders/create/`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        setOrderId(data.order_id);
      } else {
        setError(data.error || "We couldn't place your order. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="container-page py-32 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream">
          <CheckIcon className="h-6 w-6" />
        </div>
        <h1 className="mt-8 text-5xl">Thank you, {form.name.split(" ")[0]}.</h1>
        <p className="mt-4 text-muted">Your order <span className="text-ink">#{orderId}</span> has been placed.</p>
        <p className="mt-1 text-muted">We'll deliver it to you in 3–5 business days.</p>
        <Link to="/" className="btn-primary mt-10">Continue shopping</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-page py-32 text-center">
        <h1 className="text-5xl">Your bag is empty.</h1>
        <Link to="/" className="btn-primary mt-10">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
          <fieldset className="space-y-4">
            <legend className="eyebrow mb-4">Delivery details</legend>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" autoComplete="name" required className="input" />
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full address with pincode" autoComplete="street-address" rows={3} required className="input resize-none" />
            <input name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={handleChange} placeholder="Phone number" autoComplete="tel" required className="input" />
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4">Payment</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer border bg-white p-5 transition ${form.payment_method === option.value ? "border-ink" : "border-line hover:border-stone-400"}`}
                >
                  <input type="radio" name="payment_method" value={option.value} checked={form.payment_method === option.value} onChange={handleChange} className="sr-only" />
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-1 block text-xs text-muted">{option.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        </form>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <OrderSummary total={total}>
            <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="text-muted">{item.product_name} × {item.quantity}</span>
                  <span>{formatPrice(item.product_price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <button form="checkout-form" disabled={submitting} className="btn-primary mt-8 w-full">
              {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
            </button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

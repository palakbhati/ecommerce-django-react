import { formatPrice } from "../utils/format";

// Subtotal / shipping / total box shared by the bag and checkout pages
function OrderSummary({ total, children }) {
  return (
    <div className="border border-line bg-white p-6 sm:p-8">
      <h2 className="text-2xl">Order summary</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}

export default OrderSummary;

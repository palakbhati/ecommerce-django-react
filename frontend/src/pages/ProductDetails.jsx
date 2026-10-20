import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { getAccessToken } from "../utils/auth";
import { API_URL } from "../utils/api";
import ProductCard from "../components/ProductCard";
import { CheckIcon, TruckIcon, ReturnIcon } from "../components/Icons";

function ProductDetails({ id }) {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | adding | added | failed
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch(`${API_URL}/api/products/${id}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status === 404 ? "This product doesn't exist." : "We couldn't load this product.");
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        // Load a few other products from the same category
        return fetch(`${API_URL}/api/products/`)
          .then((res) => (res.ok ? res.json() : []))
          .then((all) =>
            setRelated(all.filter((p) => p.id !== data.id && p.category?.id === data.category?.id).slice(0, 4))
          );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!getAccessToken()) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    setStatus("adding");
    const ok = await addToCart(product.id);
    setStatus(ok ? "added" : "failed");
    if (ok) setTimeout(() => setStatus("idle"), 2500);
  };

  if (loading) {
    return (
      <div className="container-page grid animate-pulse gap-12 py-12 lg:grid-cols-2">
        <div className="aspect-[4/5] bg-sand" />
        <div className="space-y-4 pt-8">
          <div className="h-3 w-24 bg-sand" />
          <div className="h-10 w-3/4 bg-sand" />
          <div className="h-5 w-32 bg-sand" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page py-32 text-center">
        <h1 className="text-4xl">{error || "Product not found"}</h1>
        <Link to="/" className="btn-outline mt-8">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/5] overflow-hidden bg-sand">
          {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-cover" />}
        </div>

        <div className="lg:pt-8">
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-xl">{formatPrice(product.price)}</p>
          <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

          <p className="mt-8 max-w-md leading-relaxed text-stone-600">{product.description}</p>

          <button onClick={handleAddToCart} disabled={status === "adding"} className="btn-primary mt-10 w-full sm:w-auto sm:min-w-64">
            {status === "adding" && "Adding…"}
            {status === "added" && <><CheckIcon className="mr-2 h-4 w-4" /> Added to bag</>}
            {(status === "idle" || status === "failed") && "Add to bag"}
          </button>
          {status === "added" && (
            <Link to="/cart" className="link-underline mt-4 block text-sm">View your bag</Link>
          )}
          {status === "failed" && (
            <p className="mt-4 text-sm text-red-700">Something went wrong. Please try again.</p>
          )}

          <div className="mt-12 space-y-4 border-t border-line pt-8 text-sm">
            <p className="flex items-center gap-3"><TruckIcon className="h-5 w-5 text-bronze" /> Free delivery in 3–5 business days</p>
            <p className="flex items-center gap-3"><ReturnIcon className="h-5 w-5 text-bronze" /> Free returns within 30 days</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// Remount the page for each product so loading/error/button state starts fresh
function ProductDetailsPage() {
  const { id } = useParams();
  return <ProductDetails key={id} id={id} />;
}

export default ProductDetailsPage;

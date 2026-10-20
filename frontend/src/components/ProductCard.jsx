import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-sand">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-4 space-y-1">
        {product.category && <p className="eyebrow">{product.category.name}</p>}
        <h3 className="font-serif text-xl leading-snug">{product.name}</h3>
        <p className="text-sm text-muted">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] bg-sand" />
    <div className="mt-4 h-3 w-1/3 bg-sand" />
    <div className="mt-2 h-5 w-2/3 bg-sand" />
    <div className="mt-2 h-3 w-1/4 bg-sand" />
  </div>
);

export default ProductCard;

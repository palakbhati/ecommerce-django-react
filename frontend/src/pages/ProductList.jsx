import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import { SearchIcon, TruckIcon, ReturnIcon, ShieldIcon } from "../components/Icons";
import { API_URL } from "../utils/api";

const SORTS = {
    featured: { label: "Featured", fn: () => 0 },
    newest: { label: "Newest", fn: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
    "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
    "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
};

const PROMISES = [
    { Icon: TruckIcon, title: "Free shipping", text: "On every order, no minimum." },
    { Icon: ReturnIcon, title: "Easy returns", text: "Changed your mind? 30 days to return." },
    { Icon: ShieldIcon, title: "Secure checkout", text: "Pay online or cash on delivery." },
];

function ProductList(){
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("featured");
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/products/`),
            fetch(`${API_URL}/api/categories/`),
        ])
        .then(async ([productRes, categoryRes]) => {
            if (!productRes.ok || !categoryRes.ok) {
                throw new Error("We couldn't load the collection. Please try again shortly.");
            }
            setProducts(await productRes.json());
            setCategories(await categoryRes.json());
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    const visibleProducts = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products
            .filter((p) => activeCategory === "all" || p.category?.slug === activeCategory)
            .filter((p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
            .sort(SORTS[sort].fn);
    }, [products, activeCategory, query, sort]);

    const selectCategory = (slug) => {
        setSearchParams(slug === "all" ? {} : { category: slug });
    };

    // One product per category so the hero shows a mix of colours
    const heroImages = Object.values(
        Object.fromEntries(products.filter((p) => p.image).reverse().map((p) => [p.category?.id, p]))
    ).slice(0, 4);

    return (
        <>
            {/* Hero */}
            <section className="border-b border-line">
                <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
                    <div>
                        <p className="eyebrow">The everyday collection</p>
                        <h1 className="mt-5 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
                            Essentials, <br /><em className="text-bronze">thoughtfully</em> chosen.
                        </h1>
                        <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
                            Considered pieces for home, work and everything in between —
                            selected for quality and made to be used every day.
                        </p>
                        <a href="#shop" className="btn-primary mt-10">Shop the collection</a>
                    </div>
                    {heroImages.length === 4 && (
                        <div className="hidden grid-cols-2 gap-4 lg:grid">
                            {heroImages.map((p, i) => (
                                <img
                                    key={p.id}
                                    src={p.image}
                                    alt=""
                                    className={`aspect-[4/5] w-full object-cover ${i % 2 === 1 ? "translate-y-10" : ""}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Store promises */}
            <section className="border-b border-line bg-sand/50">
                <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
                    {PROMISES.map(({ Icon, title, text }) => (
                        <div key={title} className="flex items-start gap-4">
                            <Icon className="mt-0.5 h-6 w-6 shrink-0 text-bronze" />
                            <div>
                                <p className="text-sm font-medium">{title}</p>
                                <p className="mt-1 text-sm text-muted">{text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Shop */}
            <section id="shop" className="container-page scroll-mt-28 pt-16">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="eyebrow">Shop</p>
                        <h2 className="mt-2 text-4xl">The collection</h2>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="relative">
                            <span className="sr-only">Search products</span>
                            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search"
                                className="input pl-10 sm:w-64"
                            />
                        </label>
                        <label>
                            <span className="sr-only">Sort products</span>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input sm:w-56">
                                {Object.entries(SORTS).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* Category tabs */}
                <div className="mt-8 flex gap-6 overflow-x-auto border-b border-line">
                    {[{ slug: "all", name: "All" }, ...categories].map((c) => (
                        <button
                            key={c.slug}
                            onClick={() => selectCategory(c.slug)}
                            className={`-mb-px shrink-0 border-b pb-3 text-xs uppercase tracking-[0.18em] transition ${
                                activeCategory === c.slug ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {error ? (
                    <p className="py-24 text-center text-muted">{error}</p>
                ) : (
                    <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                        {loading
                            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
                            : visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                )}

                {!loading && !error && visibleProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="font-serif text-2xl">Nothing matches your search.</p>
                        <button onClick={() => { setQuery(""); selectCategory("all"); }} className="link-underline mt-4 text-sm">
                            Clear filters
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}
export default ProductList;

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

// Format a price (number or decimal string from the API) as Indian Rupees, e.g. ₹2,499.00
export const formatPrice = (value) => inr.format(Number(value) || 0);

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveTokens } from "../utils/auth";
import { useCart } from "../context/CartContext";
import { API_URL } from "../utils/api";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data);
        await fetchCart();
        // Send the user back to the page that asked them to sign in
        nav(location.state?.from || "/", { replace: true });
      } else {
        setError(data.detail || "Incorrect username or password.");
      }
    } catch(err) {
      console.error(err);
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      footer={<>New to PalakCart? <Link to="/signup" className="link-underline text-ink">Create an account</Link></>}
    >
      {location.state?.justSignedUp && (
        <p className="mb-6 border border-line bg-white px-4 py-3 text-center text-sm">Your account is ready. Please sign in.</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" onChange={handleChange} value={form.username} placeholder="Username" autoComplete="username" required className="input"/>
        <input name="password" type="password" onChange={handleChange} value={form.password} placeholder="Password" autoComplete="current-password" required className="input"/>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="btn-primary w-full">{submitting ? "Signing in…" : "Sign in"}</button>
      </form>
    </AuthLayout>
  );
}

export default Login;

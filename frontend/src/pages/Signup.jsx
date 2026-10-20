import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";
import AuthLayout from "../components/AuthLayout";

// DRF returns errors as { field: ["message", ...] }; show the first one
const firstError = (data) => {
  const messages = Object.values(data).flat();
  return messages[0] || "We couldn't create your account. Please try again.";
};

function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(res.ok) {
        nav("/login", { state: { justSignedUp: true } });
      } else {
        setError(firstError(data));
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
      eyebrow="Join PalakCart"
      title="Create account"
      footer={<>Already have an account? <Link to="/login" className="link-underline text-ink">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" onChange={handleChange} value={form.username} placeholder="Username" autoComplete="username" required className="input"/>
        <input name="email" type="email" onChange={handleChange} value={form.email} placeholder="Email" autoComplete="email" className="input"/>
        <input name="password" type="password" onChange={handleChange} value={form.password} placeholder="Password" autoComplete="new-password" required className="input"/>
        <input name="password2" type="password" onChange={handleChange} value={form.password2} placeholder="Confirm password" autoComplete="new-password" required className="input"/>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="btn-primary w-full">{submitting ? "Creating account…" : "Create account"}</button>
      </form>
    </AuthLayout>
  );
}

export default Signup;

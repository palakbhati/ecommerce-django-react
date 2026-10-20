// Centered card used by the sign-in and sign-up pages
function AuthLayout({ eyebrow, title, children, footer }) {
  return (
    <div className="container-page flex justify-center py-20">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">{eyebrow}</p>
        <h1 className="mt-3 text-center text-5xl">{title}</h1>
        <div className="mt-10">{children}</div>
        <p className="mt-8 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}

export default AuthLayout;

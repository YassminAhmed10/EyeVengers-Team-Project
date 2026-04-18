import { Link, useLocation } from "react-router-dom";
import PageHero from "../components/PageHero";

const CONTENT = {
  "/login": {
    title: "Login",
    subtitle: "Welcome back to Aura Eyewear.",
    cta: "Sign In",
    altPath: "/register",
    altLabel: "Create a new account",
  },
  "/register": {
    title: "Create Account",
    subtitle: "Join Aura and save your wishlist and prescriptions.",
    cta: "Create Account",
    altPath: "/login",
    altLabel: "Already have an account? Login",
  },
  "/forgot-password": {
    title: "Forgot Password",
    subtitle: "Enter your email to receive reset instructions.",
    cta: "Send Reset Link",
    altPath: "/login",
    altLabel: "Back to login",
  },
};

export default function AuthPage() {
  const location = useLocation();
  const data = CONTENT[location.pathname] ?? CONTENT["/login"];

  return (
    <main className="main container">
      <PageHero eyebrow="Account Access" title={data.title} description={data.subtitle} />

      <section className="auth-box">
        <form onSubmit={(event) => event.preventDefault()}>
          {location.pathname === "/register" && <input type="text" placeholder="Full name" required />}
          <input type="email" placeholder="Email" required />
          {location.pathname !== "/forgot-password" && (
            <input type="password" placeholder="Password" required />
          )}
          <button className="btn-primary" type="submit">
            {data.cta}
          </button>
        </form>
        <Link className="auth-box__alt" to={data.altPath}>
          {data.altLabel}
        </Link>
      </section>
    </main>
  );
}

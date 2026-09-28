import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FormFooter from '../../components/FormFooter';
import FormHeader from '../../components/FormHeader';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        toast.error(data.message || "Invalid credentials!");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      console.log("TOKEN SAVED:", localStorage.getItem("token"));

      toast.success("Successfully logged in!");

      // Go to dashboard
      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error(error);

      toast.error("Unable to connect to server");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">

        <div className="auth-card">
          <FormHeader
            title="SafeChild"
            text="QR"
            heading="Welcome Back"
            detail="Login to manage your children's safety"
          />

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-field">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailRef}
              />
            </div>

            <div className="input-field">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="primary-btn">Login</button>
          </form>

          <div className="auth-footer">
            <FormFooter text="Don't have an account?" goto="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login

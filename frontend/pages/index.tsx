// pages/index.tsx  –  Login page
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import Head from "next/head";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) router.replace("/dashboard");
    });
    return unsub;
  }, [router]);

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Đăng nhập Google thất bại");
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    if (!email || !password) { setError("Vui lòng nhập đầy đủ thông tin"); return; }
    if (mode === "register" && password !== confirmPassword) { setError("Mật khẩu xác nhận không khớp"); return; }
    if (password.length < 6) { setError("Mật khẩu phải ít nhất 6 ký tự"); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      const code = err.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
        setError("Email hoặc mật khẩu không đúng");
      else if (code === "auth/email-already-in-use")
        setError("Email này đã được đăng ký");
      else if (code === "auth/invalid-email")
        setError("Email không hợp lệ");
      else
        setError("Đã có lỗi xảy ra, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m); setError(""); setEmail(""); setPassword(""); setConfirmPassword("");
  };

  return (
    <>
      <Head>
        <title>Galaxy Finance – {mode === "login" ? "Đăng nhập" : "Đăng ký"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="stars-bg" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-nebula-600/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-comet-400/5 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />

        <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <img src="/logo.gif" alt="logo" className="object-cover w-20 h-20" style={{ clipPath: "circle(50%)", objectFit: "cover" }} />
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-widest uppercase text-gradient">Galaxy Finance</h1>
              <p className="text-slate-400 text-sm mt-1 tracking-wide">Quản lý tài chính cá nhân</p>
            </div>
          </div>

          {/* Card */}
          <div className="glass-strong p-8 w-full flex flex-col gap-5" style={{ borderRadius: "32px" }}>
            {/* Tab switch */}
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["login","register"] as Mode[]).map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={mode === m ? { background: "rgba(139,92,246,0.4)", color: "#e2e8f0" } : { color: "#64748b" }}>
                  {m === "login" ? "Đăng nhập" : "Đăng ký"}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-center py-2 px-3 rounded-lg"
                style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.3)" }}>
                {error}
              </div>
            )}

            {/* Email/password form */}
            <div className="flex flex-col gap-3">
              <input
                className="input-galaxy"
                type="email"
                placeholder="Email *"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                className="input-galaxy"
                type="password"
                placeholder="Mật khẩu *"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {mode === "register" && (
                <input
                  className="input-galaxy"
                  type="password"
                  placeholder="Xác nhận mật khẩu *"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              )}
            </div>

            {/* Submit button */}
            <button onClick={handleEmailAuth} disabled={loading}
              className="btn-primary w-full justify-center py-3"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.2)" }} />
              <span className="text-xs text-slate-500">hoặc</span>
              <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.2)" }} />
            </div>

            {/* Google */}
            <button onClick={handleGoogle}
              className="flex items-center gap-3 w-full justify-center px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.95)", color: "#1a1050", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng nhập với Google
            </button>

            <p className="text-slate-500 text-xs text-center leading-relaxed">
              Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng của Galaxy Finance
            </p>
          </div>

          <div className="flex gap-2 opacity-40">s
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-star-400 text-xs animate-twinkle" style={{ animationDelay: `${i * 0.4}s` }}>✦</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
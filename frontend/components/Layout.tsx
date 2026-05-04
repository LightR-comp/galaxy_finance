// components/Layout.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Sidebar from "./sidebar";
import Head from "next/head";

export default function Layout({ children, title = "Galaxy Finance" }: { children: React.ReactNode; title?: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else { setUser(u); setLoading(false); }
    });
  }, [router]);

  if (loading) return (
    <div className="stars-bg min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 rounded-full border-2 border-nebula-500 border-t-transparent" />
    </div>
  );

  return (
    <>
      <Head>
        <title>{title} – Galaxy Finance</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="stars-bg" />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar user={user} />
        <main className="flex-1 ml-64 p-8 animate-fade-in">{children}</main>
      </div>
    </>
  );
}
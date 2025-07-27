"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/choose-language');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Image
          src="/logo-splash.svg"
          alt="ViewLingo logo"
          width={100}
          height={100}
          priority
        />
        <div
          style={{
            color: "#000",
            fontWeight: 500,
            fontSize: 50,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          ViewLingo
        </div>
        <p
          style={{
            color: "#7B7B7B",
            fontSize: 20,
            textAlign: "center",
            fontWeight: 400,
            marginBottom: 0,
          }}
        >
          See the world.<br/> Speak the language.
        </p>
      </div>
    </div>
  );
}

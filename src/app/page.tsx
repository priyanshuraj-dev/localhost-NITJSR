"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    const checkDB = async () => {
      try {
        const res = await fetch("/api/check-db");
        const data = await res.json();

        if (data.success) {
          setStatus("✅ MongoDB Connected");
        } else {
          setStatus("❌ Connection Failed");
        }
      } catch (error) {
        setStatus("❌ Error connecting to DB");
      }
    };

    checkDB();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Database Status</h1>
      <p>{status}</p>
    </div>
  );
}
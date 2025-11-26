"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get("code");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      return;
    }

    fetch(`/api/auth/verify-email?code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Email verified!") {
          setStatus("success");
          router.push("/auth/login");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [code, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && <p>Email verified! Redirecting to login...</p>}
      {status === "error" && <p>Invalid or expired verification code.</p>}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

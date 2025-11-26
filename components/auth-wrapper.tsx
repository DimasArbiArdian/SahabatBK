"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthWrapper({
  children,
  setIsAuthPage,
}: {
  children: React.ReactNode;
  setIsAuthPage: (isAuth: boolean) => void;
}) {
  //   const initialAuthState = useMemo(() => !!localStorage.getItem("token"), []);
  const pathname = usePathname() || "";
  const router = useRouter();
  const isAuthPage = pathname.startsWith("/auth");

  console.log(pathname);
  console.log("isAuthPage ", isAuthPage);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsAuthPage(isAuthPage); // Kirim status halaman auth ke layout

  });

  if (isAuthenticated || isAuthPage) {
    console.log("isAuthenticated || isAuthPage");

    return <>{children}</>;
  }

  if (isAuthenticated === false) {
    console.log("isAuthenticated === false");
    return <>{children}</>;
  }

  console.log("null");
  return null;
}

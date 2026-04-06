"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuth, getStoredUser, User, canManagePayments } from "@/lib/auth";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!user) return null;

  const roleBadgeColor = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-blue-100 text-blue-700",
    MEMBER: "bg-green-100 text-green-700",
  }[user.role] || "bg-gray-100 text-gray-700";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold text-orange-600">
              🍽 Slooze Food
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/restaurants"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith("/restaurants")
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                Restaurants
              </Link>
              <Link
                href="/orders"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith("/orders")
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                My Orders
              </Link>
              {canManagePayments(user.role) && (
                <Link
                  href="/payment-methods"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith("/payment-methods")
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-600"
                  }`}
                >
                  Payment Methods
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.name}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadgeColor}`}
            >
              {user.role}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hidden sm:block">
              {user.country === "INDIA" ? "🇮🇳" : "🇺🇸"} {user.country}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

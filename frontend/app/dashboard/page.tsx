"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { isAuthenticated, getStoredUser, User, canManagePayments, canCheckout } from "@/lib/auth";
import { MY_ORDERS_QUERY } from "@/lib/graphql/queries";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const { data: ordersData } = useQuery(MY_ORDERS_QUERY, { skip: !user });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const orders = (ordersData as any)?.myOrders || [];
  const recentOrders = orders.slice(0, 3);
  const pendingCount = orders.filter((o: any) => o.status === "PENDING").length;
  const completedCount = orders.filter((o: any) => o.status === "COMPLETED").length;

  const roleCapabilities = {
    ADMIN: ["View restaurants & menus", "Place orders", "Checkout & pay", "Cancel orders", "Manage payment methods"],
    MANAGER: ["View restaurants & menus", "Place orders", "Checkout & pay", "Cancel orders"],
    MEMBER: ["View restaurants & menus", "Place orders"],
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user.country === "INDIA" ? "🇮🇳" : "🇺🇸"} {user.country} •{" "}
          <span className="font-medium">{user.role}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/restaurants"
                className="flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
              >
                <span className="text-xl">🍴</span>
                <span className="font-medium text-sm">Browse Restaurants</span>
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <span className="text-xl">📋</span>
                <span className="font-medium text-sm">View My Orders</span>
              </Link>
              {canManagePayments(user.role) && (
                <Link
                  href="/payment-methods"
                  className="flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                >
                  <span className="text-xl">💳</span>
                  <span className="font-medium text-sm">Payment Methods</span>
                </Link>
              )}
            </div>
          </div>

          {/* Role capabilities */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Your Permissions</h2>
            <ul className="space-y-2">
              {(roleCapabilities[user.role] || []).map((cap) => (
                <li key={cap} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/orders" className="text-sm text-orange-600 hover:underline">
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-4xl mb-3">🛒</p>
                <p className="text-gray-500">No orders yet</p>
                <Link
                  href="/restaurants"
                  className="inline-block mt-3 text-sm text-orange-600 font-medium hover:underline"
                >
                  Browse restaurants to place your first order
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {order.restaurant.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.items.length} item(s) •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        {order.restaurant.country === "INDIA"
                          ? `₹${order.total}`
                          : `$${order.total.toFixed(2)}`}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

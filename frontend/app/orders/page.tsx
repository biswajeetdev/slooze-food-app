"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { isAuthenticated, getStoredUser, User, canCheckout, canCancelOrder } from "@/lib/auth";
import {
  MY_ORDERS_QUERY,
  ALL_ORDERS_QUERY,
  CANCEL_ORDER_MUTATION,
  CHECKOUT_ORDER_MUTATION,
  MY_PAYMENT_METHODS_QUERY,
} from "@/lib/graphql/queries";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  const isAdmin = user?.role === "ADMIN";

  const myOrdersQuery = useQuery(MY_ORDERS_QUERY, { skip: !user });
  const allOrdersQuery = useQuery(ALL_ORDERS_QUERY, { skip: !user || !isAdmin });
  const pmQuery = useQuery(MY_PAYMENT_METHODS_QUERY, {
    skip: !user || !canCheckout(user?.role || ""),
  });

  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER_MUTATION, {
    refetchQueries: [{ query: MY_ORDERS_QUERY }],
    onError: (err) => alert(err.message),
  });

  const [checkoutOrder, { loading: checkinOut }] = useMutation(CHECKOUT_ORDER_MUTATION, {
    refetchQueries: [{ query: MY_ORDERS_QUERY }],
    onCompleted: () => {
      setCheckoutOrderId(null);
      setPaymentMethodId("");
    },
    onError: (err) => alert(err.message),
  });

  if (!user) return null;

  const showingAll = isAdmin && viewAll;
  const orders = showingAll
    ? (allOrdersQuery.data as any)?.orders || []
    : (myOrdersQuery.data as any)?.myOrders || [];
  const loading = showingAll ? allOrdersQuery.loading : myOrdersQuery.loading;
  const paymentMethods = (pmQuery.data as any)?.myPaymentMethods || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {showingAll ? "All orders (Admin view)" : "Your orders"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setViewAll(!viewAll)}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
              viewAll
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
            }`}
          >
            {viewAll ? "My Orders" : "All Orders (Admin)"}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">No orders found</p>
          <button
            onClick={() => router.push("/restaurants")}
            className="mt-4 text-sm text-orange-600 font-medium hover:underline"
          >
            Browse restaurants to place an order
          </button>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order: any) => {
          const currency = order.restaurant.country === "INDIA" ? "₹" : "$";
          const isCheckingOut = checkoutOrderId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{order.restaurant.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[order.status] || "bg-gray-100"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  {showingAll && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Customer: {order.user?.name} ({order.user?.email})
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()} •{" "}
                    {order.restaurant.country === "INDIA" ? "🇮🇳 India" : "🇺🇸 America"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">
                    {currency}
                    {typeof order.total === "number"
                      ? order.total.toFixed(2)
                      : order.total}
                  </span>
                  {order.status === "PENDING" && canCancelOrder(user.role) && (
                    <button
                      onClick={() =>
                        cancelOrder({ variables: { orderId: order.id } })
                      }
                      disabled={cancelling}
                      className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === "PENDING" && canCheckout(user.role) && (
                    <button
                      onClick={() =>
                        setCheckoutOrderId(isCheckingOut ? null : order.id)
                      }
                      className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition-colors"
                    >
                      {isCheckingOut ? "Cancel" : "Checkout"}
                    </button>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-xs text-gray-600">
                    {item.menuItem.name} × {item.quantity}{" "}
                    <span className="text-gray-400">
                      ({currency}
                      {(item.price * item.quantity).toFixed(2)})
                    </span>
                  </div>
                ))}
              </div>

              {order.paymentMethod && (
                <div className="mt-2 text-xs text-gray-400">
                  Paid via: {order.paymentMethod.label}
                  {order.paymentMethod.last4 &&
                    ` ••••${order.paymentMethod.last4}`}
                </div>
              )}

              {/* Checkout panel */}
              {isCheckingOut && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Select Payment Method
                  </p>
                  {paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No payment methods available.{" "}
                      <a
                        href="/payment-methods"
                        className="text-orange-600 hover:underline"
                      >
                        Add one
                      </a>{" "}
                      (Admin only).
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={paymentMethodId}
                        onChange={(e) => setPaymentMethodId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="">— Select payment method —</option>
                        {paymentMethods.map((pm: any) => (
                          <option key={pm.id} value={pm.id}>
                            {pm.label}
                            {pm.last4 ? ` ••••${pm.last4}` : ""}
                            {pm.isDefault ? " (default)" : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          checkoutOrder({
                            variables: {
                              input: {
                                orderId: order.id,
                                paymentMethodId,
                              },
                            },
                          })
                        }
                        disabled={!paymentMethodId || checkinOut}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                      >
                        {checkinOut ? "Processing..." : "Pay Now"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

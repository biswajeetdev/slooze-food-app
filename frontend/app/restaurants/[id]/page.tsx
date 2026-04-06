"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { isAuthenticated, getStoredUser, User } from "@/lib/auth";
import { RESTAURANT_QUERY, CREATE_ORDER_MUTATION, MY_ORDERS_QUERY } from "@/lib/graphql/queries";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data, loading, error } = useQuery(RESTAURANT_QUERY, {
    variables: { id },
    skip: !user || !id,
  });

  const [createOrder, { loading: ordering }] = useMutation(CREATE_ORDER_MUTATION, {
    refetchQueries: [{ query: MY_ORDERS_QUERY }],
    onCompleted: () => {
      setCart([]);
      setSuccessMsg("Order placed successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => alert(err.message),
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  const restaurant = (data as any)?.restaurant;
  const menuItems = restaurant?.menuItems || [];
  const categories = ["All", ...Array.from(new Set(menuItems.map((i: any) => i.category))) as string[]];
  const filtered = activeCategory === "All" ? menuItems : menuItems.filter((i: any) => i.category === activeCategory);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.menuItemId === item.id);
      if (exists) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const item = prev.find((c) => c.menuItemId === menuItemId);
      if (!item) return prev;
      if (item.quantity <= 1) return prev.filter((c) => c.menuItemId !== menuItemId);
      return prev.map((c) =>
        c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currency = restaurant?.country === "INDIA" ? "₹" : "$";

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    createOrder({
      variables: {
        input: {
          restaurantId: id,
          items: cart.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
        },
      },
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error?.message || "Restaurant not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-50 relative overflow-hidden">
          {restaurant.imageUrl && (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-gray-500 mt-1">{restaurant.cuisine}</p>
              <p className="text-sm text-gray-400 mt-0.5">{restaurant.address}</p>
            </div>
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {restaurant.country === "INDIA" ? "🇮🇳 India" : "🇺🇸 America"}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
          ✓ {successMsg}{" "}
          <button onClick={() => router.push("/orders")} className="underline ml-1">
            View orders
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-orange-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((item: any) => {
              const cartItem = cart.find((c) => c.menuItemId === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <span className="font-semibold text-gray-900 ml-4">
                        {currency}{item.price}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cartItem ? (
                      <>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-lg flex items-center justify-center hover:bg-orange-200"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-medium text-sm">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-lg flex items-center justify-center hover:bg-orange-700"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">
              Your Order {cartCount > 0 && `(${cartCount})`}
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                Add items to get started
              </p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {currency}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{currency}{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={ordering}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {ordering ? "Placing order..." : "Place Order"}
                </button>
                <button
                  onClick={() => setCart([])}
                  className="w-full text-sm text-gray-400 hover:text-red-500 mt-2 py-1"
                >
                  Clear cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { isAuthenticated, getStoredUser, User } from "@/lib/auth";
import { RESTAURANTS_QUERY } from "@/lib/graphql/queries";

export default function RestaurantsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const { data, loading, error } = useQuery(RESTAURANTS_QUERY, { skip: !user });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  const restaurants = ((data as any)?.restaurants || []).filter((r: any) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing restaurants in your region:{" "}
            <span className="font-medium">
              {user.country === "INDIA" ? "🇮🇳 India" : "🇺🇸 America"}
            </span>
            {user.role === "ADMIN" && " (Admin: viewing all)"}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant: any) => (
          <Link href={`/restaurants/${restaurant.id}`} key={restaurant.id}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-50 relative overflow-hidden">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl">🍴</div>
                )}
                <span className="absolute top-3 right-3 text-xs font-semibold bg-white/90 text-gray-700 px-2 py-1 rounded-full">
                  {restaurant.country === "INDIA" ? "🇮🇳" : "🇺🇸"} {restaurant.country}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{restaurant.address}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {restaurant.menuItems?.length || 0} items
                  </span>
                  <span className="text-xs font-medium text-orange-600 group-hover:underline">
                    View menu →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && restaurants.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">No restaurants found</p>
        </div>
      )}
    </div>
  );
}

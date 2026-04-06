"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  isAuthenticated,
  getStoredUser,
  User,
  canManagePayments,
} from "@/lib/auth";
import {
  MY_PAYMENT_METHODS_QUERY,
  CREATE_PAYMENT_METHOD_MUTATION,
  UPDATE_PAYMENT_METHOD_MUTATION,
  DELETE_PAYMENT_METHOD_MUTATION,
} from "@/lib/graphql/queries";

const typeIcons: Record<string, string> = {
  CARD: "💳",
  UPI: "📱",
  BANK_TRANSFER: "🏦",
};

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "CARD",
    label: "",
    last4: "",
    isDefault: false,
  });
  const [editForm, setEditForm] = useState({ label: "", isDefault: false });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const u = getStoredUser();
    setUser(u);
    if (u && !canManagePayments(u.role)) {
      router.replace("/dashboard");
    }
  }, [router]);

  const { data, loading, refetch } = useQuery(MY_PAYMENT_METHODS_QUERY, {
    skip: !user,
  });

  const [createPM, { loading: creating }] = useMutation(
    CREATE_PAYMENT_METHOD_MUTATION,
    {
      refetchQueries: [{ query: MY_PAYMENT_METHODS_QUERY }],
      onCompleted: () => {
        setShowForm(false);
        setForm({ type: "CARD", label: "", last4: "", isDefault: false });
      },
      onError: (err) => alert(err.message),
    }
  );

  const [updatePM, { loading: updating }] = useMutation(
    UPDATE_PAYMENT_METHOD_MUTATION,
    {
      refetchQueries: [{ query: MY_PAYMENT_METHODS_QUERY }],
      onCompleted: () => setEditId(null),
      onError: (err) => alert(err.message),
    }
  );

  const [deletePM, { loading: deleting }] = useMutation(
    DELETE_PAYMENT_METHOD_MUTATION,
    {
      refetchQueries: [{ query: MY_PAYMENT_METHODS_QUERY }],
      onError: (err) => alert(err.message),
    }
  );

  if (!user) return null;

  const paymentMethods = (data as any)?.myPaymentMethods || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-sm text-gray-500 mt-1">Admin-only: Manage payment options</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "+ Add New"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Add Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., HDFC Credit Card"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {form.type === "CARD" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 digits
                </label>
                <input
                  value={form.last4}
                  onChange={(e) => setForm({ ...form, last4: e.target.value })}
                  maxLength={4}
                  placeholder="4242"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            )}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 accent-orange-600"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default
              </label>
            </div>
          </div>
          <button
            onClick={() =>
              createPM({
                variables: {
                  input: {
                    type: form.type,
                    label: form.label,
                    last4: form.last4 || null,
                    isDefault: form.isDefault,
                  },
                },
              })
            }
            disabled={creating || !form.label}
            className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {creating ? "Adding..." : "Add Payment Method"}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      {paymentMethods.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-gray-500">No payment methods added yet</p>
        </div>
      )}

      <div className="space-y-3">
        {paymentMethods.map((pm: any) => (
          <div key={pm.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{typeIcons[pm.type] || "💰"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{pm.label}</span>
                    {pm.isDefault && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  {pm.last4 && (
                    <p className="text-sm text-gray-500 mt-0.5">••••{pm.last4}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 font-mono select-all">{pm.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditId(pm.id);
                    setEditForm({ label: pm.label, isDefault: pm.isDefault });
                  }}
                  className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this payment method?")) {
                      deletePM({ variables: { id: pm.id } });
                    }
                  }}
                  disabled={deleting}
                  className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {editId === pm.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 flex-wrap">
                <input
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 min-w-0"
                  placeholder="Label"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.isDefault}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isDefault: e.target.checked })
                    }
                    className="w-4 h-4 accent-orange-600"
                  />
                  Default
                </label>
                <button
                  onClick={() =>
                    updatePM({
                      variables: {
                        input: { id: pm.id, label: editForm.label, isDefault: editForm.isDefault },
                      },
                    })
                  }
                  disabled={updating}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm rounded-lg transition-colors"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

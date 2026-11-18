"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import ItemCard from "../../components/ItemCard";
import { api } from "../../lib/api";

export default function MyItemsPage() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [activeTab, setActiveTab] = useState("lost");
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    try {
      const [lost, found] = await Promise.all([
        api.getMyLostItems(),
        api.getMyFoundItems(),
      ]);

      setLostItems(lost.items || []);
      setFoundItems(found.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadItems, 0);
    return () => clearTimeout(timer);
  }, []);

  async function deleteLost(id) {
    if (!confirm("Delete this lost item?")) {
      return;
    }

    try {
      await api.deleteLostItem(id);
      await loadItems();
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteFound(id) {
    if (!confirm("Delete this found item?")) {
      return;
    }

    try {
      await api.deleteFoundItem(id);
      await loadItems();
    } catch (error) {
      alert(error.message);
    }
  }

  async function updateItemLifecycle(type, id, action) {
    const actionLabel = action === "close" ? "close" : "reopen";
    if (!confirm(`Are you sure you want to ${actionLabel} this report?`)) return;

    try {
      if (type === "lost") {
        await (action === "close" ? api.closeLostItem(id) : api.reopenLostItem(id));
      } else {
        await (action === "close" ? api.closeFoundItem(id) : api.reopenFoundItem(id));
      }
      await loadItems();
    } catch (error) {
      alert(error.message);
    }
  }

  const allItems = [
    ...lostItems.map((item) => ({ ...item, itemType: "lost" })),
    ...foundItems.map((item) => ({ ...item, itemType: "found" })),
  ];
  const itemsByTab = {
    lost: allItems.filter((item) => item.itemType === "lost" && item.status === "lost"),
    found: allItems.filter((item) => item.itemType === "found" && ["found", "claimed"].includes(item.status)),
    returned: allItems.filter((item) => item.status === "returned"),
    closed: allItems.filter((item) => item.status === "closed"),
    archived: allItems.filter((item) => item.status === "archived"),
  };
  const items = itemsByTab[activeTab] || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="lg:ml-64">
          <Navbar />

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">
                My Items
              </h1>

              <p className="text-slate-500 mt-2">
                Manage the items you have reported.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 bg-white border border-slate-200 p-1 rounded-xl w-fit mb-6">
              <button
                onClick={() => setActiveTab("lost")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                  activeTab === "lost"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600"
                }`}
              >
                Lost ({itemsByTab.lost.length})
              </button>

              <button
                onClick={() => setActiveTab("found")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                  activeTab === "found"
                    ? "bg-green-600 text-white"
                    : "text-slate-600"
                }`}
              >
                Found ({itemsByTab.found.length})
              </button>

              <button
                onClick={() => setActiveTab("returned")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${activeTab === "returned" ? "bg-emerald-700 text-white" : "text-slate-600"}`}
              >
                Returned ({[...lostItems, ...foundItems].filter((item) => item.status === "returned").length})
              </button>

              <button
                onClick={() => setActiveTab("closed")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${activeTab === "closed" ? "bg-slate-700 text-white" : "text-slate-600"}`}
              >
                Closed ({itemsByTab.closed.length})
              </button>

              <button
                onClick={() => setActiveTab("archived")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${activeTab === "archived" ? "bg-amber-600 text-white" : "text-slate-600"}`}
              >
                Archived ({itemsByTab.archived.length})
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                Loading items...
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">
                  {activeTab === "lost"
                    ? "🔍"
                    : "📦"}
                </div>

                <h3 className="font-bold">
                  No {activeTab} items
                </h3>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((item) => (
                  <ItemCard
                    key={`${item.itemType}-${item.id}`}
                    item={item}
                    type={item.itemType}
                    onDelete={item.itemType === "lost" ? deleteLost : deleteFound}
                    onClose={() => updateItemLifecycle(item.itemType, item.id, "close")}
                    onReopen={() => updateItemLifecycle(item.itemType, item.id, "reopen")}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

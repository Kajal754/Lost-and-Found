"use client";

import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import LostItemForm from "../../components/LostItemForm";

export default function LostItemPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="lg:ml-64">
          <Navbar />

          <main className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Report Lost Item
              </h1>

              <p className="text-slate-500 mt-2">
                Provide as much detail as possible to help us find it.
              </p>
            </div>

            <LostItemForm
              onSuccess={(result) => {
                if (result?.warning) {
                  window.alert(result.warning);
                }
                if (result?.possibleDuplicates?.length) {
                  window.alert(`We found ${result.possibleDuplicates.length} similar lost report(s). Please review your items and matches.`);
                }
                router.push(result?.matches?.length ? "/matches" : "/my-items");
              }}
            />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

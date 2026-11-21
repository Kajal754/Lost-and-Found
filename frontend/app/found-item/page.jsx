"use client";

import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import FoundItemForm from "../../components/FoundItemForm";

export default function FoundItemPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div
        className="
          min-h-screen
          bg-[#edf8fc]
          dark:bg-slate-950
          transition-colors
        "
      >
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN AREA */}
        <div className="lg:ml-64">
          <Navbar />

          <main
            className="
              p-3
              sm:p-4
              lg:p-6
              max-w-[1100px]
            "
          >
            {/* =====================================================
                SIMPLE PAGE HEADING
                EXACTLY LIKE LOST ITEM PAGE
            ===================================================== */}

            <div className="mb-8 px-1">
              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-[32px]
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Report Found Item
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  sm:text-base
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Provide as much detail as possible to help us find its owner.
              </p>
            </div>

            {/* =====================================================
                FOUND FORM
                FORM + MAP WILL COME FROM FoundItemForm
            ===================================================== */}

            <div className="w-full">
              <FoundItemForm
                onSuccess={(result) => {
                  if (result?.warning) {
                    window.alert(result.warning);
                  }
                  if (result?.possibleDuplicates?.length) {
                    window.alert(`We found ${result.possibleDuplicates.length} similar found report(s). Please review your items and matches.`);
                  }
                  router.push(result?.matches?.length ? "/matches" : "/my-items");
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

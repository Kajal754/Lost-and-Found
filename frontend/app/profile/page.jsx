
"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";
import { saveUser } from "../../lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      setUploading(true);
      setError("");

      try {
        const data = await api.updateProfileImage(reader.result);
        setUser(data.user);
        saveUser(data.user);
      } catch (err) {
        setError(err.message || "Could not upload photo.");
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setError("Could not read the selected image.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  }

  async function removePhoto() {
    setUploading(true);
    setError("");

    try {
      const data = await api.updateProfileImage(null);
      setUser(data.user);
      saveUser(data.user);
    } catch (err) {
      setError(err.message || "Could not remove photo.");
    } finally {
      setUploading(false);
    }
  }

  async function updateNotificationPreference(name, value) {
    if (!user || savingPreferences) return;

    setSavingPreferences(true);
    setError("");

    try {
      const preferences = {
        emailNotifications: user.emailNotifications,
        messageEmailNotifications: user.messageEmailNotifications,
        [name]: value,
      };

      const data = await api.updateNotificationPreferences(preferences);
      setUser(data.user);
      saveUser(data.user);
    } catch (err) {
      setError(
        err.message || "Could not update notification preferences."
      );
    } finally {
      setSavingPreferences(false);
    }
  }

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f8f6]">
        <Sidebar />

        <div className="lg:ml-64">
          <Navbar />

          <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-9">

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Account settings
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Your personal space to manage your account and preferences.
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                Loading your profile...
              </div>
            ) : user ? (
              <div className="space-y-6">

                {/* Profile Banner */}
                <section className="relative overflow-hidden rounded-3xl bg-[#153d30] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-9">

                  <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                  <div className="pointer-events-none absolute -right-4 -top-12 h-52 w-52 rounded-full border border-white/10" />

                  <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">

                    {/* Avatar */}
                    <div className="relative h-28 w-28 shrink-0">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-emerald-100 text-3xl font-bold text-emerald-900 shadow-lg">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        aria-label="Change profile photo"
                        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#153d30] bg-white text-emerald-900 shadow-md transition hover:bg-emerald-50 disabled:opacity-50"
                      >
                        {uploading ? "..." : "✎"}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>

                    {/* User Details */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                          Community Member
                        </span>

                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold text-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                          Active Account
                        </span>
                      </div>

                      <h2 className="break-words text-2xl font-bold sm:text-3xl">
                        {user.name}
                      </h2>

                      <p className="mt-2 break-all text-sm text-emerald-100/75">
                        {user.email}
                      </p>

                      <p className="mt-4 text-xs text-emerald-100/60">
                        Member since {memberSince}
                      </p>
                    </div>

                    {/* Photo Actions */}
                    <div className="flex flex-wrap gap-2 sm:flex-col">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-50 disabled:opacity-50"
                      >
                        {uploading ? "Uploading..." : "Change Photo"}
                      </button>

                      {user.profileImage && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          disabled={uploading}
                          className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative mt-8 border-t border-white/15 pt-5">
                    <p className="text-xs leading-6 text-emerald-100/70">
                      Your identity matters. Keep your profile updated
                      and stay connected with the Lost & Found community.
                    </p>
                  </div>
                </section>

                {/* Error Message */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* Personal Information */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">

                  <div className="mb-7 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                        Personal details
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        Account Information
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Your registered account details.
                      </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-800">
                      ♙
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoCard
                      icon="✦"
                      label="Full Name"
                      value={user.name}
                    />

                    <InfoCard
                      icon="✉"
                      label="Email Address"
                      value={user.email}
                    />

                    <InfoCard
                      icon="▦"
                      label="Member Since"
                      value={memberSince}
                    />

                    <InfoCard
                      icon="♙"
                      label="Account Type"
                      value="Community Member"
                    />
                  </div>
                </section>

                {/* Notification Preferences */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">

                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-800">
                      ♧
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                        Stay connected
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        Notification Preferences
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Control which updates you receive by email.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">

                    <PreferenceRow
                      title="Email Notifications"
                      description="Claims, matching items and successful returns."
                      checked={Boolean(user.emailNotifications)}
                      disabled={savingPreferences}
                      onChange={(value) =>
                        updateNotificationPreference(
                          "emailNotifications",
                          value
                        )
                      }
                    />

                    <PreferenceRow
                      title="New Message Alerts"
                      description="Receive an email when someone sends you a message."
                      checked={Boolean(user.messageEmailNotifications)}
                      disabled={savingPreferences}
                      onChange={(value) =>
                        updateNotificationPreference(
                          "messageEmailNotifications",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 p-4">
                    <p className="text-xs leading-5 text-emerald-900">
                      <strong>Always enabled:</strong> Important in-app
                      notifications remain active.
                    </p>

                    {savingPreferences && (
                      <span className="shrink-0 text-xs font-semibold text-emerald-800">
                        Saving...
                      </span>
                    )}
                  </div>
                </section>

                {/* Privacy Card */}
                <section className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    🔒
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Your Privacy Matters
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Keep your login credentials private. Never share
                      verification codes or private ownership details
                      with anyone.
                    </p>
                  </div>
                </section>

              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                Unable to load profile.
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#fafcfb] p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-emerald-700">{icon}</span>
        {label}
      </div>

      <p className="mt-3 break-words text-sm font-bold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-slate-900">
          {title}
        </h4>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "bg-emerald-700" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

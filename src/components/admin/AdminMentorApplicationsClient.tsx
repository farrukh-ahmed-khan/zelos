"use client";

import { useEffect, useState } from "react";
import { Modal, message as antMessage } from "antd";
import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { api, isApiSuccess } from "@/lib/api/client";
import type { UserRole } from "@/lib/auth/roles";

type MentorApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  organization: string | null;
  expertise: string[];
  experienceYears: number;
  linkedInUrl: string | null;
  availability: string;
  bio: string;
  communicationPreferences: string;
  howHeard: string;
  whyMentor: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#fff3cd] text-[#8c6200]",
  reviewed: "bg-[#eaf3ff] text-[#175cd3]",
  approved: "bg-[#eef8e8] text-[#24551f]",
  rejected: "bg-[#ffe8e6] text-[#8c0504]",
};

export function AdminMentorApplicationsClient({
  adminRole,
  adminPermissions,
}: {
  adminRole: UserRole;
  adminPermissions: string[];
}) {
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selected, setSelected] = useState<MentorApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("reviewed");
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(status?: string) {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const res = await api.get(`/api/admin/mentor-applications${params}`);
      if (isApiSuccess(res.status)) {
        setApplications(res.data.data.applications);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFiltered() {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const res = await api.get(`/api/admin/mentor-applications${params}`);
      if (isMounted && isApiSuccess(res.status)) {
        setApplications(res.data.data.applications);
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    void loadFiltered();

    return () => {
      isMounted = false;
    };
  }, [filterStatus]);

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.patch(`/api/admin/mentor-applications/${selected.id}`, {
        status: reviewStatus,
        reviewNote: reviewNote.trim() || undefined,
      });
      if (isApiSuccess(res.status)) {
        antMessage.success("Application updated.");
        setSelected(null);
        void load(filterStatus || undefined);
      } else {
        antMessage.error(res.data?.error?.message ?? "Update failed.");
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = filterStatus
    ? applications.filter((a) => a.status === filterStatus)
    : applications;

  return (
    <AdminChrome
      title="Mentor Applications"
      eyebrow="Admin / Mentors"
      isSuperAdmin={adminRole === "super-admin"}
      adminRole={adminRole}
      adminPermissions={adminPermissions}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => {
            setLoading(true);
            setFilterStatus(e.target.value);
          }}
          className="rounded-md border border-[#d9dde3] bg-white px-3 py-2 text-sm font-bold text-[#202020]"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <span className="text-sm font-bold text-[#667085]">
          {filtered.length} application{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <AdminPanel title="Mentor Applications">
        {loading ? (
          <p className="text-sm text-[#667085]">Loading...</p>
        ) : !filtered.length ? (
          <p className="text-sm text-[#667085]">No mentor applications found.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-[#edf0f3]">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="grid gap-3 border-b border-[#edf0f3] px-4 py-4 last:border-b-0 sm:grid-cols-[1fr_180px_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#111827]">{app.name}</p>
                  <p className="mt-0.5 text-xs text-[#667085]">
                    {app.profession}{app.organization ? ` / ${app.organization}` : ""} / {app.experienceYears} yrs exp
                  </p>
                  <p className="mt-0.5 text-xs text-[#667085]">
                    {app.email} / Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`rounded-sm px-2 py-1 text-xs font-black uppercase ${STATUS_COLORS[app.status] ?? "bg-[#f4f4f4] text-[#667085]"}`}>
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelected(app);
                    setReviewStatus(app.status === "pending" ? "reviewed" : app.status);
                    setReviewNote(app.reviewNote ?? "");
                  }}
                  className="rounded-md border border-[#d9dde3] bg-white px-3 py-2 text-xs font-bold text-[#202020] hover:border-[#8c0504] hover:text-[#8c0504]"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <Modal
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        onOk={handleUpdate}
        okText={saving ? "Saving..." : "Save"}
        okButtonProps={{ disabled: saving }}
        title={selected ? `Review: ${selected.name}` : ""}
        width={680}
      >
        {selected ? (
          <div className="grid gap-4 py-2 text-sm">
            <div className="grid gap-1 rounded-md bg-[#f8fafc] p-4">
              <p><strong>Email:</strong> {selected.email} / <strong>Phone:</strong> {selected.phone}</p>
              <p><strong>Profession:</strong> {selected.profession}{selected.organization ? ` at ${selected.organization}` : ""}</p>
              <p><strong>Experience:</strong> {selected.experienceYears} years</p>
              {selected.linkedInUrl ? <p><strong>LinkedIn:</strong> <a href={selected.linkedInUrl} target="_blank" rel="noreferrer" className="text-[#175cd3] underline">{selected.linkedInUrl}</a></p> : null}
              <p><strong>Expertise:</strong> {selected.expertise.join(", ") || "-"}</p>
              <p><strong>Availability:</strong> {selected.availability}</p>
              <p><strong>Communication pref:</strong> {selected.communicationPreferences}</p>
              <p><strong>How heard:</strong> {selected.howHeard}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-black uppercase text-[#8c0504]">Bio</p>
              <p className="whitespace-pre-wrap leading-relaxed text-[#344054]">{selected.bio}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-black uppercase text-[#8c0504]">Why Mentor</p>
              <p className="whitespace-pre-wrap leading-relaxed text-[#344054]">{selected.whyMentor}</p>
            </div>
            <div className="grid gap-3 border-t border-[#edf0f3] pt-3">
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Update Status
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="rounded-md border border-[#d9dde3] bg-white px-3 py-2 text-sm font-normal normal-case text-[#202020]"
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Review Note (internal)
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  placeholder="Optional note about this application..."
                  className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal normal-case text-[#202020]"
                />
              </label>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminChrome>
  );
}

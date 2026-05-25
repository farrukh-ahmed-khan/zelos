"use client";

import { FormEvent, useState } from "react";
import { Modal } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type AccountSettingsFormProps = {
  user: {
    name: string;
    email: string;
    pendingEmail?: string | null;
    age: number;
    ageTrack: string;
    interests: string[];
  };
};

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitJson(endpoint: string, payload: object) {
    setMessage("");
    setError("");

    const response = await api.patch(endpoint, payload);
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      throw new Error(result?.error?.message ?? "Update failed.");
    }

    return result;
  }

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextAgeTrack = String(formData.get("ageTrack") ?? user.ageTrack);

    if (nextAgeTrack !== user.ageTrack) {
      Modal.confirm({
        title: "Change age track?",
        content: "Changing age track deletes prior lesson activity and progress for this account.",
        okText: "Change Track",
        okButtonProps: { danger: true },
        onOk: () => submitProfileForm(form),
      });
      return;
    }

    await submitProfileForm(form);
  }

  async function submitProfileForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    try {
      await submitJson("/api/account/profile", {
        name: String(formData.get("name") ?? ""),
        age: Number(formData.get("age") ?? user.age),
        ageTrack: String(formData.get("ageTrack") ?? user.ageTrack),
        interests: String(formData.get("interests") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await submitJson("/api/account/email", {
        email: String(formData.get("email") ?? ""),
      });
      setMessage("Verification email sent to the new address.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email update failed.");
    }
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await submitJson("/api/account/password", {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      form.reset();
      setMessage("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed.");
    }
  }

  async function deactivateAccount() {
    const response = await api.post("/api/account/deactivate");

    if (isApiSuccess(response.status)) {
      window.location.assign("/login");
    }
  }

  function handleDeactivate() {
    Modal.confirm({
      title: "Deactivate account?",
      content: "You will be signed out and this account will no longer be active.",
      okText: "Deactivate",
      okButtonProps: { danger: true },
      onOk: deactivateAccount,
    });
  }

  return (
    <div className="grid gap-5">
      {message ? (
        <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleProfile} className="grid gap-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
        <h2 className="font-bebas text-3xl uppercase leading-none">Profile</h2>
        <input name="name" defaultValue={user.name} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="age" type="number" min={1} max={120} defaultValue={user.age} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <select name="ageTrack" defaultValue={user.ageTrack} className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="child">Children</option>
          <option value="teen">Teens</option>
          <option value="young-adult">Young Adults</option>
        </select>
        <p className="-mt-2 text-xs font-semibold text-[#8c0504]">
          Changing age track deletes prior lesson activity/progress.
        </p>
        <input name="interests" defaultValue={user.interests.join(", ")} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
          Save Profile
        </button>
      </form>

      <form onSubmit={handleEmail} className="grid gap-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
        <h2 className="font-bebas text-3xl uppercase leading-none">Email</h2>
        <input name="email" type="email" defaultValue={user.pendingEmail ?? user.email} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
          Send Verification
        </button>
      </form>

      <form onSubmit={handlePassword} className="grid gap-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
        <h2 className="font-bebas text-3xl uppercase leading-none">Password</h2>
        <input name="currentPassword" type="password" placeholder="Current password" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="password" type="password" placeholder="New password" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
          Update Password
        </button>
      </form>

      <a
        href="/billing"
        className="w-fit rounded-md border-2 border-[#212121] bg-white px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]"
      >
        Billing Portal
      </a>

      <button
        type="button"
        onClick={handleDeactivate}
        className="w-fit rounded-md border-2 border-[#212121] bg-[#ffe8e6] px-6 py-3 text-sm font-black !text-[#8c0504] shadow-[0_4px_0_#111]"
      >
        Deactivate Account
      </button>
    </div>
  );
}

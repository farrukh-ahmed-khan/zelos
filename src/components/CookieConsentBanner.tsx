"use client";

import { useSyncExternalStore } from "react";

const CONSENT_EVENT = "zelos-cookie-consent-changed";

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}

function getSnapshot() {
  return window.localStorage.getItem("zelos-cookie-consent") === "accepted";
}

function getServerSnapshot() {
  return true;
}

export function CookieConsentBanner() {
  const accepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (accepted) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-md border-2 border-[#212121] bg-white p-4 text-[#202020] shadow-[0_5px_0_#111]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed">
          Zelos uses essential cookies for login security, forms, and account sessions.
          Analytics and marketing tools should only be added after the final privacy review.
        </p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem("zelos-cookie-consent", "accepted");
            window.dispatchEvent(new Event(CONSENT_EVENT));
          }}
          className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black text-[#212121] shadow-[0_3px_0_#111]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

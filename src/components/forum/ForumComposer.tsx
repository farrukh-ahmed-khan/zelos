"use client";

import { useRef, useState } from "react";
import {
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  PictureOutlined,
} from "@ant-design/icons";

type ForumComposerProps = {
  name: string;
  placeholder: string;
  rows?: number;
};

export function ForumComposer({
  name,
  placeholder,
  rows = 6,
}: ForumComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  function insertWrap(prefix: string, suffix = prefix, fallback = "text") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;

    setValue(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }

  function insertLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) return;

    const safeUrl = url.trim();
    if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
      window.alert("Use a full http or https link.");
      return;
    }

    insertWrap("[", `](${safeUrl})`, "link text");
  }

  function insertPhoto() {
    const url = window.prompt("Paste the photo URL");
    if (!url) return;

    const safeUrl = url.trim();
    if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
      window.alert("Use a full http or https image link.");
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const nextValue = `${value.slice(0, start)}\n![Photo](${safeUrl})\n${value.slice(start)}`;
    setValue(nextValue);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const toolbarButtonClass =
    "grid h-9 w-9 place-items-center rounded-md border border-[#d8d2c5] bg-white text-[#202020] transition hover:border-[#8c0504] hover:bg-[#faff8d]";

  return (
    <div className="overflow-hidden rounded-md border border-[#d8d2c5] bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e4ded1] bg-[#fbf7ef] px-3 py-2">
        <button
          type="button"
          aria-label="Bold"
          title="Bold"
          className={toolbarButtonClass}
          onClick={() => insertWrap("**", "**", "bold text")}
        >
          <BoldOutlined />
        </button>
        <button
          type="button"
          aria-label="Italic"
          title="Italic"
          className={toolbarButtonClass}
          onClick={() => insertWrap("*", "*", "italic text")}
        >
          <ItalicOutlined />
        </button>
        <button
          type="button"
          aria-label="Attach link"
          title="Attach link"
          className={toolbarButtonClass}
          onClick={insertLink}
        >
          <LinkOutlined />
        </button>
        <button
          type="button"
          aria-label="Attach photo"
          title="Attach photo"
          className={toolbarButtonClass}
          onClick={insertPhoto}
        >
          <PictureOutlined />
        </button>
        <p className="ml-auto text-xs font-bold text-[#667085]">
          Public post
        </p>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y bg-white px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-[#9a9489]"
      />
    </div>
  );
}

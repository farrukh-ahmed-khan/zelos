"use client";

import { useRef, useState } from "react";
import {
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { api, isApiSuccess } from "@/lib/api/client";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [value, setValue] = useState("");
  const [hasContent, setHasContent] = useState(false);

  function escapeHtml(valueToEscape: string) {
    return valueToEscape
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function serializeNode(node: ChildNode): string {
    if (node.nodeType === 3) {
      return node.textContent?.replace(/\u00a0/g, " ") ?? "";
    }

    if (node.nodeType !== 1) {
      return "";
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes).map(serializeNode).join("");

    if (tagName === "br") {
      return "\n";
    }

    if (tagName === "img") {
      const src = element.getAttribute("src");
      if (!src) return "";
      const alt = element.getAttribute("alt") || "Photo";
      return `\n![${alt}](${src})\n`;
    }

    if (tagName === "a") {
      const href = element.getAttribute("href");
      if (!href) return children;
      return `[${children || href}](${href})`;
    }

    if (tagName === "strong" || tagName === "b") {
      return `**${children}**`;
    }

    if (tagName === "em" || tagName === "i") {
      return `*${children}*`;
    }

    if (tagName === "div" || tagName === "p") {
      return `${children}\n`;
    }

    return children;
  }

  function syncEditorValue() {
    const editor = editorRef.current;
    if (!editor) return;

    const nextValue = Array.from(editor.childNodes)
      .map(serializeNode)
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    setValue(nextValue);
    setHasContent(Boolean(nextValue));
  }

  function runEditorCommand(command: "bold" | "italic") {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command);
    requestAnimationFrame(syncEditorValue);
  }

  function insertLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) return;

    const safeUrl = url.trim();
    if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
      window.alert("Use a full http or https link.");
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${escapeHtml(safeUrl)}">link text</a>`,
      );
    } else {
      document.execCommand("createLink", false, safeUrl);
    }

    requestAnimationFrame(syncEditorValue);
  }

  function insertPhoto(url: string) {
    const editor = editorRef.current;
    if (!editor) return;

    const markdownUrl = encodeURI(url.trim()).replace(/\(/g, "%28").replace(/\)/g, "%29");
    editor.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${escapeHtml(markdownUrl)}" alt="Photo" style="display:block;max-width:100%;max-height:220px;border-radius:6px;margin:12px 0;" />`,
    );
    requestAnimationFrame(syncEditorValue);
  }

  async function uploadPhoto(file: File) {
    setIsUploadingImage(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/api/forum/images", formData);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setUploadMessage(result?.error?.message ?? "Unable to upload image.");
        return;
      }

      insertPhoto(result.data.image.url);
      setUploadMessage("Image attached.");
    } finally {
      setIsUploadingImage(false);
    }
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
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runEditorCommand("bold")}
        >
          <BoldOutlined />
        </button>
        <button
          type="button"
          aria-label="Italic"
          title="Italic"
          className={toolbarButtonClass}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runEditorCommand("italic")}
        >
          <ItalicOutlined />
        </button>
        <button
          type="button"
          aria-label="Attach link"
          title="Attach link"
          className={toolbarButtonClass}
          onMouseDown={(event) => event.preventDefault()}
          onClick={insertLink}
        >
          <LinkOutlined />
        </button>
        <button
          type="button"
          aria-label="Attach photo"
          title="Upload photo"
          className={toolbarButtonClass}
          disabled={isUploadingImage}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <PictureOutlined />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadPhoto(file);
            }
            event.target.value = "";
          }}
        />
        <p className="ml-auto text-xs font-bold text-[#667085]">
          {isUploadingImage ? "Uploading image..." : uploadMessage || "Public post"}
        </p>
      </div>
      <input
        name={name}
        type="hidden"
        value={value}
        readOnly
      />
      <div className="relative">
        {!hasContent ? (
          <span className="pointer-events-none absolute left-4 top-3 text-sm leading-relaxed text-[#9a9489]">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          onInput={syncEditorValue}
          onBlur={syncEditorValue}
          className="w-full overflow-auto bg-white px-4 py-3 text-sm leading-relaxed outline-none"
          style={{ minHeight: `${rows * 44}px` }}
        />
      </div>
    </div>
  );
}

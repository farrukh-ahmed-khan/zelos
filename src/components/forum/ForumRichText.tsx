"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Modal } from "antd";
import Link from "next/link";
import type React from "react";

type PreviewImage = {
  src: string;
  alt: string;
};

function isSafeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function normalizeMarkdownUrl(value: string) {
  return value.trim().replace(/\s/g, "%20");
}

function renderEmphasis(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const marker =
      text.startsWith("***", index)
        ? "***"
        : text.startsWith("**", index)
          ? "**"
          : text[index] === "*"
            ? "*"
            : "";

    if (!marker) {
      const nextMarkerIndex = text.indexOf("*", index);
      const endIndex = nextMarkerIndex === -1 ? text.length : nextMarkerIndex;
      parts.push(text.slice(index, endIndex));
      index = endIndex;
      continue;
    }

    const closingIndex = text.indexOf(marker, index + marker.length);

    if (closingIndex === -1) {
      index += marker.length;
      continue;
    }

    const content = text.slice(index + marker.length, closingIndex);
    const childKey = `${keyPrefix}-${index}-${marker.length}`;

    if (marker === "***") {
      parts.push(
        <strong key={childKey}>
          <em>{renderEmphasis(content, childKey)}</em>
        </strong>,
      );
    } else if (marker === "**") {
      parts.push(<strong key={childKey}>{renderEmphasis(content, childKey)}</strong>);
    } else {
      parts.push(<em key={childKey}>{renderEmphasis(content, childKey)}</em>);
    }

    index = closingIndex + marker.length;
  }

  return parts;
}

function renderInline(text: string, onImageClick: (image: PreviewImage) => void) {
  const parts: React.ReactNode[] = [];
  const pattern = /(!?\[[^\]]+\]\(https?:\/\/[^\r\n]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(...renderEmphasis(text.slice(lastIndex, match.index), `text-${lastIndex}`));
    }

    const token = match[0];
    const imageMatch = token.match(/^!\[([^\]]+)\]\((https?:\/\/[^\r\n]+)\)$/);
    const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\r\n]+)\)$/);

    if (imageMatch && isSafeUrl(imageMatch[2])) {
      const imageUrl = normalizeMarkdownUrl(imageMatch[2]);
      const imageAlt = imageMatch[1];
      parts.push(
        <button
          key={`${match.index}-${token}`}
          type="button"
          aria-label="Open image preview"
          className="my-3 block w-full cursor-zoom-in rounded-md border border-[#e4ded1] bg-transparent p-0 transition hover:border-[#8c0504] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c0504]"
          onClick={() => onImageClick({ src: imageUrl, alt: imageAlt })}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-h-[360px] w-full rounded-md object-cover"
          />
        </button>,
      );
    } else if (linkMatch && isSafeUrl(linkMatch[2])) {
      const linkUrl = normalizeMarkdownUrl(linkMatch[2]);
      parts.push(
        <Link
          key={`${match.index}-${token}`}
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="font-bold !text-[#8c0504] underline"
        >
          {linkMatch[1]}
        </Link>,
      );
    } else {
      parts.push(token);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(...renderEmphasis(text.slice(lastIndex), `text-${lastIndex}`));
  }

  return parts;
}

export function ForumRichText({ content }: { content: string }) {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const paragraphs = content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <>
      <div className="grid gap-3 text-sm leading-relaxed text-[#202020]">
        {paragraphs.map((paragraph, index) => (
          <p key={`${paragraph}-${index}`} className="whitespace-pre-wrap">
            {renderInline(paragraph, setPreviewImage)}
          </p>
        ))}
      </div>
      <Modal
        open={Boolean(previewImage)}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        centered
        width="min(92vw, 1100px)"
      >
        {previewImage ? (
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[80vh] w-full rounded-md object-contain"
          />
        ) : null}
      </Modal>
    </>
  );
}

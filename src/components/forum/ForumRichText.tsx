/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type React from "react";

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

function renderInline(text: string) {
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
      parts.push(
        <img
          key={`${match.index}-${token}`}
          src={imageUrl}
          alt={imageMatch[1]}
          className="my-3 max-h-[360px] w-full rounded-md border border-[#e4ded1] object-cover"
        />,
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
  const paragraphs = content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <div className="grid gap-3 text-sm leading-relaxed text-[#202020]">
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph}-${index}`} className="whitespace-pre-wrap">
          {renderInline(paragraph)}
        </p>
      ))}
    </div>
  );
}

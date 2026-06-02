/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type React from "react";

function isSafeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function normalizeMarkdownUrl(value: string) {
  return value.trim().replace(/\s/g, "%20");
}

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /(!?\[[^\]]+\]\(https?:\/\/[^\r\n]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
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
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={`${match.index}-${token}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={`${match.index}-${token}`}>{token.slice(1, -1)}</em>);
    } else {
      parts.push(token);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
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

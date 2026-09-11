"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Undo2
} from "lucide-react";

type DocumentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClass?: string;
  paperClassName?: string;
  toolbarCompact?: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>");
}

function isMarkdownTableDivider(line: string) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;

  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
}

function splitMarkdownTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdownTable(lines: string[]) {
  const header = splitMarkdownTableRow(lines[0]);
  const bodyRows = lines.slice(2).map(splitMarkdownTableRow);

  return [
    '<table><thead><tr>',
    ...header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`),
    "</tr></thead><tbody>",
    ...bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`),
    "</tbody></table>"
  ].join("");
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function closeList() {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    if (trimmed.includes("|") && lines[index + 1] && isMarkdownTableDivider(lines[index + 1])) {
      closeList();
      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length && lines[index].trim().includes("|") && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }

      index -= 1;
      html.push(renderMarkdownTable(tableLines));
      continue;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      closeList();
      html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${inlineMarkdown(trimmed.slice(2))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  closeList();
  return html.join("");
}

function serializeTable(table: HTMLTableElement) {
  const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
    Array.from(row.children).map((cell) => cell.textContent?.trim().replace(/\s+/g, " ") || "")
  );

  if (!rows.length) return "";

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] || ""));
  const header = normalizedRows[0];
  const divider = header.map(() => "---");
  const body = normalizedRows.slice(1);
  const formatRow = (row: string[]) => `| ${row.join(" | ")} |`;

  return [formatRow(header), formatRow(divider), ...body.map(formatRow)].join("\n");
}

function htmlToDocumentText(html: string) {
  if (typeof window === "undefined") return html;
  const element = document.createElement("div");
  element.innerHTML = html;
  const blocks: string[] = [];

  Array.from(element.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();
    const text = child.textContent?.trim() || "";

    if (!text && tag !== "table") return;

    if (tag === "h1") blocks.push(`# ${text}`);
    else if (tag === "h2") blocks.push(`## ${text}`);
    else if (tag === "h3") blocks.push(`### ${text}`);
    else if (tag === "ul") {
      Array.from(child.querySelectorAll("li")).forEach((item) => blocks.push(`- ${item.textContent?.trim() || ""}`));
    } else if (tag === "ol") {
      Array.from(child.querySelectorAll("li")).forEach((item, index) =>
        blocks.push(`${index + 1}. ${item.textContent?.trim() || ""}`)
      );
    } else if (tag === "table") {
      blocks.push(serializeTable(child as HTMLTableElement));
    } else {
      blocks.push(text);
    }
  });

  return blocks.join("\n\n").trim();
}

function ToolbarButton({
  active,
  disabled,
  title,
  onClick,
  children
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center border text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-civic bg-civic text-white" : "border-line bg-white text-ink hover:border-civic"
      }`}
    >
      {children}
    </button>
  );
}

export default function DocumentEditor({
  value,
  onChange,
  placeholder,
  minHeightClass = "min-h-[760px]",
  paperClassName = "mx-auto min-h-[980px] max-w-[794px] border border-line bg-white px-10 py-12 shadow-sm sm:px-16 sm:py-16",
  toolbarCompact = false
}: DocumentEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Placeholder.configure({
        placeholder: placeholder || "A minuta gerada aparecera aqui."
      })
    ],
    content: value ? markdownToHtml(value) : "",
    editorProps: {
      attributes: {
        class:
          `${minHeightClass} focus:outline-none font-serif text-[15px] leading-7 text-ink [&_h1]:text-center [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:mb-8 [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:mb-1 [&_table]:mb-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_th]:border [&_th]:border-line [&_th]:bg-paper [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-line [&_td]:px-2 [&_td]:py-2 [&_td_p]:m-0`
      }
    },
    onUpdate({ editor: currentEditor }) {
      onChange(htmlToDocumentText(currentEditor.getHTML()));
    }
  });

  useEffect(() => {
    if (!editor) return;
    const currentText = htmlToDocumentText(editor.getHTML());

    if (currentText === value.trim()) return;
    editor.commands.setContent(value ? markdownToHtml(value) : "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="flex min-h-[760px] items-center justify-center bg-paper text-sm text-muted">
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-white p-2">
        <ToolbarButton title="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton title="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </ToolbarButton>
        <div className="mx-1 h-9 w-px bg-line" />
        <ToolbarButton
          title="Paragrafo"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Titulo 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={16} />
        </ToolbarButton>
        {!toolbarCompact ? (
          <ToolbarButton
            title="Titulo 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={16} />
          </ToolbarButton>
        ) : null}
        <div className="mx-1 h-9 w-px bg-line" />
        <ToolbarButton
          title="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        {!toolbarCompact ? (
          <>
            <ToolbarButton
              title="Lista"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              title="Lista numerada"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={16} />
            </ToolbarButton>
            <div className="mx-1 h-9 w-px bg-line" />
          </>
        ) : null}
        <ToolbarButton
          title="Alinhar a esquerda"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Centralizar"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Alinhar a direita"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Justificar"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify size={16} />
        </ToolbarButton>
      </div>

      <div className="overflow-auto p-4 sm:p-8">
        <div className={paperClassName}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

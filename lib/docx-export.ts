"use client";

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";

type ExportDocxInput = {
  title: string;
  filename: string;
  body: string;
  header?: string;
};

function cleanMarkdown(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

function paragraphFromLine(line: string) {
  const trimmed = line.trim();

  if (trimmed.startsWith("# ")) {
    return new Paragraph({
      text: cleanMarkdown(trimmed.slice(2)),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240 }
    });
  }

  if (trimmed.startsWith("## ")) {
    return new Paragraph({
      text: cleanMarkdown(trimmed.slice(3)),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 220, after: 120 }
    });
  }

  if (trimmed.startsWith("### ")) {
    return new Paragraph({
      text: cleanMarkdown(trimmed.slice(4)),
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 100 }
    });
  }

  const unordered = trimmed.match(/^[-*]\s+(.*)$/);
  if (unordered) {
    return new Paragraph({
      text: cleanMarkdown(unordered[1]),
      bullet: { level: 0 },
      spacing: { after: 80 }
    });
  }

  const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
  if (ordered) {
    return new Paragraph({
      text: cleanMarkdown(ordered[1]),
      numbering: { reference: "default-numbering", level: 0 },
      spacing: { after: 80 }
    });
  }

  return new Paragraph({
    children: [
      new TextRun({
        text: cleanMarkdown(trimmed),
        size: 24
      })
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160 },
    indent: { firstLine: 720 }
  });
}

function linesToParagraphs(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(paragraphFromLine);
}

function headerParagraphs(header?: string) {
  if (!header?.trim()) return [];

  return [
    ...header
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map(
        (line) =>
          new Paragraph({
            text: cleanMarkdown(line),
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 }
          })
      ),
    new Paragraph({ text: "", spacing: { after: 240 } })
  ];
}

export async function exportDocx({ title, filename, body, header }: ExportDocxInput) {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START
            }
          ]
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          ...headerParagraphs(header),
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 }
          }),
          ...linesToParagraphs(body)
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

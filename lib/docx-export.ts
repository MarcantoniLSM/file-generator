"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType
} from "docx";

type ExportDocxInput = {
  title: string;
  filename: string;
  body: string;
  header?: string;
  logoDataUrl?: string;
};

const DOCX_CONTENT_WIDTH = 9020;

function cleanMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

function comparableText(value: string) {
  return cleanMarkdown(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function stripLeadingHeaderAndTitle(body: string, title: string, header?: string) {
  const headerLines = new Set(
    (header || "")
      .split("\n")
      .map(comparableText)
      .filter(Boolean)
  );
  const titleLine = comparableText(title);
  const lines = body.split("\n");
  let index = 0;

  while (index < lines.length && !lines[index].trim()) index += 1;

  while (index < lines.length) {
    const line = comparableText(lines[index]);

    if (!line) {
      index += 1;
      continue;
    }

    if (headerLines.has(line) || line === titleLine) {
      index += 1;
      continue;
    }

    break;
  }

  return lines.slice(index).join("\n").trimStart();
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
    .map((cell) => cleanMarkdown(cell.trim()));
}

function columnWidthsForRows(rows: string[][], columnCount: number) {
  const weights = Array.from({ length: columnCount }, (_, columnIndex) => {
    const longestCell = rows.reduce((longest, row) => Math.max(longest, (row[columnIndex] || "").length), 0);

    return Math.min(Math.max(longestCell, 12), 48);
  });
  const totalWeight = weights.reduce((total, weight) => total + weight, 0) || columnCount;
  const widths = weights.map((weight) => Math.max(720, Math.floor((DOCX_CONTENT_WIDTH * weight) / totalWeight)));
  const currentTotal = widths.reduce((total, width) => total + width, 0);

  widths[widths.length - 1] += DOCX_CONTENT_WIDTH - currentTotal;

  return widths;
}

function tableFromLines(lines: string[]) {
  const rows = [splitMarkdownTableRow(lines[0]), ...lines.slice(2).map(splitMarkdownTableRow)];
  const columnCount = Math.max(...rows.map((row) => row.length));
  const columnWidths = columnWidthsForRows(rows, columnCount);

  return new Table({
    width: {
      size: DOCX_CONTENT_WIDTH,
      type: WidthType.DXA
    },
    columnWidths,
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "B8BDC7" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "B8BDC7" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "B8BDC7" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "B8BDC7" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D7DBE3" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D7DBE3" }
    },
    rows: rows.map(
      (row, rowIndex) =>
        new TableRow({
          tableHeader: rowIndex === 0,
          children: Array.from({ length: columnCount }, (_, index) => {
            const text = row[index] || "";

            return new TableCell({
              width: {
                size: columnWidths[index],
                type: WidthType.DXA
              },
              shading: rowIndex === 0 ? { fill: "F1F3F6" } : undefined,
              margins: {
                top: 90,
                bottom: 90,
                left: 90,
                right: 90
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text,
                      bold: rowIndex === 0,
                      size: 20
                    })
                  ],
                  spacing: { after: 0 }
                })
              ]
            });
          })
        })
    )
  });
}

function paragraphFromLine(line: string) {
  const trimmed = line.trim();

  if (trimmed.startsWith("# ")) {
    return new Paragraph({
      children: [
        new TextRun({
          text: cleanMarkdown(trimmed.slice(2)).toUpperCase(),
          bold: true,
          size: 28,
          color: "111827"
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240 }
    });
  }

  if (trimmed.startsWith("## ")) {
    return new Paragraph({
      children: [
        new TextRun({
          text: cleanMarkdown(trimmed.slice(3)),
          bold: true,
          size: 24,
          color: "111827"
        })
      ],
      spacing: { before: 220, after: 120 }
    });
  }

  if (trimmed.startsWith("### ")) {
    return new Paragraph({
      children: [
        new TextRun({
          text: cleanMarkdown(trimmed.slice(4)),
          bold: true,
          size: 22,
          color: "111827"
        })
      ],
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

function bodyToDocxBlocks(text: string) {
  const lines = text.split("\n");
  const blocks: Array<Paragraph | Table> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) continue;

    if (line.includes("|") && lines[index + 1] && isMarkdownTableDivider(lines[index + 1])) {
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;

      while (index < lines.length && lines[index].trim().includes("|") && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }

      index -= 1;
      blocks.push(tableFromLines(tableLines));
      blocks.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      continue;
    }

    blocks.push(paragraphFromLine(line));
  }

  return blocks;
}

async function logoParagraph(logoDataUrl?: string) {
  if (!logoDataUrl?.trim()) return [];

  const response = await fetch(logoDataUrl);
  const data = new Uint8Array(await response.arrayBuffer());
  const type = logoDataUrl.startsWith("data:image/jpeg") ? "jpg" : "png";

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new ImageRun({
          type,
          data,
          transformation: {
            width: 84,
            height: 84
          }
        })
      ]
    })
  ];
}

function headerParagraphs(header?: string) {
  if (!header?.trim()) return [new Paragraph({ text: "", spacing: { after: 120 } })];

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

export async function exportDocx({ title, filename, body, header, logoDataUrl }: ExportDocxInput) {
  const logoBlocks = await logoParagraph(logoDataUrl);
  const normalizedBody = stripLeadingHeaderAndTitle(body, title, header);

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
          ...logoBlocks,
          ...headerParagraphs(header),
          new Paragraph({
            children: [
              new TextRun({
                text: title.toUpperCase(),
                bold: true,
                size: 30,
                color: "111827"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 }
          }),
          ...bodyToDocxBlocks(normalizedBody)
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

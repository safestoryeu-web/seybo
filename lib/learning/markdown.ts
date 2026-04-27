/* Tiny markdown renderer used by chapter pages.
   Supports: ## h2, ### h3, * bullets, 1. ordered lists, > blockquote,
   simple tables, **bold**, *italic*, `code`. */

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  return escHtml(s)
    .replace(/`([^`]+)`/g, (_, x) => `<code>${x}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, (_, x) => `<strong>${x}</strong>`)
    .replace(/\*([^*]+)\*/g, (_, x) => `<em>${x}</em>`);
}

export function md(src: string): string {
  const lines = src.split("\n");
  const html: string[] = [];
  let i = 0;
  const isTableLine = (s: string) => /^\|.*\|/.test(s);

  while (i < lines.length) {
    const line = lines[i];

    if (/^##\s+/.test(line)) {
      html.push("<h2>" + inline(line.replace(/^##\s+/, "")) + "</h2>");
      i++;
      continue;
    }
    if (/^###\s+/.test(line)) {
      html.push("<h3>" + inline(line.replace(/^###\s+/, "")) + "</h3>");
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      html.push("<blockquote>" + inline(buf.join(" ")) + "</blockquote>");
      continue;
    }
    if (
      isTableLine(line) &&
      i + 1 < lines.length &&
      /^\|[\s\-|:]+\|/.test(lines[i + 1])
    ) {
      const headerCells = line
        .split("|")
        .slice(1, -1)
        .map((s) => s.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        rows.push(
          lines[i]
            .split("|")
            .slice(1, -1)
            .map((s) => s.trim())
        );
        i++;
      }
      let t =
        "<table><thead><tr>" +
        headerCells.map((h) => `<th>${inline(h)}</th>`).join("") +
        "</tr></thead><tbody>";
      rows.forEach((r) => {
        t += "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      });
      t += "</tbody></table>";
      html.push(t);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        buf.push(
          "<li>" + inline(lines[i].replace(/^\d+\.\s+/, "")) + "</li>"
        );
        i++;
      }
      html.push("<ol>" + buf.join("") + "</ol>");
      continue;
    }
    if (/^\*\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\*\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\*\s+/, "");
        i++;
        while (i < lines.length && /^\s{2,}-?\s+/.test(lines[i])) {
          item += "<br>" + lines[i].trim();
          i++;
        }
        buf.push("<li>" + inline(item) + "</li>");
      }
      html.push("<ul>" + buf.join("") + "</ul>");
      continue;
    }
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    const buf: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^##\s+/.test(lines[i]) &&
      !/^###\s+/.test(lines[i]) &&
      !/^\*\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !isTableLine(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    html.push("<p>" + inline(buf.join(" ")) + "</p>");
  }

  return html.join("\n");
}

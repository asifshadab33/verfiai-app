import React, { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";
export default function QuoteCard() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    const words = quote.split(" ");
    let line = "";
    let y = 150;
    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > 700 && line !== "") {
        ctx.fillText(line.trim(), 400, y);
        line = word + " ";
        y += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 400, y);
    if (author) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "24px sans-serif";
      ctx.fillText(`— ${author}`, 400, y + 60);
    }
  }, [quote, author]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "quote-card.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4">
      <label className="field-label">
        Quote
        <textarea
          className="mt-2 w-full rounded-lg border p-3"
          rows={3}
          placeholder="Enter quote..."
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />
      </label>
      <label className="field-label">
        Author or source
        <input
          className="mt-2 w-full rounded-lg border p-3"
          placeholder="Author / Source"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </label>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        role="img"
        aria-label={`Quote card preview${quote ? `: ${quote}` : ""}${author ? `, attributed to ${author}` : ""}`}
        className="w-full h-auto rounded-lg border border-gray-200"
      />
      <button
        onClick={download}
        disabled={!quote}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Download className="w-4 h-4" /> Download PNG
      </button>
    </div>
  );
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadBlob } from "./download-blob";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("report Blob downloads", () => {
  it.each(["verifai-report.md", "Coffee and sleep.docx"])(
    "downloads %s and revokes its URL after one second",
    (filename) => {
      vi.useFakeTimers();
      const blob = new Blob(["report"]);
      const createObjectURL = vi.fn(() => "blob:report-export");
      const revokeObjectURL = vi.fn();
      const a = { href: "", download: "", click: vi.fn() };
      const createElement = vi.fn(() => a);
      vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
      vi.stubGlobal("document", { createElement });

      downloadBlob(blob, filename);

      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(createElement).toHaveBeenCalledWith("a");
      expect(a.href).toBe("blob:report-export");
      expect(a.download).toBe(filename);
      expect(a.click).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(999);
      expect(revokeObjectURL).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:report-export");
    },
  );
});

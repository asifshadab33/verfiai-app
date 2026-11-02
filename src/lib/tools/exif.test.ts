import { describe, expect, it } from "vitest";
import { parseExif } from "./exif";

// Tiny real files made with Pillow: Make TestCam, Model X100 Mark II, taken 2024-03-05 14:22:10, GPS 48.858367 N, 2.294472 W.
const JPEG = "/9j/4AAQSkZJRgABAQAAAQABAAD/4QI2RXhpZgAATU0AKgAAAAgACQEPAAIAAAAIAAAAegEQAAIAAAANAAAAggESAAMAAAABAAYAAAExAAIAAAAVAAAAkAEyAAIAAAAUAAAApgE7AAIAAAASAAAAuoKYAAIAAAAOAAAAzIdpAAQAAAABAAAA2oglAAQAAAABAAABqAAAAABUZXN0Q2FtAFgxMDAgTWFyayBJSQAAQWRvYmUgUGhvdG9zaG9wIDI1LjAAADIwMjQ6MDM6MDggMDk6MDA6MDAASmFuZSBQaG90b2dyYXBoZXIAKGMpIEphbmUgMjAyNAAACoKaAAUAAAABAAABWIKdAAUAAAABAAABYIgnAAMAAAABAZAAAJADAAIAAAAUAAABaJAEAAIAAAAUAAABfJARAAIAAAAHAAABkJIKAAUAAAABAAABmKACAAMAAAABD8AAAKADAAMAAAABC9AAAKQ0AAIAAAAIAAABoAAAAAAAAAABAAAA+gAAAAkAAAAFMjAyNDowMzowNSAxNDoyMjoxMAAyMDI0OjAzOjA1IDE0OjIyOjEwACswMTowMAAAAAAAGwAAAAVYRiAyM21tAAAGAAEAAgAAAAJOAAAAAAIABQAAAAMAAAH2AAMAAgAAAAJXAAAAAAQABQAAAAMAAAIOAAUAAQAAAAEAAAAAAAYABQAAAAEAAAImAAAAAAAAADAAAAABAAAAMwAAAAEAAALxAAAAGQAAAAIAAAABAAAAEQAAAAEAAAGRAAAACgAAACMAAAAB/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgAMABAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8AzqKKK+bPuAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Z";
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAIAAAAuKetIAAACLmVYSWZNTQAqAAAACAAJAQ8AAgAAAAgAAAB6ARAAAgAAAA0AAACCARIAAwAAAAEABgAAATEAAgAAABUAAACQATIAAgAAABQAAACmATsAAgAAABIAAAC6gpgAAgAAAA4AAADMh2kABAAAAAEAAADaiCUABAAAAAEAAAGoAAAAAFRlc3RDYW0AWDEwMCBNYXJrIElJAABBZG9iZSBQaG90b3Nob3AgMjUuMAAAMjAyNDowMzowOCAwOTowMDowMABKYW5lIFBob3RvZ3JhcGhlcgAoYykgSmFuZSAyMDI0AAAKgpoABQAAAAEAAAFYgp0ABQAAAAEAAAFgiCcAAwAAAAEBkAAAkAMAAgAAABQAAAFokAQAAgAAABQAAAF8kBEAAgAAAAcAAAGQkgoABQAAAAEAAAGYoAIAAwAAAAEPwAAAoAMAAwAAAAEL0AAApDQAAgAAAAgAAAGgAAAAAAAAAAEAAAD6AAAACQAAAAUyMDI0OjAzOjA1IDE0OjIyOjEwADIwMjQ6MDM6MDUgMTQ6MjI6MTAAKzAxOjAwAAAAAAAbAAAABVhGIDIzbW0AAAYAAQACAAAAAk4AAAAAAgAFAAAAAwAAAfYAAwACAAAAAlcAAAAABAAFAAAAAwAAAg4ABQABAAAAAQAAAAAABgAFAAAAAQAAAiYAAAAAAAAAMAAAAAEAAAAzAAAAAQAAAvEAAAAZAAAAAgAAAAEAAAARAAAAAQAAAZEAAAAKAAAAIwAAAAF0Tf71AAAAU0lEQVR4nO3PQQ3AIADAQEANcpCNrIngcVnSU9DOe/b4s6UDXjWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaB9KlwBoBtb29kAAAAASUVORK5CYII=";
const NO_EXIF = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAwAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDOooor5s+4CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9k=";
const bytes = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
const val = (r: ReturnType<typeof parseExif>, label: string) => r.fields.find(f => f.label === label)?.value;

describe("photo metadata reader", () => {
  for (const [name, data] of [["JPEG", JPEG], ["PNG", PNG]] as const) {
    it(`reads camera, date, settings and location from a ${name}`, () => {
      const r = parseExif(bytes(data));
      expect(r.status).toBe("ok");
      expect(val(r, "Make")).toBe("TestCam");
      expect(val(r, "Model")).toBe("X100 Mark II");
      expect(val(r, "Taken")).toBe("2024-03-05 14:22:10");
      expect(val(r, "Exposure")).toBe("1/250 s");
      expect(val(r, "Aperture")).toBe("f/1.8");
      expect(val(r, "ISO")).toBe("400");
      expect(val(r, "Orientation")).toBe("Rotated 90° clockwise");
      expect(Math.abs(r.gps!.lat - 48.858367) < 0.00001).toBe(true);
      expect(Math.abs(r.gps!.lon + 2.294472) < 0.00001).toBe(true);
      expect(r.gps!.altitudeM).toBe(35);
      expect(r.gps!.mapUrl).toContain("openstreetmap.org");
    });
  }
  it("adds neutral notes about location, editing software and modification time", () => {
    const n = parseExif(bytes(JPEG)).notes.join(" | ");
    expect(n).toContain("location data");
    expect(n).toContain("editing program");
    expect(n).toContain("later than the capture time");
  });
  it("reports a photo without metadata", () => {
    const r = parseExif(bytes(NO_EXIF));
    expect(r.status).toBe("no-metadata");
    expect(r.fields).toHaveLength(0);
    expect(r.gps).toBeNull();
  });
  it("never throws on garbage, empty or truncated input", () => {
    expect(parseExif(new Uint8Array(0)).status).toBe("unsupported");
    expect(parseExif(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).status).toBe("unsupported");
    const full = bytes(JPEG);
    for (const cut of [30, 100, 200, 400, 800]) expect(() => parseExif(full.slice(0, cut))).not.toThrow();
  });
});

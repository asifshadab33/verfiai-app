/** Minimal, bounds-checked EXIF reader for JPEG, PNG and WebP. Pure: the file never leaves the browser. */
export type ExifGroup = "Camera" | "Date" | "Settings" | "Image" | "Author" | "Location";
export type ExifField = { group: ExifGroup; label: string; value: string };
export type ExifResult = {
  status: "ok" | "no-metadata" | "unsupported";
  fields: ExifField[];
  gps: { lat: number; lon: number; altitudeM?: number | undefined; mapUrl: string } | null;
  notes: string[];
};

type Entry = { type: number; count: number; at: number };
const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
const EDITORS = /(photoshop|lightroom|gimp|snapseed|picsart|canva|pixelmator|affinity|capture one|photopea|facetune|paint\.net)/i;
const ORIENTATION: Record<number, string> = { 1: "Normal", 2: "Mirrored", 3: "Rotated 180°", 4: "Mirrored vertically", 5: "Mirrored, rotated 90° clockwise", 6: "Rotated 90° clockwise", 7: "Mirrored, rotated 90° counter-clockwise", 8: "Rotated 90° counter-clockwise" };
const ascii = (b: Uint8Array, s: number, n: number) => String.fromCharCode(...b.subarray(s, s + n));

function locateTiff(b: Uint8Array): { start: number; end: number } | null | "unsupported" {
  if (b.length < 12) return "unsupported";
  if (b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o + 4 <= b.length) {
      if (b[o] !== 0xff) { o++; continue; }
      const marker = b[o + 1]!;
      if (marker === 0xff) { o++; continue; }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { o += 2; continue; }
      if (marker === 0xda || marker === 0xd9) return null;
      const len = (b[o + 2]! << 8) | b[o + 3]!;
      if (marker === 0xe1 && ascii(b, o + 4, 6) === "Exif\0\0") return { start: o + 10, end: Math.min(b.length, o + 2 + len) };
      o += 2 + len;
    }
    return null;
  }
  if (b[0] === 0x89 && ascii(b, 1, 3) === "PNG") {
    let o = 8;
    while (o + 12 <= b.length) {
      const len = ((b[o]! << 24) | (b[o + 1]! << 16) | (b[o + 2]! << 8) | b[o + 3]!) >>> 0;
      if (ascii(b, o + 4, 4) === "eXIf") return { start: o + 8, end: Math.min(b.length, o + 8 + len) };
      o += 12 + len;
    }
    return null;
  }
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") {
    let o = 12;
    while (o + 8 <= b.length) {
      const len = (b[o + 4]! | (b[o + 5]! << 8) | (b[o + 6]! << 16) | (b[o + 7]! << 24)) >>> 0;
      if (ascii(b, o, 4) === "EXIF") { const s = o + 8 + (ascii(b, o + 8, 6) === "Exif\0\0" ? 6 : 0); return { start: s, end: Math.min(b.length, o + 8 + len) }; }
      o += 8 + len + (len & 1);
    }
    return null;
  }
  return "unsupported";
}

function readTiff(b: Uint8Array, start: number, end: number) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const order = ascii(b, start, 2);
  if (order !== "II" && order !== "MM") return null;
  const le = order === "II";
  const ok = (o: number, n: number) => o >= start && o + n <= end;
  const u16 = (o: number) => (ok(o, 2) ? dv.getUint16(o, le) : 0);
  const u32 = (o: number) => (ok(o, 4) ? dv.getUint32(o, le) : 0);
  if (u16(start + 2) !== 42) return null;
  const ifd = (rel: number): Map<number, Entry> => {
    const m = new Map<number, Entry>();
    const base = start + rel;
    const n = Math.min(u16(base), 300);
    for (let i = 0; i < n; i++) {
      const e = base + 2 + i * 12;
      if (!ok(e, 12)) break;
      const type = u16(e + 2), count = u32(e + 4), size = (TYPE_SIZE[type] ?? 0) * count;
      if (!size) continue;
      const at = size <= 4 ? e + 8 : start + u32(e + 8);
      if (ok(at, size)) m.set(u16(e), { type, count, at });
    }
    return m;
  };
  const text = (e?: Entry) => (e && e.type === 2 ? ascii(b, e.at, e.count).replace(/\0.*$/s, "").trim() : "");
  const int = (e?: Entry, i = 0) => (!e ? undefined : e.type === 3 ? u16(e.at + 2 * i) : e.type === 4 ? u32(e.at + 4 * i) : e.type === 1 ? b[e.at + i] : undefined);
  const rat = (e?: Entry, i = 0) => {
    if (!e || (e.type !== 5 && e.type !== 10) || i >= e.count) return undefined;
    const den = u32(e.at + 8 * i + 4);
    return den ? u32(e.at + 8 * i) / den : undefined;
  };
  return { ifd, text, int, rat, root: u32(start + 4) };
}

const date = (s: string) => (/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(s) ? s.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3") : s);
const dms = (r: (e?: Entry, i?: number) => number | undefined, e?: Entry) => {
  const d = r(e, 0), m = r(e, 1) ?? 0, s = r(e, 2) ?? 0;
  return d === undefined ? undefined : d + m / 60 + s / 3600;
};

export function parseExif(input: ArrayBuffer | Uint8Array): ExifResult {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input);
  const empty = (status: ExifResult["status"], note: string): ExifResult => ({ status, fields: [], gps: null, notes: [note] });
  let loc: ReturnType<typeof locateTiff>;
  try { loc = locateTiff(b); } catch { return empty("unsupported", "This file could not be read."); }
  if (loc === "unsupported") return empty("unsupported", "This file type is not supported here. JPEG, PNG and WebP photos work; HEIC and some other formats do not.");
  if (!loc) return empty("no-metadata", "No EXIF metadata was found in this file.");
  const t = readTiff(b, loc.start, loc.end);
  if (!t) return empty("no-metadata", "The metadata block in this file is damaged or unreadable.");

  const fields: ExifField[] = [], notes: string[] = [];
  const add = (group: ExifGroup, label: string, value: string | undefined) => { if (value) fields.push({ group, label, value }); };
  const root = t.ifd(t.root);
  const exif = root.get(0x8769) ? t.ifd(t.int(root.get(0x8769)) ?? 0) : new Map<number, Entry>();
  const gpsIfd = root.get(0x8825) ? t.ifd(t.int(root.get(0x8825)) ?? 0) : new Map<number, Entry>();

  const make = t.text(root.get(0x010f)), model = t.text(root.get(0x0110)), software = t.text(root.get(0x0131));
  add("Camera", "Make", make); add("Camera", "Model", model); add("Camera", "Lens", t.text(exif.get(0xa434))); add("Camera", "Software", software);
  const original = t.text(exif.get(0x9003)), digitized = t.text(exif.get(0x9004)), modified = t.text(root.get(0x0132));
  add("Date", "Taken", date(original)); add("Date", "Digitised", date(digitized)); add("Date", "File modified (in metadata)", date(modified));
  add("Date", "Time-zone offset", t.text(exif.get(0x9011)));
  const exp = t.rat(exif.get(0x829a));
  add("Settings", "Exposure", exp === undefined ? undefined : exp < 1 ? `1/${Math.round(1 / exp)} s` : `${exp.toFixed(1)} s`);
  const f = t.rat(exif.get(0x829d)); add("Settings", "Aperture", f === undefined ? undefined : `f/${f.toFixed(1)}`);
  const iso = t.int(exif.get(0x8827)); add("Settings", "ISO", iso === undefined ? undefined : String(iso));
  const fl = t.rat(exif.get(0x920a)); add("Settings", "Focal length", fl === undefined ? undefined : `${fl.toFixed(1)} mm`);
  const w = t.int(exif.get(0xa002)), h = t.int(exif.get(0xa003));
  add("Image", "Size in metadata", w && h ? `${w} × ${h}` : undefined);
  const o = t.int(root.get(0x0112)); add("Image", "Orientation", o === undefined ? undefined : (ORIENTATION[o] ?? String(o)));
  add("Author", "Artist", t.text(root.get(0x013b))); add("Author", "Copyright", t.text(root.get(0x8298))); add("Author", "Description", t.text(root.get(0x010e)));

  let gps: ExifResult["gps"] = null;
  const latRef = t.text(gpsIfd.get(1)).toUpperCase(), lonRef = t.text(gpsIfd.get(3)).toUpperCase();
  const lat0 = dms(t.rat, gpsIfd.get(2)), lon0 = dms(t.rat, gpsIfd.get(4));
  if (lat0 !== undefined && lon0 !== undefined) {
    const lat = latRef === "S" ? -lat0 : lat0, lon = lonRef === "W" ? -lon0 : lon0;
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat !== 0 || lon !== 0)) {
      const alt = t.rat(gpsIfd.get(6)), below = t.int(gpsIfd.get(5)) === 1;
      gps = { lat, lon, altitudeM: alt === undefined ? undefined : below ? -alt : alt, mapUrl: `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lon.toFixed(6)}#map=15/${lat.toFixed(5)}/${lon.toFixed(5)}` };
      add("Location", "GPS coordinates", `${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      if (gps.altitudeM !== undefined) add("Location", "Altitude", `${Math.round(gps.altitudeM)} m ${gps.altitudeM < 0 ? "below" : "above"} sea level`);
      notes.push("This photo carries location data. Remove it before sharing the photo publicly if you want to keep the place private.");
    } else if (lat0 || lon0) notes.push("GPS fields are present but do not hold a usable location.");
  }
  if (software && EDITORS.test(software)) notes.push(`The Software field names an editing program (${software}), so the file may have been edited after capture.`);
  const ts = (s: string) => Date.parse(date(s).replace(" ", "T") + "Z");
  if (original && modified && ts(modified) - ts(original) > 60_000) notes.push("The metadata modification time is later than the capture time, which can happen when a photo is edited or re-saved.");
  if (!fields.length) return empty("no-metadata", "A metadata block exists but holds no readable fields.");
  return { status: "ok", fields, gps, notes };
}

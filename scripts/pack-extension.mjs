// Bungkus extension/ jadi public/downloads/absenin.zip dan salin extension/shared/*.js ke public/ext
// (dipakai landing page untuk menggambar maskot yang identik dengan produk).
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const EXT = path.resolve(here, "..", "extension");
const OUT_DIR = path.resolve(here, "..", "public", "downloads");
const SKIP = new Set(["node_modules", ".git", ".claude-flow"]);

fs.mkdirSync(OUT_DIR, { recursive: true });
const zip = new AdmZip();
function walk(dir, rel = "") {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const r = rel ? `${rel}/${name}` : name;
    if (fs.statSync(full).isDirectory()) walk(full, r);
    else zip.addFile(`absenin/${r}`, fs.readFileSync(full));
  }
}
walk(EXT);
// sinkron shared -> public/ext
const PUB_EXT = path.resolve(here, "..", "public", "ext");
fs.mkdirSync(PUB_EXT, { recursive: true });
for (const f of ["util.js", "templates.js", "sawit.js", "themes.js", "idle.js"]) fs.copyFileSync(path.join(EXT, "shared", f), path.join(PUB_EXT, f));
console.log("shared → public/ext (5 file)");
const out = path.join(OUT_DIR, "absenin.zip");
zip.writeZip(out);
console.log("zip →", out, Math.round(fs.statSync(out).size / 1024) + " KB");

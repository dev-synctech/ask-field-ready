import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGETS = [
  { id: "clip-orders-full-workflow", out: "orders-full-workflow-map.mp4" },
  { id: "clip-notes-where-write-sign", out: "notes-write-and-sign.mp4" },
  { id: "clip-smartlink-blank-or-wrong", out: "smarttools-smartlink-blank-wrong.mp4" },
];

const outDir = path.resolve(__dirname, "../../public/videos/mizly-clips");

console.log("Bundling...");
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});
console.log("Bundled.");

const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

for (const t of TARGETS) {
  console.log(`Rendering ${t.id}...`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: t.id,
    puppeteerInstance: browser,
  });
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: path.join(outDir, t.out),
    puppeteerInstance: browser,
    muted: true,
    concurrency: 2,
  });
  console.log(`✓ ${t.out}`);
}

await browser.close({ silent: false });
console.log("All done.");

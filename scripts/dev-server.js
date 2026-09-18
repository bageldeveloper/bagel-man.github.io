const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = 5500;
const host = "127.0.0.1";
const debugAds = process.env.DEBUG_ADS !== "false";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".webp": "image/webp"
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const requested = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  const resolved = path.resolve(root, `.${requested}`);
  return resolved.startsWith(`${root}${path.sep}`) || resolved === root ? resolved : null;
}

const server = http.createServer((request, response) => {
  let file = resolveRequestPath(request.url);
  if (!file) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }

  const extension = path.extname(file).toLowerCase();
  response.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");

  if (extension === ".html") {
    let html = fs.readFileSync(file, "utf8");
    if (debugAds) {
      html = html.replace(
        /<head(\s[^>]*)?>/i,
        match => `${match}\n<script>window.DEBUG_ADS = true;</script>`
      );
    }
    response.writeHead(200).end(html);
    return;
  }

  response.writeHead(200);
  fs.createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Bagel Comics dev server: http://localhost:${port}`);
  console.log(`Ad outlines: ${debugAds ? "on" : "off"} (set DEBUG_ADS=false to disable)`);
});

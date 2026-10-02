const ASSETS = __PUBLIC_ASSETS__;
const BINARY_ASSETS = __BINARY_ASSETS__;
const TYPES = {html:"text/html; charset=utf-8",css:"text/css; charset=utf-8",js:"text/javascript; charset=utf-8",mjs:"text/javascript; charset=utf-8",json:"application/json; charset=utf-8",webmanifest:"application/manifest+json; charset=utf-8",txt:"text/plain; charset=utf-8"};
function binaryResponse(request, path) {
  const encoded = BINARY_ASSETS[path];
  const raw = atob(encoded);
  const bytes = Uint8Array.from(raw, char => char.charCodeAt(0));
  const headers = new Headers({
    "content-type": path.endsWith(".mp4") ? "video/mp4" : path.endsWith(".png") ? "image/png" : "image/jpeg",
    "cache-control": "public, max-age=31536000, immutable",
    "accept-ranges": "bytes",
    "x-content-type-options": "nosniff",
  });
  let start = 0, end = bytes.length - 1, status = 200;
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) return new Response(null, { status: 416, headers: { "content-range": `bytes */${bytes.length}` } });
    if (match[1]) start = Number(match[1]);
    if (match[2]) end = Number(match[2]);
    if (!match[1] && match[2]) { start = Math.max(0, bytes.length - Number(match[2])); end = bytes.length - 1; }
    end = Math.min(end, bytes.length - 1);
    if (start > end || start >= bytes.length) return new Response(null, { status: 416, headers: { "content-range": `bytes */${bytes.length}` } });
    headers.set("content-range", `bytes ${start}-${end}/${bytes.length}`);
    status = 206;
  }
  headers.set("content-length", String(end - start + 1));
  return new Response(request.method === "HEAD" ? null : bytes.subarray(start, end + 1), { status, headers });
}

export default {
 async fetch(request){
  const path=new URL(request.url).pathname;
  if(request.method!=="GET"&&request.method!=="HEAD")return new Response(null,{status:405,headers:{allow:"GET, HEAD"}});
  if(path==="/100day"||path==="/100day/"&&!new URL(request.url).searchParams.has("embed"))return Response.redirect(new URL("/#journal",request.url),302);
  if(Object.hasOwn(BINARY_ASSETS,path))return binaryResponse(request,path);
  const content=Object.hasOwn(ASSETS,path)?ASSETS[path]:null;
  if(content===null)return new Response("Not found",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});
  const extension=path.split(".").pop();
  return new Response(request.method==="HEAD"?null:content,{headers:{"content-type":TYPES[extension]||TYPES.html,"cache-control":"no-cache","x-content-type-options":"nosniff"}});
 }
};

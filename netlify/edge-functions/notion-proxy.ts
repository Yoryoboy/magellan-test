export const config = { path: "/api/notion/*" };

export default async (request: Request): Promise<Response> => {
  const token =
    globalThis.Netlify?.env?.get("NOTION_API_KEY") ??
    globalThis.process?.env?.NOTION_API_KEY;

  if (!token) {
    return Response.json(
      { error: "NOTION_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const suffix = url.pathname.replace(/^\/api\/notion/, "");
  const upstream = `https://api.notion.com/v1${suffix}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Notion-Version", "2022-06-28");

  const method = request.method.toUpperCase();
  const body =
    method === "POST" || method === "PATCH" ? await request.text() : undefined;

  const upstreamResponse = await fetch(upstream, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

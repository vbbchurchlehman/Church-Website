export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const fileName = url.searchParams.get("file");

  if (!fileName) {
    return new Response("Missing file.", { status: 400 });
  }

  const object = await context.env.SERMONS_BUCKET.get(fileName);

  if (!object) {
    return new Response("File not found.", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "audio/mpeg",
      "Accept-Ranges": "bytes"
    }
  });
}

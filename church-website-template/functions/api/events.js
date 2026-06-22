export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare("SELECT * FROM events ORDER BY id DESC")
    .all();

  return Response.json(results);
}

export async function onRequestPost(context) {
  const data = await context.request.json();

  await context.env.DB
    .prepare(`
      INSERT INTO events (event_date, title, description)
      VALUES (?, ?, ?)
    `)
    .bind(data.event_date, data.title, data.description)
    .run();

  return Response.json({ success: true });
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  await context.env.DB
    .prepare("DELETE FROM events WHERE id = ?")
    .bind(id)
    .run();

  return Response.json({ success: true });
}

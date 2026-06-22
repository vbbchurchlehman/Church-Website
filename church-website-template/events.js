export async function onRequestGet(context) {
  await context.env.DB
    .prepare(`
      DELETE FROM events
      WHERE event_sort_date IS NOT NULL
      AND event_sort_date < date('now')
    `)
    .run();

  const { results } = await context.env.DB
    .prepare(`
      SELECT id, event_date, event_sort_date, title, description, created_at
      FROM events
      ORDER BY event_sort_date ASC, id ASC
    `)
    .all();

  return Response.json(results);
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    await context.env.DB
      .prepare(`
        INSERT INTO events (event_date, event_sort_date, title, description)
        VALUES (?, ?, ?, ?)
      `)
      .bind(data.event_date, data.event_sort_date, data.title, data.description)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const data = await context.request.json();

    await context.env.DB
      .prepare(`
        UPDATE events
        SET event_date = ?, event_sort_date = ?, title = ?, description = ?
        WHERE id = ?
      `)
      .bind(data.event_date, data.event_sort_date, data.title, data.description, data.id)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
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

export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare(`
      SELECT
        id,
        event_date,
        event_sort_date,
        event_end_date,
        event_time,
        event_end_time,
        recurrence_type,
        recurrence_weekday,
        title,
        description,
        image_url,
        created_at
      FROM events
      ORDER BY event_sort_date ASC, event_time ASC, id ASC
    `)
    .all();

  return Response.json(results);
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const eventDate = formData.get("event_date") || "";
    const eventSortDate = formData.get("event_sort_date") || "";
    const eventEndDate = formData.get("event_end_date") || "";
    const eventTime = formData.get("event_time") || "";
    const eventEndTime = formData.get("event_end_time") || "";
    const recurrenceType = formData.get("recurrence_type") || "";
    const recurrenceWeekday = formData.get("recurrence_weekday") || "";
    const title = formData.get("title") || "";
    const description = formData.get("description") || "";
    const imageFile = formData.get("event_image");

    let imageUrl = "";

    if (imageFile && imageFile.name) {
      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

      await context.env.EVENT_IMAGES_BUCKET.put(fileName, imageFile.stream(), {
        httpMetadata: {
          contentType: imageFile.type || "image/jpeg"
        }
      });

      imageUrl = `/api/event-image?file=${encodeURIComponent(fileName)}`;
    }

    await context.env.DB
      .prepare(`
        INSERT INTO events (
          event_date,
          event_sort_date,
          event_end_date,
          event_time,
          event_end_time,
          recurrence_type,
          recurrence_weekday,
          title,
          description,
          image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        eventDate,
        eventSortDate,
        eventEndDate,
        eventTime,
        eventEndTime,
        recurrenceType,
        recurrenceWeekday,
        title,
        description,
        imageUrl
      )
      .run();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function onRequestPut(context) {
  try {
    const formData = await context.request.formData();

    const id = formData.get("id");
    const eventDate = formData.get("event_date") || "";
    const eventSortDate = formData.get("event_sort_date") || "";
    const eventEndDate = formData.get("event_end_date") || "";
    const eventTime = formData.get("event_time") || "";
    const eventEndTime = formData.get("event_end_time") || "";
    const recurrenceType = formData.get("recurrence_type") || "";
    const recurrenceWeekday = formData.get("recurrence_weekday") || "";
    const title = formData.get("title") || "";
    const description = formData.get("description") || "";
    const imageFile = formData.get("event_image");

    const existingEvent = await context.env.DB
      .prepare("SELECT image_url FROM events WHERE id = ?")
      .bind(id)
      .first();

    let imageUrl = existingEvent?.image_url || "";

    if (imageFile && imageFile.name) {
      if (imageUrl) {
        const oldFileName = imageUrl.split("file=")[1];

        if (oldFileName) {
          await context.env.EVENT_IMAGES_BUCKET.delete(
            decodeURIComponent(oldFileName)
          );
        }
      }

      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

      await context.env.EVENT_IMAGES_BUCKET.put(fileName, imageFile.stream(), {
        httpMetadata: {
          contentType: imageFile.type || "image/jpeg"
        }
      });

      imageUrl = `/api/event-image?file=${encodeURIComponent(fileName)}`;
    }

    await context.env.DB
      .prepare(`
        UPDATE events
        SET
          event_date = ?,
          event_sort_date = ?,
          event_end_date = ?,
          event_time = ?,
          event_end_time = ?,
          recurrence_type = ?,
          recurrence_weekday = ?,
          title = ?,
          description = ?,
          image_url = ?
        WHERE id = ?
      `)
      .bind(
        eventDate,
        eventSortDate,
        eventEndDate,
        eventTime,
        eventEndTime,
        recurrenceType,
        recurrenceWeekday,
        title,
        description,
        imageUrl,
        id
      )
      .run();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  const event = await context.env.DB
    .prepare("SELECT image_url FROM events WHERE id = ?")
    .bind(id)
    .first();

  if (event?.image_url) {
    const fileName = event.image_url.split("file=")[1];

    if (fileName) {
      await context.env.EVENT_IMAGES_BUCKET.delete(
        decodeURIComponent(fileName)
      );
    }
  }

  await context.env.DB
    .prepare("DELETE FROM events WHERE id = ?")
    .bind(id)
    .run();

  return Response.json({ success: true });
}

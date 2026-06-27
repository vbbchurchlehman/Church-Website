export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare(`
      SELECT id, sermon_title, sermon_date, speaker, service, mp3_url, created_at
      FROM sermons
      ORDER BY sermon_date DESC, id DESC
    `)
    .all();

  return Response.json(results);
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const sermonTitle = formData.get("sermon_title");
    const sermonDate = formData.get("sermon_date");
    const speaker = formData.get("speaker");
    const service = formData.get("service");
    const mp3File = formData.get("mp3_file");

    if (!sermonTitle || !sermonDate || !speaker || !service || !mp3File) {
      return Response.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${mp3File.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

    await context.env.SERMONS_BUCKET.put(fileName, mp3File.stream(), {
      httpMetadata: {
        contentType: mp3File.type || "audio/mpeg"
      }
    });

    const mp3Url = `/api/sermon-audio?file=${encodeURIComponent(fileName)}`;

    await context.env.DB
      .prepare(`
        INSERT INTO sermons (sermon_title, sermon_date, speaker, service, mp3_url)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(sermonTitle, sermonDate, speaker, service, mp3Url)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  const sermon = await context.env.DB
    .prepare("SELECT mp3_url FROM sermons WHERE id = ?")
    .bind(id)
    .first();

  if (sermon?.mp3_url) {
    const fileName = sermon.mp3_url.split("file=")[1];

    if (fileName) {
      await context.env.SERMONS_BUCKET.delete(decodeURIComponent(fileName));
    }
  }

  await context.env.DB
    .prepare("DELETE FROM sermons WHERE id = ?")
    .bind(id)
    .run();

  return Response.json({ success: true });
}

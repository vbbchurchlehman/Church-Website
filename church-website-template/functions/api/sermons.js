function getBucketFileName(mp3Url) {
  if (!mp3Url) return null;

  try {
    const url = new URL(mp3Url, "https://placeholder.local");
    const fileName = url.searchParams.get("file");

    return fileName ? decodeURIComponent(fileName) : null;
  } catch {
    return null;
  }
}

async function uploadMp3(context, mp3File) {
  const safeOriginalName = mp3File.name.replace(
    /[^a-zA-Z0-9.-]/g,
    "-"
  );

  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeOriginalName}`;

  await context.env.SERMONS_BUCKET.put(
    fileName,
    mp3File.stream(),
    {
      httpMetadata: {
        contentType: mp3File.type || "audio/mpeg"
      }
    }
  );

  return {
    fileName,
    mp3Url: `/api/sermon-audio?file=${encodeURIComponent(fileName)}`
  };
}

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB
      .prepare(`
        SELECT
          id,
          sermon_title,
          sermon_date,
          speaker,
          service,
          scripture_passage,
          mp3_url,
          created_at
        FROM sermons
        ORDER BY sermon_date DESC, id DESC
      `)
      .all();

    return Response.json(results);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}

export async function onRequestPost(context) {
  let uploadedFileName = null;

  try {
    const formData = await context.request.formData();

    const sermonTitle = String(
      formData.get("sermon_title") || ""
    ).trim();

    const sermonDate = String(
      formData.get("sermon_date") || ""
    ).trim();

    const speaker = String(
      formData.get("speaker") || ""
    ).trim();

    const service = String(
      formData.get("service") || ""
    ).trim();

    const scripturePassage = String(
      formData.get("scripture_passage") || ""
    ).trim();

    const mp3File = formData.get("mp3_file");

    if (
      !sermonTitle ||
      !sermonDate ||
      !speaker ||
      !service ||
      !scripturePassage ||
      !(mp3File instanceof File) ||
      mp3File.size === 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields."
        },
        {
          status: 400
        }
      );
    }

    const upload = await uploadMp3(context, mp3File);

    uploadedFileName = upload.fileName;

    await context.env.DB
      .prepare(`
        INSERT INTO sermons
        (
          sermon_title,
          sermon_date,
          speaker,
          service,
          scripture_passage,
          mp3_url
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        sermonTitle,
        sermonDate,
        speaker,
        service,
        scripturePassage,
        upload.mp3Url
      )
      .run();

    return Response.json({
      success: true
    });
  } catch (error) {
    // Remove the uploaded file if the database insert failed.
    if (uploadedFileName) {
      try {
        await context.env.SERMONS_BUCKET.delete(uploadedFileName);
      } catch {
        // Do not replace the original error.
      }
    }

    return Response.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}

export async function onRequestPut(context) {
  let newUploadedFileName = null;

  try {
    const formData = await context.request.formData();

    const id = String(
      formData.get("id") || ""
    ).trim();

    const sermonTitle = String(
      formData.get("sermon_title") || ""
    ).trim();

    const sermonDate = String(
      formData.get("sermon_date") || ""
    ).trim();

    const speaker = String(
      formData.get("speaker") || ""
    ).trim();

    const service = String(
      formData.get("service") || ""
    ).trim();

    const scripturePassage = String(
      formData.get("scripture_passage") || ""
    ).trim();

    const mp3File = formData.get("mp3_file");

    if (
      !id ||
      !sermonTitle ||
      !sermonDate ||
      !speaker ||
      !service ||
      !scripturePassage
    ) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields."
        },
        {
          status: 400
        }
      );
    }

    const existingSermon = await context.env.DB
      .prepare(`
        SELECT id, mp3_url
        FROM sermons
        WHERE id = ?
      `)
      .bind(id)
      .first();

    if (!existingSermon) {
      return Response.json(
        {
          success: false,
          error: "Sermon not found."
        },
        {
          status: 404
        }
      );
    }

    let mp3Url = existingSermon.mp3_url;
    let oldFileName = null;

    const hasNewMp3 =
      mp3File instanceof File &&
      mp3File.size > 0;

    if (hasNewMp3) {
      const upload = await uploadMp3(context, mp3File);

      newUploadedFileName = upload.fileName;
      mp3Url = upload.mp3Url;
      oldFileName = getBucketFileName(existingSermon.mp3_url);
    }

    await context.env.DB
      .prepare(`
        UPDATE sermons
        SET
          sermon_title = ?,
          sermon_date = ?,
          speaker = ?,
          service = ?,
          scripture_passage = ?,
          mp3_url = ?
        WHERE id = ?
      `)
      .bind(
        sermonTitle,
        sermonDate,
        speaker,
        service,
        scripturePassage,
        mp3Url,
        id
      )
      .run();

    // Delete the old MP3 only after the database update succeeds.
    if (
      hasNewMp3 &&
      oldFileName &&
      oldFileName !== newUploadedFileName
    ) {
      try {
        await context.env.SERMONS_BUCKET.delete(oldFileName);
      } catch {
        // The sermon was updated successfully, so do not fail the request
        // solely because the old file could not be removed.
      }
    }

    return Response.json({
      success: true
    });
  } catch (error) {
    // Remove the new file if the update failed.
    if (newUploadedFileName) {
      try {
        await context.env.SERMONS_BUCKET.delete(
          newUploadedFileName
        );
      } catch {
        // Do not replace the original error.
      }
    }

    return Response.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}

export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Missing sermon ID."
        },
        {
          status: 400
        }
      );
    }

    const sermon = await context.env.DB
      .prepare(`
        SELECT id, mp3_url
        FROM sermons
        WHERE id = ?
      `)
      .bind(id)
      .first();

    if (!sermon) {
      return Response.json(
        {
          success: false,
          error: "Sermon not found."
        },
        {
          status: 404
        }
      );
    }

    await context.env.DB
      .prepare(`
        DELETE FROM sermons
        WHERE id = ?
      `)
      .bind(id)
      .run();

    const fileName = getBucketFileName(sermon.mp3_url);

    if (fileName) {
      try {
        await context.env.SERMONS_BUCKET.delete(fileName);
      } catch {
        // The database record is already deleted.
      }
    }

    return Response.json({
      success: true
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}


import { DialogueBoxScene } from "@/lib/types";
import { isDatabaseUuid } from "@/lib/isDatabaseUuid";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { getPlayableStorageObjectUrl } from "@/lib/supabaseStoragePlayableUrl";
import { concatenateMp3Buffers } from "@/lib/audio/concatenate-mp3-ffmpeg";

const AUDIO_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "audio";

const extractStoragePathFromAudioUrl = (audioUrl: string, bucket: string): string | null => {
  try {
    const url = new URL(audioUrl);
    const decodedPath = decodeURIComponent(url.pathname);
    const signPrefix = `/storage/v1/object/sign/${bucket}/`;
    const publicPrefix = `/storage/v1/object/public/${bucket}/`;

    if (decodedPath.startsWith(signPrefix)) {
      return decodedPath.slice(signPrefix.length);
    }
    if (decodedPath.startsWith(publicPrefix)) {
      return decodedPath.slice(publicPrefix.length);
    }
    return null;
  } catch {
    return null;
  }
};

export async function generateCompleteAudio(
  dialogue_boxes_scenes: DialogueBoxScene[],
  parsedScreenplayId: string,
) {
  if (dialogue_boxes_scenes == null) {
    return { audio_url: "", error: "No dialogue boxes scenes provided." };
  }
  if (parsedScreenplayId == null || parsedScreenplayId.trim() === "") {
    return { audio_url: "", error: "No parsed screenplay id provided." };
  }
  if (!isDatabaseUuid(parsedScreenplayId)) {
    return { audio_url: "", error: "Parsed screenplay id must be a uuid." };
  }

  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return { audio_url: "", error: "Supabase is not configured." };
    }

    const sceneAudioUrls = dialogue_boxes_scenes
      .map((scene) => scene.audio_url?.trim())
      .filter((url): url is string => Boolean(url));
    if (sceneAudioUrls.length === 0) {
      return { audio_url: "", error: "No scene audio URLs found to build complete audio." };
    }

    const audioBuffers: Buffer[] = [];
    for (const audioUrl of sceneAudioUrls) {
      const storagePath = extractStoragePathFromAudioUrl(audioUrl, AUDIO_BUCKET);
      if (!storagePath) {
        console.warn("Skipping non-storage audio URL while building complete audio:", audioUrl);
        continue;
      }

      const { data: audioFile, error: downloadError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .download(storagePath);

      if (downloadError) {
        console.error("Failed to download scene audio:", storagePath, downloadError);
        return { audio_url: "", error: `Failed to download scene audio (${storagePath}).` };
      }
      const arrayBuffer = await audioFile.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    if (audioBuffers.length === 0) {
      return { audio_url: "", error: "No downloadable Supabase audio files were found." };
    }

    const mergedBuffer = await concatenateMp3Buffers(audioBuffers);

    const filePath = `${parsedScreenplayId}/complete-${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage.from(AUDIO_BUCKET).upload(filePath, mergedBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (uploadError) {
      console.error("Supabase complete-audio upload failed:", uploadError.message);
      return { audio_url: "", error: `Failed to upload complete audio: ${uploadError.message}` };
    }

    const playableUrl = (await getPlayableStorageObjectUrl(supabase, AUDIO_BUCKET, filePath)) ?? "";
    if (!playableUrl) {
      return { audio_url: "", error: "Could not resolve playable URL for complete audio." };
    }

    return { audio_url: playableUrl, error: null };
  } catch (error) {
    console.error("Failed to generate complete audio:", error);
    const message = error instanceof Error ? error.message : "Failed to generate complete audio.";
    const normalized =
      message.includes("ENOENT") || message.includes("not recognized")
        ? "ffmpeg is not installed or not available on PATH."
        : message;
    return { audio_url: "", error: normalized };
  }
}

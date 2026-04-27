import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const runFfmpeg = (args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr || `ffmpeg failed with exit code ${code ?? "unknown"}`));
    });
  });

export async function POST(req: Request) {
  const { urls } = (await req.json()) as { urls?: unknown };
  if (!Array.isArray(urls) || urls.length === 0 || urls.some((url) => typeof url !== "string")) {
    return NextResponse.json({ error: "Please provide an array of MP3 URLs." }, { status: 400 });
  }

  let tempDir = "";
  try {
    tempDir = await mkdtemp(join(tmpdir(), "concat-"));
    const inputFiles: string[] = [];

    for (let i = 0; i < urls.length; i += 1) {
      const sourceUrl = urls[i] as string;
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to download source audio at index ${i}.` },
          { status: 400 },
        );
      }

      const inputPath = join(tempDir, `input-${i}.mp3`);
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      await writeFile(inputPath, audioBuffer);
      inputFiles.push(inputPath);
    }

    const listPath = join(tempDir, "list.txt");
    const listFile = inputFiles
      .map((filePath) => `file '${filePath.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
      .join("\n");
    await writeFile(listPath, listFile, "utf8");

    const outputPath = join(tempDir, "output.mp3");
    await runFfmpeg(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outputPath]);

    const outputBuffer = await readFile(outputPath);
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="output.mp3"',
        "Content-Length": String(outputBuffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Concatenation failed.";
    const normalizedMessage =
      message.includes("ENOENT") || message.includes("not recognized")
        ? "ffmpeg is not installed or not available on PATH."
        : message;
    console.error("Concatenation error:", error);
    return NextResponse.json({ error: normalizedMessage }, { status: 500 });
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}

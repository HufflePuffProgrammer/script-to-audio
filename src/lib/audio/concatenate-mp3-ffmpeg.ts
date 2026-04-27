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

/** Concatenate MP3 byte buffers in order using ffmpeg (stream copy). */
export async function concatenateMp3Buffers(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error("No MP3 buffers to concatenate.");
  }

  const tempDir = await mkdtemp(join(tmpdir(), "concat-mp3-"));
  try {
    const inputPaths: string[] = [];
    for (let i = 0; i < buffers.length; i += 1) {
      const inputPath = join(tempDir, `input-${i}.mp3`);
      await writeFile(inputPath, buffers[i]);
      inputPaths.push(inputPath);
    }

    const listPath = join(tempDir, "list.txt");
    const listContent = inputPaths
      .map((filePath) => `file '${filePath.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
      .join("\n");
    await writeFile(listPath, listContent, "utf8");

    const outputPath = join(tempDir, "output.mp3");
    await runFfmpeg(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outputPath]);

    return await readFile(outputPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

import { NextResponse } from "next/server";
import { spawn } from "node:child_process";

const runFfmpegVersion = () =>
  new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn("ffmpeg", ["-version"], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(stderr || `ffmpeg exited with code ${code ?? "unknown"}`));
    });
  });

export async function GET() {
  try {
    const { stdout } = await runFfmpegVersion();
    const firstLine = stdout.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
    return NextResponse.json(
      {
        ok: true,
        available: true,
        versionLine: firstLine,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const installHint =
      message.includes("ENOENT") || message.includes("not recognized")
        ? "ffmpeg is not installed or not available on PATH."
        : message;

    return NextResponse.json(
      {
        ok: false,
        available: false,
        error: installHint,
      },
      { status: 503 },
    );
  }
}

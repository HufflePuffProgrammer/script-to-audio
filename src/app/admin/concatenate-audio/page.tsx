
"use client";

import { FormEvent, useState } from "react";
export default function TestConcatenate() {
    const [audioStatus, setAudioStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const API_URL = "/api/admin/concatenate-audio";
    const urls = [
        'https://lzaplxpcapdkbfbedtks.supabase.co/storage/v1/object/sign/audio/4cd6e0ec-ed74-406a-8649-8aca9d60c1c2/1777259743387.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjA5N2VjNC05YTA2LTRlNzEtODdlMi05NjY0NTM2MTJjOWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby80Y2Q2ZTBlYy1lZDc0LTQwNmEtODY0OS04YWNhOWQ2MGMxYzIvMTc3NzI1OTc0MzM4Ny5tcDMiLCJpYXQiOjE3NzcyNTk3NDQsImV4cCI6MTc3Nzg2NDU0NH0.fYRtW_1XiIJFAOfO8fM8MGppSPvYt7T8BATtY97Bl0M',
        'https://lzaplxpcapdkbfbedtks.supabase.co/storage/v1/object/sign/audio/2edb162e-4daa-48be-8684-152ae63b30f5/1777259738961.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjA5N2VjNC05YTA2LTRlNzEtODdlMi05NjY0NTM2MTJjOWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby8yZWRiMTYyZS00ZGFhLTQ4YmUtODY4NC0xNTJhZTYzYjMwZjUvMTc3NzI1OTczODk2MS5tcDMiLCJpYXQiOjE3NzcyNTk3MzksImV4cCI6MTc3Nzg2NDUzOX0.-czzh7wtZ3nFKNlCSXnyIh12fAZhaO6YtlmBBkfFmm0',
        'https://lzaplxpcapdkbfbedtks.supabase.co/storage/v1/object/sign/audio/42832293-54af-4396-a4ed-7fc68d37a767/1777259714951.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjA5N2VjNC05YTA2LTRlNzEtODdlMi05NjY0NTM2MTJjOWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby80MjgzMjI5My01NGFmLTQzOTYtYTRlZC03ZmM2OGQzN2E3NjcvMTc3NzI1OTcxNDk1MS5tcDMiLCJpYXQiOjE3NzcyNTk3MTYsImV4cCI6MTc3Nzg2NDUxNn0.4H7mNbFGMUP-AxXkoasN8Kk97g2rXbfJqukVyj5rdM8',
    ];
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setAudioStatus("loading");
            setAudioUrl(null);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urls: urls,
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: response.statusText }));
                setAudioStatus("error");
                throw new Error((err as { error?: string }).error ?? "Concatenation failed");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioStatus("ready");

            // const a = document.createElement('a');
            // a.href = url;
            // a.download = 'output.mp3';
            // a.click();
        } catch {
            setAudioStatus("error");
        }
    };

    return (
        <main className="min-h-screen bg-[#f4f6fb]">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
                <header className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Admin: Build Audio Per Dialogue Box</h1>
                </header>

                <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10"></div>
                <form className="space-y-4" onSubmit={handleSubmit}>

                    <h1 className="text-gray-800">Concatenate Hard Coded Audio</h1>
                    <p className="text-xs text-gray-600">This is a test of the concatenate function.</p>
                    <p className="text-xs text-gray-600">The function will concatenate the scene audio files in the order they are provided.</p>
                    <p className="text-xs text-gray-600">Returns a single audio file.</p>

                    <div className="space-y-6">

                    <section key="concatenated-audio" className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Concatenated Audio</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                        <div
                            key="concatenated-audio" 
                            className="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-900">
                                    <span className="text-xs text-slate-500">scene ID:</span><br />Scene
                                </p>
                                <span className="text-xs text-slate-500">Complete Audio</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={audioStatus === "loading"}
                                    className="rounded-full bg-[#f9cf00] px-3 py-1 text-xs font-semibold text-[#1b1b1b] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {audioStatus === "loading" ? "Generating..." : "Generate audio"}
                                </button>
                                {audioStatus === "error" && (
                                    <span className="text-xs text-red-600">Failed. Retry.</span>
                                )}
                            </div>

                            {audioUrl && (
                                <audio
                                    key={audioUrl}
                                    controls
                                    className="mt-2 w-full"
                                    crossOrigin="anonymous"
                                >
                                    <source src={audioUrl} type="audio/mpeg" />
                                </audio>
                            )}
                        </div>
                    </div>
                    </section>
                    </div>
                </form>
            </div>
        </main>
    )

}


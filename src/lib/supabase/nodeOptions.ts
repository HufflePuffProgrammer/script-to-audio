import ws from "ws";

type NodeAuthOptions = {
  autoRefreshToken?: boolean;
  persistSession?: boolean;
};

/** Supabase client options for Node.js (< 22) where WebSocket is not built in. */
export function nodeSupabaseOptions(auth?: NodeAuthOptions) {
  return {
    ...(auth ? { auth } : {}),
    realtime: {
      // ws matches RealtimeClient transport at runtime; types differ from browser WebSocket.
      transport: ws as unknown as typeof WebSocket,
    },
  };
}

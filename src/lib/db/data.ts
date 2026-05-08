

import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export async function getScreenplayData(screenplayId: string): Promise<Screenplay | null>{


    const serverClient = getSupabaseAdminClient();
    if (!serverClient){
        throw new Error("Supabase admin client not found");
        return null;
    }
    const { data: screenplayData, error: screenplayError} = await serverClient
    .from("screenplays")
    .select("id, title, raw_text, created_at")
    .eq("id", screenplayId)
    .single();
    if (screenplayError){
        throw new Error("Failed to get screenplay data");
        return null;
    }
    return {
        id: screenplayData.id,
        title: screenplayData.title,
        raw_text: screenplayData.raw_text,
        created_at: screenplayData.created_at,
    };

}
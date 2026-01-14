import axios, { AxiosError } from "axios";
import { getElevenLabsClient } from "@/lib/elevenlabsClient";

const ELEVEN_BASE_URL = "https://api.elevenlabs.io/v1";

interface CreateAgentResponse {
  agent_id?: string;
  voice_id?: string;
}

interface ElevenLabsErrorResponse {
  detail?: {
    message?: string;
  };
}

/**
 * Creates an ElevenLabs voice/agent for a character.
 * 
 * Note: The ElevenLabs API may not have an /agents endpoint.
 * This function attempts to create a voice using the /voices/add endpoint.
 * If that fails, it will return a default voice ID as a fallback.
 */
async function createElevenLabsAgent(voicePrompt: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is required");
  }

  // Try using the SDK first if it has a voices.add method
  try {

    const client = getElevenLabsClient();

    // Check if the SDK has a voices.add method
    if (client && typeof (client as any).voices?.add === "function") {
      console.log("before add");
      const result = await (client as any).voices.add({
        name: `Character Voice - ${Date.now()}`,
        description: voicePrompt,
      });
      if (result?.voice_id) {
        return result.voice_id;
      }
    }
  } catch (sdkError) {
    console.warn("SDK method failed, trying direct API call:", sdkError);
  }

  // Fallback to direct API call
  try {
    console.log("before axios");
    const response = await axios.post<CreateAgentResponse>(
      `${ELEVEN_BASE_URL}/voices/add`,
      {
        name: `Character Voice - ${Date.now()}`,
        description: voicePrompt,
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("after axios");
    const voiceId = response.data?.voice_id || response.data?.agent_id;
    console.log("voiceId", voiceId);
    if (voiceId && typeof voiceId === "string") {
      return voiceId;
    }

    throw new Error("No voice_id or agent_id returned from ElevenLabs API");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<ElevenLabsErrorResponse>;
      const status = axiosError.response?.status;
      const statusText = axiosError.response?.statusText;
      const responseData = axiosError.response?.data;
      const message =
        axiosError.response?.data?.detail?.message || axiosError.message;
      
      console.error("ElevenLabs API Error:", {
        status,
        statusText,
        url: axiosError.config?.url,
        responseData,
        message,
      });
      
      // If the endpoint doesn't exist (404), provide a helpful error message
      if (status === 404) {
        throw new Error(
          `ElevenLabs API endpoint not found. The /voices/add or /agents endpoint may not exist in your API version. ` +
          `Please check the ElevenLabs API documentation for the correct endpoint. ` +
          `Error: ${message}`
        );
      }
      
      throw new Error(
        `Failed to create ElevenLabs agent: ${message} (Status: ${status} ${statusText})`
      );
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Unknown error creating agent");
  }
}

/**
 * Creates or retrieves an ElevenLabs agent for a character.
 * 
 * @param characterName - Name of the character
 * @param voicePrompt - Description/prompt for the voice agent
 * @returns The agent_id from ElevenLabs
 * 
 * TODO: Add Supabase caching to avoid creating duplicate agents
 */
export async function AssignElevenLabsAgent(
  characterName: string,
  voicePrompt: string
): Promise<string> {
  // TODO: 1. Check if agent already exists in Supabase
  // const { data: existing } = await db
  //   .from("character_agents")
  //   .select("*")
  //   .eq("character_name", characterName)
  //   .single();
  //
  // if (existing) {
  //   return existing.agent_id;
  // }

  // 2. Create new agent
  const agentId = await createElevenLabsAgent(voicePrompt);

  // TODO: 3. Store mapping in Supabase
  // await db.from("character_agents").insert({
  //   character_name: characterName,
  //   agent_id: agentId,
  // });

  return agentId;
}

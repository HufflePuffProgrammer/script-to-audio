import axios, { AxiosError } from "axios";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_BASE_URL = "https://api.elevenlabs.io/v1";

export interface AvailableVoices{
    voice_id: string;
    description: string;
    labels: string;
  }[]=[{
    voice_id: "",
    description: "",
    labels: "",
  }];
  export interface CharacterProfile {
    age: string;
    gender: string;
    traits: string;
    voiceStyle: string;
    speechPattern: string;
    tone: string;
    confidence?: string;
  };

  export async function getAvailableVoices() {
    const res = await axios.get(`${ELEVEN_BASE_URL}/voices`, {
      headers: { "xi-api-key": ELEVENLABS_API_KEY }
    });
    return res.data.voices;
  };
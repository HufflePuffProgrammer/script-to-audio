import axios, { AxiosError } from "axios";
import { AvailableVoices } from "@/lib/types";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_BASE_URL = "https://api.elevenlabs.io/v1";



  export async function getAvailableVoices() {
    const res = await axios.get(`${ELEVEN_BASE_URL}/voices`, {
      headers: { "xi-api-key": ELEVENLABS_API_KEY }
    });
    return res.data.voices as AvailableVoices;
  };
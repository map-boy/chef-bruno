import * as functions from "firebase-functions/v2/https";

export const createDailyRoom = functions.onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const DAILY_API_KEY = process.env.DAILY_API_KEY || "";
    if (!DAILY_API_KEY) {
      res.status(500).json({ error: "Missing DAILY_API_KEY in environment" });
      return;
    }
    try {
      const roomName = `chef-bruno-${Date.now()}`;
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            start_video_off: false,
            start_audio_off: false,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        res.status(500).json({ error: data });
        return;
      }
      res.status(200).json({ roomName: data.name, roomUrl: data.url });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  }
);
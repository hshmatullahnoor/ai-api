import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = "https://g4f.space/api/ollama.pro";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "direct-endpoint-api" });
});

app.get("/api/models", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${BASE_URL}/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();
    res.status(response.status).type("application/json").send(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  model?: string;
  messages?: ChatMessage[];
};

app.post("/api/chat", async (req: Request<unknown, unknown, ChatRequestBody>, res: Response) => {
  try {
    const model = req.body.model ?? "gpt-oss:120b";
    const messages = req.body.messages ?? [{ role: "user", content: "Hello!" }];

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages })
    });

    const text = await response.text();
    res.status(response.status).type("application/json").send(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});

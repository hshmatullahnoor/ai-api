const API_BASE = "http://localhost:3000/api";

type ChatChoice = {
  message?: {
    content?: string;
  };
};

type ChatResponse = {
  choices?: ChatChoice[];
};

const resultEl = document.getElementById("result");
const modelsEl = document.getElementById("models");

function setText(el: HTMLElement | null, value: string): void {
  if (el) {
    el.textContent = value;
  }
}

async function loadModels(): Promise<void> {
  const response = await fetch(`${API_BASE}/models`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Models request failed: ${response.status}`);
  }

  const data = await response.json() as unknown;
  setText(modelsEl, JSON.stringify(data, null, 2));
}

async function sendHello(): Promise<void> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-oss:120b",
      messages: [{ role: "user", content: "Hello!" }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Chat request failed: ${response.status} - ${errText}`);
  }

  const data = await response.json() as ChatResponse;
  const content = data.choices?.[0]?.message?.content ?? "No response";
  setText(resultEl, content);
}

async function init(): Promise<void> {
  setText(resultEl, "Loading...");
  setText(modelsEl, "Loading models...");

  try {
    await loadModels();
    await sendHello();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    setText(resultEl, `Error: ${message}`);
  }
}

void init();

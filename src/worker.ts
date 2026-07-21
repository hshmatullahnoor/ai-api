interface Env {
  UPSTREAM_BASE_URL: string;
  DEFAULT_MODEL: string;
  G4F_SESSION?: string;
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  model?: string;
  messages?: ChatMessage[];
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

function upstreamUrl(env: Env, path: string): string {
  return `${env.UPSTREAM_BASE_URL}${path}`;
}

function getUpstreamHeaders(request: Request, env: Env): HeadersInit {
  const incomingAuth = request.headers.get("Authorization");
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (incomingAuth) {
    headers.Authorization = incomingAuth;
  } else if (env.G4F_SESSION) {
    headers.Authorization = `Bearer ${env.G4F_SESSION}`;
  }
  return headers;
}

async function proxyModels(request: Request, env: Env): Promise<Response> {
  const response = await fetch(upstreamUrl(env, "/models"), {
    method: "GET",
    headers: getUpstreamHeaders(request, env)
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

async function proxyChat(request: Request, env: Env): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const payload = {
    model: body.model ?? env.DEFAULT_MODEL,
    messages: body.messages ?? [{ role: "user", content: "Hello!" }]
  };

  const response = await fetch(upstreamUrl(env, "/chat/completions"), {
    method: "POST",
    headers: getUpstreamHeaders(request, env),
    body: JSON.stringify(payload)
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        return jsonResponse({ ok: true, service: "direct-endpoint-api" });
      }

      if (request.method === "GET" && url.pathname === "/api/models") {
        return await proxyModels(request, env);
      }

      if (request.method === "POST" && url.pathname === "/api/chat") {
        return await proxyChat(request, env);
      }

      return jsonResponse({ error: "Not Found" }, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ error: message }, 500);
    }
  }
};

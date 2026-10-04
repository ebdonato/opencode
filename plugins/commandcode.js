import fs from "node:fs/promises";
import path from "node:path";

export default function commandCodeSyncPlugin() {
  return {
    name: "commandcode-sync",
    async config(config) {
      const apiKey = process.env.CMD_API_KEY;
      if (!apiKey || !config.provider?.commandcode) return;

      const baseURL =
        config.provider.commandcode.options?.baseURL ||
        "https://api.commandcode.ai/provider/v1";

      try {
        const res = await fetch(`${baseURL}/models`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!res.ok) {
          console.error(`[commandcode-sync] API Error: ${res.status} ${res.statusText}`);
          return;
        }

        const { data = [] } = await res.json();
        if (!data.length) return;

        const dynamicModels = {};
        for (const item of data) {
          dynamicModels[item.id] = {
            name: item.name || item.id,
            context: item.context_length || 128000,
          };
        }

        // 1. Inject in-memory so OpenCode displays them in /models immediately
        config.provider.commandcode.models = {
          ...(config.provider.commandcode.models || {}),
          ...dynamicModels,
        };

        // 2. (Optional) Persist changes back to opencode.json on disk
        const configPath = path.resolve(process.cwd(), "opencode.json");
        try {
          const raw = await fs.readFile(configPath, "utf-8");
          const parsed = JSON.parse(raw);
          if (parsed.provider?.commandcode) {
            parsed.provider.commandcode.models = config.provider.commandcode.models;
            await fs.writeFile(configPath, JSON.stringify(parsed, null, 2), "utf-8");
          }
        } catch {
          // Fallback if opencode.json is not in the current working directory
        }
      } catch (err) {
        console.error("[commandcode-sync] Hook failed:", err.message);
      }
    },
  };
}
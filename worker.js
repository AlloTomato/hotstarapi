export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      const SOURCE_URL = env.SOURCE_URL || "https://netx.streamstar18.workers.dev/hot2";

      // Fetch playlist
      const response = await fetch(SOURCE_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      let text = await response.text();

      // =========================
      // REMOVE TELEGRAM BLOCK
      // =========================
      const lines = text.split("\n");

      let cleaned = [];
      let skipBlock = false;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.includes("Join Telegram")) {
          skipBlock = true;
          continue;
        }

        if (skipBlock) {
          skipBlock = false;
          continue;
        }

        cleaned.push(line);
      }

      let cleanedText = cleaned.join("\n");

      // =========================
      // MODIFY group-title
      // =========================
      cleanedText = cleanedText.replace(
        /group-title="([^"]*)"/g,
        (match, p1) => `group-title="Hotstar-${p1}"`
      );

      // =========================
      // /cookie ROUTE
      // =========================
      if (url.pathname === "/cookie") {

        const allLines = cleanedText.split("\n");

        let extinfCount = 0;
        let cookieValue = "Not Found";

        for (let i = 0; i < allLines.length; i++) {

          if (allLines[i].startsWith("#EXTINF")) {
            extinfCount++;
          }

          if (extinfCount === 3 && allLines[i].includes("#EXTHTTP")) {
            const match = allLines[i].match(/"cookie":"([^"]+)"/);
            if (match) {
              cookieValue = match[1];
              break;
            }
          }
        }

        return new Response(cookieValue, {
          headers: {
            "Content-Type": "text/plain"
          }
        });
      }

      // =========================
      // DEFAULT ROUTE (/)
      // =========================
      return new Response(cleanedText, {
        headers: {
          // ✅ This makes it OPEN in browser (not download)
          "Content-Type": "text/plain; charset=utf-8"
        }
      });

    } catch (err) {
      return new Response("Error: " + err.message);
    }
  }
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    const method = request.method;

    if (path === "api/sleep" && method === "POST") {
      try {
        const body = await request.json();
        const originalUrl = body.url;

        if (!originalUrl) return new Response("URL required", { status: 400 });

        const zzzCode = encodeZzz(originalUrl);
        const fullShortUrl = `${url.origin}/${zzzCode}`;

        return Response.json({ status: "success", result: fullShortUrl });

      } catch (e) {
        return Response.json({ status: "error", message: e.message }, { status: 500 });
      }
    }

    if (path === "") {
      return new Response(renderHome(), {
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }

    if (path === "favicon.ico") return new Response(null, { status: 204 });
    if (path === "robots.txt") return new Response("User-agent: *\nDisallow: /", { headers: {"content-type":"text/plain"} });

    try {
      const targetUrl = decodeZzz(path);
      return Response.redirect(targetUrl, 301);
    } catch (err) {
      return new Response(renderError(), { status: 404, headers: { "content-type": "text/html" } });
    }
  },
};

function encodeZzz(text) {
  let binary = "";
  for (let i = 0; i < text.length; i++) {
    binary += text.charCodeAt(i).toString(2).padStart(8, '0');
  }
  return binary.replace(/0/g, 'z').replace(/1/g, 'Z');
}

function decodeZzz(zzzString) {
  if (/[^zZ]/.test(zzzString)) throw new Error("Invalid characters");
  const binary = zzzString.replace(/z/g, "0").replace(/Z/g, "1");
  if (binary.length % 8 !== 0) throw new Error("Invalid length");

  let output = "";
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    output += String.fromCharCode(parseInt(byte, 2));
  }

  if (output.toLowerCase().trim().startsWith("javascript:")) throw new Error("Script injection");
  if (!/^https?:\/\//i.test(output)) output = "https://" + output;
  return output;
}

function renderHome() {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zzz. API Mode</title>
    <style>
        * { box-sizing: border-box; }
        body {
            background-color: #E0E7FF; color: #000;
            font-family: 'Inter', sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 100vh; margin: 0; padding: 20px;
        }
        .card {
            background: #fff; border: 3px solid #000; box-shadow: 8px 8px 0px #000;
            padding: 40px; width: 100%; max-width: 500px; border-radius: 0;
        }
        h1 { font-weight: 900; font-size: 2.5rem; margin: 0 0 10px 0; text-transform: uppercase; line-height: 1; }
        p { font-size: 1.1rem; margin-bottom: 30px; font-weight: 500; color: #444; }
        input {
            width: 100%; padding: 15px; font-size: 1rem; border: 3px solid #000;
            background: #f4f4f5; margin-bottom: 20px; font-weight: bold; outline: none;
        }
        input:focus { background: #fff; box-shadow: 4px 4px 0px #000; transform: translate(-2px, -2px); }
        button {
            width: 100%; padding: 15px; font-size: 1.2rem; font-weight: 900;
            text-transform: uppercase; background-color: #A3E635; border: 3px solid #000;
            cursor: pointer; box-shadow: 4px 4px 0px #000; transition: all 0.1s ease;
        }
        button:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #000; }
        button:active { transform: translate(2px, 2px); box-shadow: 0px 0px 0px #000; }
        button:disabled { background-color: #ccc; cursor: not-allowed; }
        
        .result-box {
            margin-top: 30px; padding: 20px; border: 3px solid #000;
            background: #FEF3C7; display: none; word-break: break-all;
        }
        .link { font-family: monospace; font-size: 1.1rem; color: #000; text-decoration: underline; font-weight: bold; }
        .footer { margin-top: 40px; font-weight: 700; font-size: 0.8rem; opacity: 0.5; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Tidurkan Link.</h1>
        <p>Powered by Hidden API Logic.</p>

        <input type="text" id="rawUrl" placeholder="https://example.com" autocomplete="off">
        <button id="btnGen" onclick="generate()">Generate Link</button>

        <div id="result" class="result-box">
            <span style="font-weight:900; display:block; margin-bottom:5px;">RESULT:</span>
            <a id="linkResult" href="#" target="_blank" class="link"></a>
        </div>
    </div>
    <div class="footer">NO DATABASE. SERVER-SIDE PROCESSING.</div>

    <script>
        async function generate() {
            const input = document.getElementById('rawUrl');
            const btn = document.getElementById('btnGen');
            const resultBox = document.getElementById('result');
            const linkResult = document.getElementById('linkResult');
            
            const url = input.value.trim();
            if(!url) { alert("Isi link dulu bos!"); return; }

            btn.innerText = "PROCESSING...";
            btn.disabled = true;

            try {
                const response = await fetch('/api/sleep', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url })
                });

                const data = await response.json();

                if(data.status === 'success') {
                    linkResult.href = data.result;
                    linkResult.innerText = data.result;
                    resultBox.style.display = 'block';
                } else {
                    alert("Gagal: " + data.message);
                }

            } catch (err) {
                alert("Server Error");
            } finally {
                btn.innerText = "GENERATE LINK";
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>
  `;
}

function renderError() {
    return `<!DOCTYPE html><html><body style="background:#FF5A5A;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;text-align:center;"><div style="background:#fff;padding:40px;border:4px solid #000;box-shadow:8px 8px 0 #000;"><h1>404</h1><p>Link Mimpi Buruk.</p><a href="/" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;font-weight:bold;">HOME</a></div></body></html>`;
}

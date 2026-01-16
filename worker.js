export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    if (path === "") {
      return new Response(renderHome(), {
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }

    if (path === "favicon.ico") return new Response(null, { status: 204 });
    if (path === "robots.txt") {
      return new Response("User-agent: *\nDisallow: /", { headers: { "content-type": "text/plain" } });
    }

    try {
      const targetUrl = decodeZzz(path);
      return Response.redirect(targetUrl, 301);
    } catch (err) {
      return new Response(renderError(), { 
        status: 404,
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }
  },
};


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
    <title>Zzz. Link Shortener</title>
    <style>
        * { box-sizing: border-box; }
        body {
            background-color: #E0E7FF;
            color: #000;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 100vh; margin: 0; padding: 20px;
        }

        .card {
            background: #fff;
            border: 3px solid #000;
            box-shadow: 8px 8px 0px #000;
            padding: 40px;
            width: 100%;
            max-width: 500px;
            border-radius: 0;
        }

        h1 {
            font-weight: 900;
            font-size: 2.5rem;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: -1px;
            line-height: 1;
        }
        p { font-size: 1.1rem; margin-bottom: 30px; font-weight: 500; color: #444; }

        input {
            width: 100%;
            padding: 15px;
            font-size: 1rem;
            border: 3px solid #000;
            background: #f4f4f5;
            margin-bottom: 20px;
            font-weight: bold;
            transition: 0.1s;
            outline: none;
        }
        input:focus {
            background: #fff;
            box-shadow: 4px 4px 0px #000;
            transform: translate(-2px, -2px);
        }

        button {
            width: 100%;
            padding: 15px;
            font-size: 1.2rem;
            font-weight: 900;
            text-transform: uppercase;
            background-color: #A3E635; /* Lime Green Pop */
            border: 3px solid #000;
            cursor: pointer;
            box-shadow: 4px 4px 0px #000;
            transition: all 0.1s ease;
        }
        button:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px #000;
        }
        button:active {
            transform: translate(2px, 2px);
            box-shadow: 0px 0px 0px #000;
        }

        .result-box {
            margin-top: 30px;
            padding: 20px;
            border: 3px solid #000;
            background: #FEF3C7;
            display: none;
            word-break: break-all;
        }
        .label { font-weight: 900; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .link { font-family: monospace; font-size: 1.1rem; color: #000; text-decoration: underline; font-weight: bold; }
        
        .copy-btn {
            margin-top: 15px;
            background: #000;
            color: #fff;
            font-size: 0.9rem;
            padding: 10px;
        }
        .copy-btn:hover { background: #333; color: #fff; }
        .footer { margin-top: 40px; font-weight: 700; font-size: 0.8rem; opacity: 0.5; }
    </style>
</head>
<body>

    <div class="card">
        <h1>Tidurkan Link.</h1>
        <p>Shorten your URL into deep sleep mode.</p>

        <input type="text" id="rawUrl" placeholder="https://example.com" autocomplete="off">
        <button onclick="encrypt()">Generate Link</button>

        <div id="result" class="result-box">
            <span class="label">Result:</span>
            <a id="linkResult" href="#" target="_blank" class="link"></a>
            <button class="copy-btn" onclick="copyLink()">Copy to Clipboard</button>
        </div>
    </div>
    <script>
        function encrypt() {
            const input = document.getElementById('rawUrl').value.trim();
            if(!input) { alert("Isi dulu linknya!"); return; }

            let binary = "";
            for (let i = 0; i < input.length; i++) {
                binary += input.charCodeAt(i).toString(2).padStart(8, '0');
            }
            
            const zzzCode = binary.replace(/0/g, 'z').replace(/1/g, 'Z');
            const finalUrl = window.location.origin + "/" + zzzCode;
            
            const linkEl = document.getElementById('linkResult');
            linkEl.href = finalUrl;
            linkEl.innerText = finalUrl;
            
            document.getElementById('result').style.display = 'block';
        }

        function copyLink() {
            const url = document.getElementById('linkResult').href;
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.innerText = "COPIED!";
                setTimeout(() => btn.innerText = "Copy to Clipboard", 2000);
            });
        }
    </script>
</body>
</html>
  `;
}

function renderError() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>404 Not Found</title>
        <style>
            body { 
                background: #FF5A5A; /* Red Alert */
                color: #fff; 
                font-family: 'Inter', sans-serif; 
                height: 100vh; margin: 0;
                display: flex; flex-direction: column; 
                align-items: center; justify-content: center; 
                text-align: center;
            }
            .box {
                border: 4px solid #000;
                background: #fff;
                color: #000;
                padding: 40px;
                box-shadow: 8px 8px 0px #000;
            }
            h1 { font-size: 3rem; margin: 0; font-weight: 900; }
            p { font-weight: bold; margin: 20px 0; }
            a { 
                background: #000; color: #fff; text-decoration: none; 
                padding: 10px 20px; font-weight: bold; display: inline-block;
            }
            a:hover { background: #333; }
        </style>
    </head>
    <body>
        <div class="box">
            <h1>404</h1>
            <p>Link ini tidak valid atau sedang bermimpi.</p>
            <a href="/">KEMBALI</a>
        </div>
    </body>
    </html>
    `;
}

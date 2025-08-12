// Prepare static HTML content
export const html = (regUrl: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline'; script-src 'self' https://unpkg.com 'unsafe-inline'; connect-src 'self'; img-src 'self' data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Passkey Setup</title>
    <script src="https://unpkg.com/htmx.org@1.9.12"></script>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 2rem; }
      main { max-width: 42rem; margin: 0 auto; display: grid; gap: 1rem; }
      button { padding: .75rem 1rem; font-size: 1rem; }
      .status { padding: .5rem; border: 1px solid #8884; border-radius: .5rem; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Passkey Setup</h1>
      <p>Click the button to create a passkey using your password manager (1Password/YubiKey/etc.).</p>
      <button id="start" type="button">Begin Registration</button>
      <div id="status" class="status">Waiting to start…</div>
    </main>
    <script type="module">
      async function b64ToBytes(b64) {
        // restore padding for atob
        let s = b64.replace(/-/g,'+').replace(/_/g,'/');
        const mod = s.length % 4; if (mod === 2) s += '=='; else if (mod === 3) s += '=';
        const bin = atob(s); const bytes = new Uint8Array(bin.length);
        for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
      }

      async function bytesToB64url(bytes) {
        let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
        const b64 = btoa(bin).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/g,'');
        return b64;
      }

      async function start() {
        // Update status to show we're starting
        const statusNode = document.getElementById('status');
        if (statusNode) statusNode.outerHTML = '<div id="status" class="status">Starting registration…</div>';
        
        const res = await fetch('/api/options');
        if (!res.ok) throw new Error('Failed to get registration options from server');
        const opts = await res.json();
        // Convert to WebAuthn-friendly types
        const publicKey = {
          challenge: await b64ToBytes(opts.challenge),
          rp: { 
            id: opts.rp.id, 
            name: opts.rp.name 
          },
          user: { id: await b64ToBytes(opts.user.id), name: opts.user.name, displayName: opts.user.displayName },
          pubKeyCredParams: opts.pubKeyCredParams,
          authenticatorSelection: opts.authenticatorSelection,
          timeout: opts.timeout,
          attestation: opts.attestation
        };

        console.log({ publicKey });
        
        // Update status to show we're waiting for user interaction
        const waitingNode = document.getElementById('status');
        if (waitingNode) waitingNode.outerHTML = '<div id="status" class="status">Please complete the passkey creation in your authenticator…</div>';
        
        const cred = await navigator.credentials.create({ publicKey });
        if (!cred) throw new Error('No credential created');
        const att = cred.response; // AttestationResponse
        const payload = {
          id: cred.id,
          rawId: await bytesToB64url(new Uint8Array(cred.rawId)),
          response: {
            attestationObject: await bytesToB64url(new Uint8Array(att.attestationObject)),
            clientDataJSON: await bytesToB64url(new Uint8Array(att.clientDataJSON))
          },
          type: cred.type,
          authenticatorAttachment: cred.authenticatorAttachment ?? null
        };
        
        // Update status to show we're saving
        const savingNode = document.getElementById('status');
        if (savingNode) savingNode.outerHTML = '<div id="status" class="status">Saving credential…</div>';
        
        const post = await fetch('/api/store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const html = await post.text();
        const node = document.getElementById('status');
        if (node) node.outerHTML = html;
      }

      document.getElementById('start')?.addEventListener('click', (e) => {
        e.preventDefault(); start().catch(async (err) => {
          const res = await fetch('/fragment/error?m='+encodeURIComponent(err.message));
          const html = await res.text();
          const node = document.getElementById('status'); if (node) node.outerHTML = html;
        });
      });
    </script>
  </body>
  </html>`;

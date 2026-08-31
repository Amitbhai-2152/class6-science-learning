import { spawn } from 'node:child_process';

const port = 4317;
const child = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, PORT: String(port), ALLOWED_ORIGIN: 'http://localhost:4173' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
child.stdout.on('data', d => { output += d.toString(); });
child.stderr.on('data', d => { output += d.toString(); });

const wait = ms => new Promise(r => setTimeout(r, ms));

try {
  let healthy = false;
  for (let i = 0; i < 20; i += 1) {
    await wait(150);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok === true && typeof data.configured === 'boolean') {
          healthy = true;
          console.log('Tutor health check:', JSON.stringify(data));
          break;
        }
      }
    } catch {}
  }

  if (!healthy) {
    console.error('Tutor server did not become healthy.');
    console.error(output);
    process.exitCode = 1;
  }
} finally {
  child.kill('SIGTERM');
  await wait(150);
  if (!child.killed) child.kill('SIGKILL');
}

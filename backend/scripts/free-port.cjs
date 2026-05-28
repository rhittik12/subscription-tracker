const { execSync } = require('node:child_process');

const port = Number(process.env.PORT || 4000);

function runCommand(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
}

function getPidsOnPort() {
  if (process.platform === 'win32') {
    const output = runCommand(`netstat -ano | findstr :${port}`);
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/\sTCP\s+\S+:\d+\s+\S+:\S+\s+LISTENING\s+(\d+)\s*$/i);
      if (match) {
        pids.add(match[1]);
      }
    }

    return [...pids];
  }

  const output = runCommand(`lsof -ti tcp:${port}`);
  return [...new Set(output.split(/\s+/).filter(Boolean))];
}

function killPids(pids) {
  if (pids.length === 0) {
    return;
  }

  if (process.platform === 'win32') {
    runCommand(`taskkill /F ${pids.map((pid) => `/PID ${pid}`).join(' ')}`);
    return;
  }

  runCommand(`kill -9 ${pids.join(' ')}`);
}

const pids = getPidsOnPort();

if (pids.length > 0) {
  killPids(pids);
  console.log(`Freed port ${port} before starting the backend dev server.`);
}
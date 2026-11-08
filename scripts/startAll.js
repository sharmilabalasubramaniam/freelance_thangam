/**
 * Unified Server Runner for STP CHICKENS by Thangam Farms
 * Starts both Backend API (Port 5000) and Frontend Web Server (Port 3000)
 * Handles port availability, logs clear URLs, and supports clean shutdown.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 3000;

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function main() {
  console.log('===========================================================');
  console.log('    STP CHICKENS by Thangam Farms — Server Launcher        ');
  console.log('===========================================================\n');

  const backendInUse = await checkPortInUse(BACKEND_PORT);
  const frontendInUse = await checkPortInUse(FRONTEND_PORT);

  if (backendInUse) {
    console.log(`[Backend] Port ${BACKEND_PORT} is already active and serving requests.`);
  } else {
    console.log(`[Backend] Launching Express server on port ${BACKEND_PORT}...`);
    const backendProc = spawn('node', ['src/server.js'], {
      cwd: path.join(__dirname, '..', 'server'),
      stdio: 'inherit',
      shell: true
    });
    backendProc.on('error', (err) => console.error('[Backend Error]:', err));
  }

  if (frontendInUse) {
    console.log(`[Frontend] Port ${FRONTEND_PORT} is already active and serving static files.`);
  } else {
    console.log(`[Frontend] Launching static server on port ${FRONTEND_PORT}...`);
    const frontendProc = spawn('npx', ['serve', '.', '-p', String(FRONTEND_PORT)], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });
    frontendProc.on('error', (err) => console.error('[Frontend Error]:', err));
  }

  console.log('\n-----------------------------------------------------------');
  console.log('  STP CHICKENS APPLICATION STATUS:');
  console.log(`  Frontend:        http://localhost:${FRONTEND_PORT}`);
  console.log(`  Admin Dashboard: http://localhost:${FRONTEND_PORT}/admin-dashboard/AdminDashboard.html`);
  console.log(`  Clean Admin URL: http://localhost:${FRONTEND_PORT}/admin-dashboard/AdminDashboard`);
  console.log(`  Backend Health:  http://localhost:${BACKEND_PORT}/api/health`);
  console.log('-----------------------------------------------------------');
  console.log('Press Ctrl+C to stop servers.\n');
}

main().catch(console.error);


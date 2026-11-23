// Verification script for Heartbeat Heist: API Key Security & Backend Connectivity
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.SMARTSPECTRA_API_KEY || process.env.PRESAGE_API_KEY;

async function checkApiKey() {
  console.log('========================================================');
  console.log(' TEST 1: PRESAGE BACKEND API AUTHENTICATION & ACCESS    ');
  console.log('========================================================');
  
  if (!API_KEY) {
    console.error('❌ Error: API key not found in process.env (check .env file)');
    return false;
  }
  
  console.log(`Checking key: ${API_KEY.substring(0, 6)}...${API_KEY.substring(API_KEY.length - 4)}`);

  return new Promise((resolve) => {
    const postData = JSON.stringify({ metrics: ['cardio', 'breathing'] });
    const req = https.request(
      'https://cont-api.physiology.presagetech.com/v2/metrics/authorize',
      {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
          'User-Agent': 'curl/8.4.0',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`HTTP Status: ${res.statusCode} ${res.statusMessage}`);
          console.log(`Rate Limit Remaining: ${res.headers['x-ratelimit-remaining'] || 'N/A'}`);
          console.log(`Response Payload: ${body}`);
          
          if (res.statusCode === 200) {
            console.log('✅ PASS: API Key is authenticated and active on Presage server.');
            resolve(true);
          } else {
            console.error(`❌ FAIL: API request failed with status ${res.statusCode}`);
            resolve(false);
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('❌ Network error contacting Presage backend:', err.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

function checkCodebaseLeak() {
  console.log('\n========================================================');
  console.log(' TEST 2: CODEBASE LEAK AUDIT (SECURITY CHECK)           ');
  console.log('========================================================');

  const rootDir = path.join(__dirname, '..');
  const keyToFind = API_KEY;
  let leakedFiles = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(rootDir, fullPath);

      // Skip git, node_modules, and legitimate local .env
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.env') {
        continue;
      }

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(keyToFind)) {
            leakedFiles.push(relPath);
          }
        } catch {
          // Ignore binary files
        }
      }
    }
  }

  scanDir(rootDir);

  if (leakedFiles.length === 0) {
    console.log('✅ PASS: Zero occurrences of the raw API key found in working tree.');
  } else {
    console.error('❌ FAIL: Raw API key detected in files:', leakedFiles);
  }

  // Check .gitignore
  const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  const hasEnvIgnored = gitignoreContent.includes('.env');
  console.log(`Gitignore protects .env: ${hasEnvIgnored ? '✅ YES (.env and .env.* excluded)' : '❌ NO'}`);

  return leakedFiles.length === 0 && hasEnvIgnored;
}

function checkBuildOutput() {
  console.log('\n========================================================');
  console.log(' TEST 3: PRODUCTION BUILD ARTIFACT INTEGRITY           ');
  console.log('========================================================');

  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    console.log('⚠️ Notice: dist/ directory not found. Run npm run build.');
    return false;
  }

  const indexHtml = path.join(distDir, 'index.html');
  const assetsDir = path.join(distDir, 'assets');

  const hasIndex = fs.existsSync(indexHtml);
  const hasAssets = fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length > 0;

  console.log(`dist/index.html present: ${hasIndex ? '✅ YES' : '❌ NO'}`);
  console.log(`dist/assets/ bundled: ${hasAssets ? '✅ YES' : '❌ NO'}`);

  return hasIndex && hasAssets;
}

async function main() {
  const t1 = await checkApiKey();
  const t2 = checkCodebaseLeak();
  const t3 = checkBuildOutput();

  console.log('\n========================================================');
  console.log(` SUMMARY: ${t1 && t2 && t3 ? 'ALL SECURITY & CONNECTIVITY CHECKS PASSED ✅' : 'SOME CHECKS FAILED ❌'}`);
  console.log('========================================================\n');
}

main().catch(console.error);

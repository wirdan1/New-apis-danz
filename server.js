const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const apiEndpoints = [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

console.log('Starting Carlotta API server...');

function detectHttpMethod(functionName) {
  const name = functionName.toLowerCase();
  
  if (name.includes('get') || name.includes('fetch') || name.includes('stalk') || name.includes('search') || name.includes('check')) return 'get';
  if (name.includes('post') || name.includes('create') || name.includes('add') || name.includes('submit')) return 'post';
  if (name.includes('put') || name.includes('update') || name.includes('edit') || name.includes('modify')) return 'put';
  if (name.includes('delete') || name.includes('remove') || name.includes('destroy')) return 'delete';
  if (name.includes('patch')) return 'patch';
  
  return 'get';
}

console.log('Checking scrape directory...');
const scrapeDir = path.resolve('./scrape');

if (fs.existsSync(scrapeDir)) {
  const files = fs.readdirSync(scrapeDir).filter(file => file.endsWith('.js'));
  console.log(`Found ${files.length} scrape files:`, files);
  
  for (const file of files) {
    try {
      const filePath = path.join(scrapeDir, file);
      const module = require(filePath);
      const fileName = path.basename(file, '.js');
      
      console.log(`Loading ${fileName}:`, Object.keys(module));
      
      for (const [funcName, func] of Object.entries(module)) {
        if (typeof func === 'function') {
          const route = `/api/${fileName}/${funcName}`;
          const method = detectHttpMethod(funcName);
          
          apiEndpoints.push({
            method: method,
            route: route,
            module: fileName,
            function: funcName
          });
          
          console.log(`Registering ${method.toUpperCase()} ${route}`);
          
          app[method](route, async (req, res) => {
            try {
              const params = { ...req.query, ...req.body };
              const result = await func(params);
              res.json({
                success: true,
                creator: 'Kuroxel',
                data: result,
              });
            } catch (error) {
              res.status(500).json({
                success: false,
                creator: 'Kuroxel',
                error: error.message,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error.message);
    }
  }
} else {
  console.log('Scrape directory not found, creating...');
  fs.mkdirSync(scrapeDir, { recursive: true });
}

app.get('/', (req, res) => {
  const generateEndpointsHtml = () => {
    if (apiEndpoints.length === 0) {
        return `<div class="no-endpoints">
          <p>No endpoints found</p>
          <p>Add some modules to the /scrape directory to get started!</p>
        </div>`;
    }
    return apiEndpoints.map(endpoint => `
      <div class="endpoint-card">
        <div class="method-badge ${endpoint.method}">${endpoint.method.toUpperCase()}</div>
        <div class="endpoint-details">
          <div class="route">${endpoint.route}</div>
          <div class="meta">
            <span class="function">${endpoint.function}()</span>
            <span class="module">${endpoint.module}.js</span>
          </div>
          ${endpoint.method === 'get' ? `<a href="${endpoint.route}?param=value" class="test-btn">Test</a>` : 
            `<button class="test-btn disabled" disabled>Test</button>`}
        </div>
      </div>
    `).join('');
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Carlotta API</title>
    <link id="icon" rel="icon" href="https://qu.ax/GbGJV.jpg" type="image/jpg">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --text-primary: #ffffff;
            --text-secondary: #e5e7eb;
            --text-tertiary: #9ca3af;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --bg-surface: #1f2937;
            --border: #374151;
            --success: #10b981;
            --error: #ef4444;
            --warning: #f59e0b;
            --info: #3b82f6;
            --radius: 12px;
            --padding: 16px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.5;
            padding: var(--padding);
            max-width: 100%;
            overflow-x: hidden;
        }

        .container {
            max-width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
            padding: 16px 0;
        }

        .title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            font-size: 16px;
            color: var(--text-tertiary);
            font-weight: 400;
        }

        .stats {
            background: var(--bg-surface);
            border-radius: var(--radius);
            padding: 20px;
            margin-bottom: 24px;
            text-align: center;
            border: 1px solid var(--border);
        }

        .stats-label {
            font-size: 14px;
            color: var(--text-tertiary);
            margin-bottom: 8px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stats-value {
            font-size: 36px;
            font-weight: 700;
        }

        .section-title {
            font-size: 20px;
            font-weight: 600;
            margin: 24px 0 16px;
            color: var(--text-secondary);
        }

        .endpoint-card {
            background: var(--bg-surface);
            border-radius: var(--radius);
            padding: 16px;
            margin-bottom: 12px;
            border: 1px solid var(--border);
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .method-badge {
            font-size: 12px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .get { background: var(--success); color: #111827; }
        .post { background: var(--primary); }
        .put { background: var(--warning); color: #111827; }
        .delete { background: var(--error); }
        .patch { background: var(--info); }

        .endpoint-details {
            flex-grow: 1;
            overflow: hidden;
        }

        .route {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            color: var(--text-primary);
            margin-bottom: 8px;
            word-break: break-all;
        }

        .meta {
            display: flex;
            gap: 8px;
            font-size: 12px;
            color: var(--text-tertiary);
            margin-bottom: 12px;
            flex-wrap: wrap;
        }

        .function {
            font-family: 'Courier New', Courier, monospace;
            color: var(--text-secondary);
        }

        .test-btn {
            display: inline-block;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
            text-align: center;
        }

        .test-btn.disabled {
            background: var(--bg-secondary);
            color: var(--text-tertiary);
            cursor: not-allowed;
            opacity: 0.7;
        }

        .test-btn:not(.disabled):active {
            transform: scale(0.98);
            background: var(--primary-dark);
        }

        .no-endpoints {
            background: var(--bg-surface);
            border-radius: var(--radius);
            padding: 24px;
            text-align: center;
            border: 1px dashed var(--border);
        }

        .no-endpoints p:first-child {
            font-size: 16px;
            margin-bottom: 8px;
            color: var(--text-secondary);
        }

        .no-endpoints p:last-child {
            font-size: 14px;
            color: var(--text-tertiary);
        }

        .api-info {
            background: var(--bg-surface);
            border-radius: var(--radius);
            padding: 20px;
            margin-top: 24px;
            text-align: center;
            border: 1px solid var(--border);
        }

        .api-info h3 {
            font-size: 18px;
            margin-bottom: 8px;
            color: var(--text-secondary);
        }

        .api-info p {
            font-size: 14px;
            color: var(--text-tertiary);
            margin-bottom: 16px;
        }

        .api-info a {
            display: inline-block;
            background: var(--primary);
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
        }

        .api-info a:active {
            transform: scale(0.98);
            background: var(--primary-dark);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Carlotta API</h1>
            <p class="subtitle">Simple and Powerful API System</p>
        </div>
        
        <div class="stats">
            <div class="stats-label">Available Endpoints</div>
            <div class="stats-value">${apiEndpoints.length}</div>
        </div>
        
        <h2 class="section-title">API Endpoints</h2>
        <div class="endpoints-list">
            ${generateEndpointsHtml()}
        </div>
        
        <div class="api-info">
            <h3>API Documentation</h3>
            <p>Get detailed API information in JSON format</p>
            <a href="/api" target="_blank">View API Info</a>
        </div>
    </div>
</body>
</html>
  `;
  res.send(html);
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Carlotta - Simple & Clean API System',
    creator: 'Kuroxel',
    version: '1.0.0',
    features: [
      'Auto-load scrape modules',
      'Auto-detect HTTP methods',
      'Clean API response format',
    ],
    endpoints: apiEndpoints,
    total: apiEndpoints.length,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Carlotta API running on http://0.0.0.0:${PORT}`);
  console.log(`Total endpoints loaded: ${apiEndpoints.length}`);
});

module.exports = app;

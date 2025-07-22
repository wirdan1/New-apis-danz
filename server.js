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
          <p>Add some modules to the /scrape directory to get started</p>
        </div>`;
    }
    return apiEndpoints.map(endpoint => `
      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method ${endpoint.method}">${endpoint.method.toUpperCase()}</span>
          <code class="route">${endpoint.route}</code>
          ${endpoint.method === 'get' ? `<a href="${endpoint.route}?param=value" class="test-btn" target="_blank">Test</a>` : ''}
        </div>
        <div class="endpoint-info">
          <span class="function-name">${endpoint.function}()</span>
          <span class="module-name">${endpoint.module}.js</span>
        </div>
      </div>
    `).join('');
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carlotta API</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-darker: #4338ca;
            --primary-light: #818cf8;
            --primary-lighter: #a5b4fc;
            --background: #0f172a;
            --surface: #1e293b;
            --surface-light: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #e2e8f0;
            --text-tertiary: #94a3b8;
            --border: #334155;
            --success: #10b981;
            --error: #ef4444;
            --warning: #f59e0b;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--background);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem 0;
        }
        
        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }
        
        .header p {
            font-size: 1.125rem;
            color: var(--text-tertiary);
            font-weight: 400;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .stats {
            background: var(--surface);
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 3rem;
            text-align: center;
            border: 1px solid var(--border);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .stats h3 {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-tertiary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .stats p {
            font-size: 3rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
        }
        
        .endpoints-section h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
        }
        
        .endpoint-card {
            background: var(--surface);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
            border: 1px solid var(--border);
        }
        
        .endpoint-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: var(--primary);
        }
        
        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        
        .method {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.25rem 0.75rem;
            border-radius: 0.375rem;
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: white;
            min-width: 64px;
            text-align: center;
        }
        
        .get { background: var(--primary); }
        .post { background: var(--success); }
        .put { background: var(--warning); color: #1e293b; }
        .delete { background: var(--error); }
        .patch { background: #8b5cf6; }
        
        .route {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: var(--primary-lighter);
            background: rgba(15, 23, 42, 0.5);
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            flex: 1;
            min-width: 200px;
            border: 1px solid var(--border);
            overflow-x: auto;
            white-space: nowrap;
        }
        
        .test-btn {
            background: var(--primary);
            color: white;
            padding: 0.5rem 1.25rem;
            border: none;
            border-radius: 0.375rem;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 36px;
        }
        
        .test-btn:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
        }
        
        .endpoint-info {
            display: flex;
            gap: 1rem;
            font-size: 0.875rem;
            color: var(--text-tertiary);
            align-items: center;
        }
        
        .function-name {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
            color: var(--primary-lighter);
        }
        
        .module-name {
            font-size: 0.8125rem;
            background: var(--surface-light);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }
        
        .no-endpoints {
            text-align: center;
            padding: 3rem;
            background: var(--surface);
            border-radius: 0.75rem;
            border: 1px dashed var(--border);
        }
        
        .no-endpoints p:first-child {
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .no-endpoints p:last-child {
            color: var(--text-tertiary);
        }
        
        .api-info {
            margin-top: 3rem;
            padding: 2rem;
            background: var(--surface);
            border-radius: 0.75rem;
            text-align: center;
            border: 1px solid var(--border);
        }
        
        .api-info h3 {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .api-info p {
            color: var(--text-tertiary);
            margin-bottom: 1rem;
        }
        
        .api-info a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            padding: 0.625rem 1.25rem;
            background: var(--primary);
            border-radius: 0.375rem;
            transition: all 0.2s ease;
            display: inline-block;
        }
        
        .api-info a:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .header p {
                font-size: 1rem;
            }
            
            .stats p {
                font-size: 2rem;
            }
            
            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }
            
            .route {
                width: 100%;
                min-width: auto;
            }
            
            .test-btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Carlotta API</h1>
            <p>A modern, scalable API system with automatic endpoint discovery</p>
        </div>
        
        <div class="stats">
            <h3>Available Endpoints</h3>
            <p>${apiEndpoints.length}</p>
        </div>
        
        <div class="endpoints-section">
            <h2>API Endpoints</h2>
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
    message: 'Carlotta - Modern API System',
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

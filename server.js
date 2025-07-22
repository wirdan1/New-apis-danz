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

console.log('🚀 Starting Carlotta API server...');

function detectHttpMethod(functionName) {
  const name = functionName.toLowerCase();
  
  if (name.includes('get') || name.includes('fetch') || name.includes('stalk') || name.includes('search') || name.includes('check')) return 'get';
  if (name.includes('post') || name.includes('create') || name.includes('add') || name.includes('submit')) return 'post';
  if (name.includes('put') || name.includes('update') || name.includes('edit') || name.includes('modify')) return 'put';
  if (name.includes('delete') || name.includes('remove') || name.includes('destroy')) return 'delete';
  if (name.includes('patch')) return 'patch';
  
  return 'get';
}

console.log('📁 Checking scrape directory...');
const scrapeDir = path.resolve('./scrape');

if (fs.existsSync(scrapeDir)) {
  const files = fs.readdirSync(scrapeDir).filter(file => file.endsWith('.js'));
  console.log(`📋 Found ${files.length} scrape files:`, files);
  
  for (const file of files) {
    try {
      const filePath = path.join(scrapeDir, file);
      const module = require(filePath);
      const fileName = path.basename(file, '.js');
      
      console.log(`📄 Loading ${fileName}:`, Object.keys(module));
      
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
          
          console.log(`🔗 Registering ${method.toUpperCase()} ${route}`);
          
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
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  }
} else {
  console.log('📁 Scrape directory not found, creating...');
  fs.mkdirSync(scrapeDir, { recursive: true });
}

app.get('/', (req, res) => {
  const generateEndpointsHtml = () => {
    if (apiEndpoints.length === 0) {
        return `<div class="no-endpoints">
          <p>🔍 No endpoints found</p>
          <p>Add some modules to the /scrape directory to get started!</p>
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
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carlotta API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('https://files.catbox.moe/f2dzke.jpg') center/cover no-repeat;
            opacity: 0.4;
            z-index: -1;
        }        
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem 0;
        }
        
        .header h1 {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            color: #a3a3a3;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .stats {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 3rem;
            text-align: center;
        }
        
        .stats h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: #a3a3a3;
        }
        
        .stats p {
            font-size: 2.5rem;
            font-weight: 700;
            color: #ffffff;
        }
        
        .endpoints-section h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #a3a3a3;
            font-weight: 600;
        }
        
        .endpoint-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
        }
        
        .endpoint-card:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.25);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
        }
        
        .method {
            display: inline-block;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #ffffff;
        }
        
        .get { background: #2563eb; }
        .post { background: #1d4ed8; }
        .put { background: #1e40af; }
        .delete { background: #1e3a8a; }
        .patch { background: #172554; }
        
        .route {
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 0.9rem;
            color: #93c5fd;
            background: rgba(0, 0, 0, 0.3);
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            flex: 1;
            min-width: 200px;
        }
        
        .test-btn {
            background: #2563eb;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            font-size: 0.8rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .test-btn:hover {
            background: #1d4ed8;
            transform: scale(1.05);
        }
        
        .endpoint-info {
            display: flex;
            gap: 1rem;
            font-size: 0.85rem;
            color: #60a5fa;
        }
        
        .function-name {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
        }
        
        .module-name {
            opacity: 0.7;
        }
        
        .no-endpoints {
            text-align: center;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 2px dashed rgba(255, 255, 255, 0.2);
        }
        
        .no-endpoints p:first-child {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            color: #a3a3a3;
        }
        
        .no-endpoints p:last-child {
            color: #93c5fd;
            opacity: 0.8;
        }
        
        .api-info {
            margin-top: 3rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            text-align: center;
        }
        
        .api-info h3 {
            color: #a3a3a3;
            margin-bottom: 1rem;
        }
        
        .api-info a {
            color: #60a5fa;
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            background: rgba(37, 99, 235, 0.1);
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        
        .api-info a:hover {
            background: rgba(37, 99, 235, 0.2);
            transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2.5rem;
            }
            
            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .route {
                min-width: auto;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Carlotta API</h1>
            <p>Simple, Clean & Powerful API System</p>
        </div>
        
        <div class="stats">
            <h3>Available Endpoints</h3>
            <p>${apiEndpoints.length}</p>
        </div>
        
        <div class="endpoints-section">
            <h2>🚀 API Endpoints</h2>
            ${generateEndpointsHtml()}
        </div>
        
        <div class="api-info">
            <h3>📖 API Documentation</h3>
            <p>Get detailed API information in JSON format</p>
            <br>
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
  console.log(`🚀 Carlotta API running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Total endpoints loaded: ${apiEndpoints.length}`);
});

module.exports = app;

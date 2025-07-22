![Logo](https://files.catbox.moe/fetqga.jpg)
# New APIS

🚀 **Simple, Clean & Powerful API System dengan Express.js**

Sistem API yang modern dengan fitur auto-load modules dan auto-detect HTTP methods.

## ✨ Features

- **🔄 Auto-load Modules** - Otomatis memuat semua file .js dari folder `/scrape`
- **🎯 Auto-detect HTTP Methods** - Mendeteksi method HTTP berdasarkan nama function
- **🎨 Simple Theme** - Interface yang bersih
- **📱 Responsive Design** - Kompatibel dengan desktop dan mobile
- **🛡️ Error Handling** - Penanganan error yang comprehensive
- **🌐 CORS Enabled** - Support untuk frontend integration
- **⚡ Hot Reload** - Auto-reload saat file scrape berubah (development mode)

## 🎯 Auto-Detect HTTP Methods

Sistem akan otomatis mendeteksi HTTP method berdasarkan nama function:

| Method | Keywords |
|--------|----------|
| **GET** | `get*`, `fetch*`, `stalk*`, `search*`, `check*` |
| **POST** | `post*`, `create*`, `add*`, `submit*` |
| **PUT** | `put*`, `update*`, `edit*`, `modify*` |
| **DELETE** | `delete*`, `remove*`, `destroy*` |
| **PATCH** | `patch*` |

## 📁 Struktur Project

```
new-apis/
├── scrape/                 # Folder untuk scrape modules
│   ├── igstalk.js         # Instagram scraping
│   ├── kimi.js            # Kimi AI integration
│   ├── nakanime.js        # Anime scraping
│   └── twitter.js         # Twitter scraping
├── public/                # Static files
│   └── images/            # Background images
├── server.js       # Main server file
├── package.json
└── README.md
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start server**
   ```bash
   npm start
   ```

3. **Akses API**
   - Homepage: `http://localhost:3000`
   - API Info: `http://localhost:3000/api`

## 📋 Available Endpoints

### Instagram Module (`/api/igstalk/`)
- `GET /api/igstalk/stalkInstagram?username=kuroxel_studio` - Get Instagram profile, stories & posts

### Kimi AI Module (`/api/kimi/`)
- `GET /api/kimi/chatKimi?question=Hello` - Chat with Kimi AI

### Nakanime Module (`/api/nakanime/`)
- `GET /api/nakanime/getAnime?order=latest&page=1` - Get anime list
- `GET /api/nakanime/getAnimeByGenre?genre=action&page=1` - Get anime by genre
- `GET /api/nakanime/searchAnime?query=Overlord` - Search anime
- `GET /api/nakanime/getAnimeDetail?url=...` - Get anime details
- `GET /api/nakanime/getAnimeData?url=...` - Get anime episode data

### Twitter Module (`/api/twitter/`)
- `GET /api/twitter/stalkTwit?username=KuroxelStudio` - Get Twitter profile & tweets

## 💡 How to Add New Module

1. **Buat file baru** di folder `scrape/`, contoh: `scrape/youtube.js`

2. **Export functions** dengan format:
   ```javascript
   const axios = require('axios');

   async function getVideoInfo(params) {
     const { videoId } = params;
     return { title: 'Video Title', views: 1000000 };
   }

   async function searchVideos(params) {
     const { query } = params;
     return { videos: [] };
   }

   module.exports = {
     getVideoInfo,
     searchVideos
   };
   ```

3. **Endpoints otomatis tersedia**:
   - `GET /api/youtube/getVideoInfo?videoId=abc123`
   - `GET /api/youtube/searchVideos?query=tutorial`

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "creator": "Xenz",
  "data": { /* your data */ }
}
```

### Error Response
```json
{
  "success": false,
  "creator": "Xenz",
  "error": "Error message",
}
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)



### Adding Dependencies
Jika scrape module membutuhkan library tambahan:
```bash
npm install library-name
```

## 📦 Dependencies

- **express** - Web framework
- **axios** - HTTP client untuk scraping
- **cors** - Cross-origin resource sharing
- **fs** - File system operations
- **path** - Path utilities

## 📄 License

MIT License - Feel free to use and modify!

---

**Built with ❤️ by Kuroxel - Simple, Clean & Powerful**

![Logo](https://files.catbox.moe/dk0erc.jpg)


## 📞 Contact & Social Media

Jangan ragu untuk terhubung dengan saya melalui:

- ⭐ Star this repo
- 💬 WhatsApp Channel: [https://whatsapp.com/channel/0029VbBPPG52f3EFT7ldeT0m](https://whatsapp.com/channel/0029VbBPPG52f3EFT7ldeT0m)
- 📱 Chat WhatsApp: [https://wa.me/6281297662535](https://wa.me/6281297662535)
- 📸 Instagram: [kuroxel_studio](https://www.instagram.com/kuroxel_studio)
- 🐦 X/Twitter: [KuroxelStudio](https://twitter.com/KuroxelStudio)
- 🐙 GitHub: [Kuroxel](https://github.com/Kuroxel)



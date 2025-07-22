const axios = require('axios');

class Nakanime {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://anime.nakanime.my.id/api/anime',
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.9.2'
            }
        });
    }
    
    async get(order = 'latest', page = 1) {
        try {
            const _order = ['title', 'latest', 'popular', 'rating', 'update', 'titlereverse'];
            if (!_order.includes(order)) throw new Error(`Available orders: ${_order.join(', ')}`);
            
            const { data } = await this.client('/all/', {
                params: {
                    order,
                    page
                }
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async genre(genre = 'action', page = 1) {
        try {
            const { data: g } = await this.client('/genre');
            const _genre = g.data.map(c => c.slug);
            if (!_genre.includes(genre)) throw new Error(`Available genres: ${_genre.join(', ')}`);
            
            const { data } = await this.client('/bygenres/', {
                params: {
                    genre,
                    page
                }
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async search(query) {
        try {
            if (!query) throw new Error('Query is required');
            
            const { data } = await this.client('/search/', {
                params: {
                    keyword: query
                }
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async getDetail(url) {
        try {
            const match = url.match(/^https:\/\/api\.nakanime\.my\.id\/anime\/([^\/]+)\/?$/);
            if (!match) throw new Error('Invalid url');
            
            const { data } = await this.client({
                params: {
                    name: match[1]
                }
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async getData(url) {
        try {
            const match = url.match(/^https:\/\/api\.nakanime\.my\.id\/([^\/]+episode-[^\/]+)\/?$/);
            if (!match) throw new Error('Invalid url');
            
            const { data } = await this.client('/data/', {
                params: {
                    slug: match[1]
                }
            });
            
            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

async function getAnime(params) {
    const { order = 'latest', page = 1 } = params;
    const nakanime = new Nakanime();
    return await nakanime.get(order, page);
}

async function getAnimeByGenre(params) {
    const { genre = 'action', page = 1 } = params;
    const nakanime = new Nakanime();
    return await nakanime.genre(genre, page);
}

async function searchAnime(params) {
    const { query } = params;
    const nakanime = new Nakanime();
    return await nakanime.search(query);
}

async function getAnimeDetail(params) {
    const { url } = params;
    const nakanime = new Nakanime();
    return await nakanime.getDetail(url);
}

async function getAnimeData(params) {
    const { url } = params;
    const nakanime = new Nakanime();
    return await nakanime.getData(url);
}

module.exports = {
    getAnime,
    getAnimeByGenre,
    searchAnime,
    getAnimeDetail,
    getAnimeData
};


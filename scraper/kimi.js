const axios = require('axios');

class Kimi {
    constructor() {
        this.id = String(Date.now()) + Math.floor(Math.random() * 1e3);
        this.headers = {
            'content-type': 'application/json',
            'x-language': 'zh-CN',
            'x-msh-device-id': this.id,
            'x-msh-platform': 'web',
            'x-msh-session-id': String(Date.now()) + Math.floor(Math.random() * 1e3),
            'x-traffic-id': this.id
        };
    }
    
    async register() {
        try {
            const rynn = await axios.post('https://www.kimi.com/api/device/register', {}, {
                headers: this.headers
            });
            
            return {
                auth: `Bearer ${rynn.data.access_token}`,
                cookie: rynn.headers['set-cookie'].join('; ')
            };
        } catch (error) {
            console.error(error.message);
            return false;
        }
    }
    
    async chat(question, { model = 'k2', search = true, deep_research = false } = {}) {
        try {
            if (!question) throw new Error('Question is required');
            if (!['k1.5', 'k2'].includes(model)) throw new Error(`Available models: k1.5, k2`);
            if (typeof search !== 'boolean') throw new Error('Search must be boolean');
            if (typeof deep_research !== 'boolean') throw new Error('Deep Research must be boolean');
            
            const reg = await this.register();
            if (!reg) throw new Error('Failed to get token');
            
            const { data: chat } = await axios.post('https://www.kimi.com/api/chat', {
                name: '未命名会话',
                born_from: 'home',
                kimiplus_id: 'kimi',
                is_example: false,
                source: 'web',
                tags: []
            }, {
                headers: {
                    authorization: reg.auth,
                    cookie: reg.cookie,
                    ...this.headers
                }
            });
            
            const { data } = await axios.post(`https://www.kimi.com/api/chat/${chat.id}/completion/stream`, {
                kimiplus_id: 'kimi',
                extend: {
                    sidebar: true
                },
                model: model,
                use_search: search,
                messages: [
                    {
                        role: 'user',
                        content: question
                    }
                ],
                refs: [],
                history: [],
                scene_labels: [],
                use_semantic_memory: false,
                use_deep_research: deep_research
            }, {
                headers: {
                    authorization: reg.auth,
                    cookie: reg.cookie,
                    ...this.headers
                }
            });
            
            const result = {
                text: '',
                search_by: [],
                sources: [],
                citations: []
            };
            
            const lines = data.split('\n\n');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const d = JSON.parse(line.substring(6));
                    if (d.event === 'cmpl') result.text += d.text;
                    if (d.event === 'search_plus' && d.msg?.type === 'target') result.search_by = d.msg.targets;
                    if (d.event === 'search_plus' && d.type === 'get_res') result.sources.push(d.msg);
                    if (d.event === 'search_citation') result.citations = Object.values(d.values);
                }
            }
            
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

async function chatKimi(params) {
    const { question, model = 'k2', search = true, deep_research = false } = params;
    
    const kimi = new Kimi();
    return await kimi.chat(question, { model, search, deep_research });
}

module.exports = {
    chatKimi
};


const axios = require('axios');

async function stalkInstagram(params) {
    const { username } = params;
    
    try {
        if (!username) throw new Error('Username is required');
        
        const [pr, st, pt] = await Promise.all([
            axios.post('https://free-tools-api.vercel.app/api/instagram-profile', {
                username: username
            }),
            
            axios.post('https://free-tools-api.vercel.app/api/instagram-viewer', {
                username: username,
                type: 'stories'
            }),
            
            axios.post('https://free-tools-api.vercel.app/api/instagram-viewer', {
                username: username,
                type: 'photo'
            })
        ]);
        
        return {
            profile_info: pr.data,
            stories: st.data.stories,
            latest_posts: pt.data.posts
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    stalkInstagram
};


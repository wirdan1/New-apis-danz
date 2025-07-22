const axios = require('axios');

async function stalkTwit(params) {
  const { username } = params;
  
  if (!username) {
    throw new Error('Parameter username diperlukan!');
  }

  const url = `https://twittermedia.b-cdn.net/viewer/?data=${encodeURIComponent(username)}&type=profile`;
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': '*/*',
    'Origin': 'https://snaplytics.io',
    'Referer': 'https://snaplytics.io/'
  };

  try {
    const res = await axios.get(url, { headers });
    const { profile, tweets } = res.data;

    if (!profile) {
      throw new Error('Profil tidak ditemukan!');
    }

    return {
      profile: {
        name: profile.name ?? '',
        username: profile.username ?? '',
        bio: profile.bio ?? '',
        avatar: profile.avatar_url ?? '',
        banner: profile.banner_url ?? '',
        stats: {
          tweets: profile.stats?.tweets ?? 0,
          following: profile.stats?.following ?? 0,
          followers: profile.stats?.followers ?? 0
        }
      },
      tweets: (tweets ?? []).map(tweet => ({
        id: tweet.id ?? '',
        text: tweet.text ?? '',
        date: tweet.created_at ?? '',
        stats: {
          replies: tweet.stats?.replies ?? 0,
          retweets: tweet.stats?.retweets ?? 0,
          likes: tweet.stats?.likes ?? 0,
          views: tweet.stats?.views ?? 0
        },
        media: Array.isArray(tweet.media)
          ? tweet.media.map(m => ({
              type: m?.type ?? '',
              url: m?.url ?? '',
              poster: m?.poster ?? ''
            }))
          : [],
        quoted: tweet.quoted_tweet
          ? {
              id: tweet.quoted_tweet.id ?? '',
              text: tweet.quoted_tweet.text ?? '',
              date: tweet.quoted_tweet.created_at ?? '',
              author: {
                name: tweet.quoted_tweet.author?.name ?? '',
                username: tweet.quoted_tweet.author?.username ?? '',
                avatar: tweet.quoted_tweet.author?.avatar_url ?? ''
              },
              media: Array.isArray(tweet.quoted_tweet.media)
                ? tweet.quoted_tweet.media.map(qm => ({
                    type: qm?.type ?? '',
                    url: qm?.url ?? '',
                    poster: qm?.poster ?? ''
                  }))
                : []
            }
          : null,
        is_pinned: tweet.is_pinned ?? false,
        is_retweet: tweet.is_retweet ?? false,
        retweeter: tweet.retweeter ?? null
      }))
    };
  } catch (err) {
    console.error('Error:', err?.message || err);
    throw new Error('Gagal mengambil data Twitter');
  }
}

module.exports = {
  stalkTwit
};


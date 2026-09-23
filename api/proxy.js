export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    // 1. If an environment API key is present in Vercel
    if (apiKey) {
        try {
            const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(q)}&key=${apiKey}`;
            const response = await fetch(ytUrl);
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const videos = data.items.map(item => ({
                    videoId: item.id.videoId,
                    title: item.snippet.title,
                    description: item.snippet.description || '',
                    link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    thumbnail: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
                    channelTitle: item.snippet.channelTitle
                }));
                return res.status(200).json({ videos });
            }
        } catch (err) {
            console.error('Official API proxy error, falling back to keyless scraper:', err);
        }
    }

    // 2. Keyless YouTube Search Extractor (Top 3 videos)
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        const ytHtml = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }).then(r => r.text());

        const videos = [];
        const seenIds = new Set();

        // Match videoRenderer blocks from YouTube initial data
        const regex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{.*?"text":"([^"]+)"\}.*?(?:"detailedMetadataSnippets":\[\{"snippetText":\{"runs":\[\{"text":"([^"]+)"\}|\})/g;

        let match;
        while ((match = regex.exec(ytHtml)) !== null && videos.length < 3) {
            const videoId = match[1];
            let title = match[2];
            let description = match[3] || `Watch ${title} on YouTube`;

            // Clean unicode escapes in title & description
            try {
                title = JSON.parse(`"${title}"`);
            } catch (e) {}
            try {
                description = JSON.parse(`"${description}"`);
            } catch (e) {}

            if (!seenIds.has(videoId)) {
                seenIds.add(videoId);
                videos.push({
                    videoId: videoId,
                    title: title,
                    description: description,
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                    channelTitle: q
                });
            }
        }

        // Fallback if specific regex was strict: search broad video IDs
        if (videos.length === 0) {
            const idMatches = ytHtml.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g) || [];
            for (const idStr of idMatches) {
                const vidId = idStr.split(':"')[1].replace('"', '');
                if (!seenIds.has(vidId) && videos.length < 3) {
                    seenIds.add(vidId);
                    videos.push({
                        videoId: vidId,
                        title: `${q} - Video ${videos.length + 1}`,
                        description: `Watch on YouTube: https://www.youtube.com/watch?v=${vidId}`,
                        link: `https://www.youtube.com/watch?v=${vidId}`,
                        thumbnail: `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`,
                        channelTitle: q
                    });
                }
            }
        }

        return res.status(200).json({ videos });
    } catch (err) {
        return res.status(500).json({ error: 'Proxy scrape failed', message: err.message });
    }
}

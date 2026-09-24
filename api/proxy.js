export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q, limit, channelLimit, action, channelId } = req.query;

    if (action === "channel_videos" && channelId) {
        try {
            const videos = [];
            
            // 1. Fetch channel videos page directly
            const chanUrl = `https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`;
            const chanRes = await fetch(chanUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cookie': 'CONSENT=YES+1'
                }
            });

            if (chanRes.ok) {
                const html = await chanRes.text();
                // Match videoId and clean title runs or text
                const vidRegex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{("runs":\[\{"text":"([^"]+)"\}\]|"simpleText":"([^"]+)")/g;
                let match;
                while ((match = vidRegex.exec(html)) !== null && videos.length < 30) {
                    const vidId = match[1];
                    const rawTitle = match[3] || match[4] || "Video";
                    if (!videos.some(v => v.videoId === vidId)) {
                        videos.push({
                            videoId: vidId,
                            title: rawTitle.replace(/\u0026/g, '&').replace(/&amp;/g, '&'),
                            link: `https://www.youtube.com/watch?v=${vidId}`,
                            thumbnail: `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`,
                            publishedTime: "Recent Upload"
                        });
                    }
                }
            }

            // 2. If videos still empty, fallback to channel search queries
            if (videos.length === 0) {
                const searchFallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(channelId)}`;
                const searchRes = await fetch(searchFallbackUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cookie': 'CONSENT=YES+1'
                    }
                });
                if (searchRes.ok) {
                    const searchHtml = await searchRes.text();
                    const fbRegex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g;
                    let fbMatch;
                    while ((fbMatch = fbRegex.exec(searchHtml)) !== null && videos.length < 20) {
                        const vidId = fbMatch[1];
                        const title = fbMatch[2] || "Video";
                        if (!videos.some(v => v.videoId === vidId)) {
                            videos.push({
                                videoId: vidId,
                                title: title.replace(/\u0026/g, '&').replace(/&amp;/g, '&'),
                                link: `https://www.youtube.com/watch?v=${vidId}`,
                                thumbnail: `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`,
                                publishedTime: "Upload"
                            });
                        }
                    }
                }
            }

            return res.status(200).json({ videos });
        } catch (err) {
            return res.status(500).json({ error: "Failed to fetch channel videos", message: err.message, videos: [] });
        }
    }

    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    const maxVideos = Math.min(parseInt(limit, 10) || 6, 16);
    const maxChannels = parseInt(channelLimit, 10) || 1;

    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        const ytHtml = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }).then(r => r.text());

        const channels = [];
        const seenChannels = new Set();
        const chMatches = ytHtml.match(/\{"channelRenderer":\{[\s\S]*?\}\}(?=\s*,\s*\{|\s*\])/g) || [];
        for (const rawCh of chMatches) {
            if (channels.length >= maxChannels) break;
            try {
                const idMatch = rawCh.match(/"channelId":"([^"]+)"/);
                const titleMatch = rawCh.match(/"title":\{"simpleText":"([^"]+)"\}/);
                const thumbMatch = rawCh.match(/"thumbnails":\[\{"url":"([^"]+)"/);
                const subsMatch = rawCh.match(/"subscriberCountText":\{[^}]*?"simpleText":"([^"]+)"\}/) || rawCh.match(/"label":"([^"]*?subscribers[^"]*?)"/i);
                const descMatch = rawCh.match(/"descriptionSnippet":\{"runs":\[\{"text":"([^"]+)"\}/);

                if (idMatch && titleMatch) {
                    const chId = idMatch[1];
                    if (!seenChannels.has(chId)) {
                        seenChannels.add(chId);
                        let title = titleMatch[1];
                        try { title = JSON.parse(`"${title}"`); } catch(e) {}
                        let desc = descMatch ? descMatch[1] : "Official YouTube Channel";
                        try { desc = JSON.parse(`"${desc}"`); } catch(e) {}
                        let subs = subsMatch ? subsMatch[1] : "Channel";

                        let thumb = thumbMatch ? thumbMatch[1] : "";
                        if (thumb.startsWith("//")) thumb = "https:" + thumb;

                        channels.push({
                            channelId: chId,
                            title,
                            subscribers: subs,
                            description: desc,
                            thumbnail: thumb
                        });
                    }
                }
            } catch (err) {}
        }

        const videos = [];
        const seenIds = new Set();
        const vidRegex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{.*?"text":"([^"]+)"\}.*?(?:"detailedMetadataSnippets":\[\{"snippetText":\{"runs":\[\{"text":"([^"]+)"\}|\})/g;

        let match;
        while ((match = vidRegex.exec(ytHtml)) !== null && videos.length < maxVideos) {
            const videoId = match[1];
            let title = match[2];
            let description = match[3] || `Watch ${title} on YouTube`;

            try { title = JSON.parse(`"${title}"`); } catch (e) {}
            try { description = JSON.parse(`"${description}"`); } catch (e) {}

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

        return res.status(200).json({ channels, videos });
    } catch (err) {
        return res.status(500).json({ error: 'Proxy scrape failed', message: err.message });
    }
}

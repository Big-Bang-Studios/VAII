export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q, limit, channelLimit, action, channelId, channelName, handle } = req.query;

    if (action === "channel_videos" && (channelId || channelName || handle)) {
        try {
            const videos = [];
            const targetUrls = [];

            // 1. If we have the exact handle, that is the most reliable URL on modern YouTube
            const cleanHandle = handle ? (handle.startsWith('@') ? handle : '@' + handle) : (channelName && channelName.startsWith('@') ? channelName : '');
            if (cleanHandle) {
                targetUrls.push(`https://www.youtube.com/${encodeURIComponent(cleanHandle)}/videos`);
            }

            // 2. Direct channel ID fallback
            if (channelId) {
                targetUrls.push(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`);
            }

            // 3. Fallback: guess handle by removing spaces if cleanHandle wasn't available
            if (!cleanHandle && channelName) {
                const guessed = '@' + channelName.trim().replace(/\s+/g, '');
                targetUrls.push(`https://www.youtube.com/${encodeURIComponent(guessed)}/videos`);
            }

            for (const cUrl of targetUrls) {
                if (videos.length > 0) break;
                try {
                    const chanRes = await fetch(cUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Cookie': 'SOCS=CAESEwgDEgk2MTc3MTA2MjQaAmVuIAEaBgiA_LyaBg;'
                        }
                    });

                    if (chanRes.ok) {
                        const html = await chanRes.text();
                        const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
                        let m;
                        while ((m = idRegex.exec(html)) !== null && videos.length < 30) {
                            const vidId = m[1];
                            if (!videos.some(v => v.videoId === vidId)) {
                                const windowStr = html.slice(m.index, m.index + 5500);

                                const lockupTitleMatch = windowStr.match(/"lockupMetadataViewModel":\{"title":\{"content":"([^"]+)"/);
                                const legacyRunsMatch = windowStr.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}/);
                                const simpleTextMatch = windowStr.match(/"title":\{"simpleText":"([^"]+)"\}/);
                                const labelMatch = windowStr.match(/"accessibility":\{"accessibilityData":\{"label":"([^"]+?)(?:\s+by\s+.*?)?\"\}/);

                                const rawTitle = lockupTitleMatch?.[1] || legacyRunsMatch?.[1] || simpleTextMatch?.[1] || labelMatch?.[1] || "Upload";

                                const timeMatch = windowStr.match(/"metadataParts":\[.*?"text":\{"content":"([^"]+ago)"\}/);
                                const publishedTime = timeMatch ? timeMatch[1] : "Upload";

                                const title = rawTitle
                                    .replace(/\\u0026/g, '&')
                                    .replace(/&amp;/g, '&')
                                    .replace(/\\"/g, '"');

                                videos.push({
                                    videoId: vidId,
                                    title,
                                    link: `https://www.youtube.com/watch?v=${vidId}`,
                                    thumbnail: `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`,
                                    publishedTime
                                });
                            }
                        }
                    }
                } catch (_) {}
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
        const chMatches = ytHtml.match(/"channelRenderer":\{[\s\S]*?(?=\}\s*,\s*\{\s*"channelRenderer"|\}\s*\]\s*\}\s*,\s*\{\s*"itemSectionRenderer"|$)/g) || [];
        for (const rawCh of chMatches) {
            if (channels.length >= maxChannels) break;
            try {
                const idMatch = rawCh.match(/"channelId":"([^"]+)"/);
                const titleMatch = rawCh.match(/"title":\{"simpleText":"([^"]+)"\}/);
                const handleMatch = rawCh.match(/"canonicalBaseUrl":"\/(@[^"]+)"/);
                const thumbMatch = rawCh.match(/"thumbnails":\[\{"url":"([^"]+)"/);
                const subsMatch = rawCh.match(/([0-9.]+[KMBkmb]?\s+subscribers?)/i) || rawCh.match(/"label":"([^"]*?subscribers?)"/i);
                const descMatch = rawCh.match(/"descriptionSnippet":\{"runs":\[\{"text":"([^"]+)"\}/);

                if (idMatch && titleMatch) {
                    const chId = idMatch[1];
                    if (!seenChannels.has(chId)) {
                        seenChannels.add(chId);
                        let title = titleMatch[1];
                        try { title = JSON.parse(`"${title}"`); } catch(e) {}
                        let desc = descMatch ? descMatch[1] : "Official YouTube Channel";
                        try { desc = JSON.parse(`"${desc}"`); } catch(e) {}
                        let subs = subsMatch ? subsMatch[1] : "";
                        let handleStr = handleMatch ? handleMatch[1] : "";

                        let thumb = thumbMatch ? thumbMatch[1] : "";
                        if (thumb.startsWith("//")) thumb = "https:" + thumb;

                        channels.push({
                            channelId: chId,
                            title,
                            handle: handleStr,
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

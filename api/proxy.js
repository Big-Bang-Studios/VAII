const PRODUCTION_ORIGIN = 'https://vaii-two.vercel.app';

function isAllowedOrigin(origin) {
    if (origin === PRODUCTION_ORIGIN) return true;

    try {
        const parsedOrigin = new URL(origin);
        return parsedOrigin.origin === origin
            && ['http:', 'https:'].includes(parsedOrigin.protocol)
            && ['localhost', '127.0.0.1', '[::1]'].includes(parsedOrigin.hostname);
    } catch {
        return false;
    }
}

export default async function handler(req, res) {
    const origin = req.headers.origin;
    const allowedOrigin = typeof origin === 'string' && isAllowedOrigin(origin);
    const sameOriginRequest = !origin && req.headers['sec-fetch-site'] === 'same-origin';

    res.setHeader('Vary', 'Origin, Sec-Fetch-Site');
    if (!allowedOrigin && !sameOriginRequest) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    if (allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, q, limit, channelLimit, action, channelId, channelName, handle } = req.query;

    if (action === 'ebay_search') {
        const searchTerm = typeof q === 'string' ? q.trim() : '';
        if (!searchTerm) {
            return res.status(400).json({ error: 'Missing query parameter "q"' });
        }

        const apiKey = process.env.SERPAPI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                error: 'eBay listings require SERPAPI_API_KEY to be configured on the server.'
            });
        }

        const resultLimit = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 12);
        try {
            const searchUrl = new URL('https://serpapi.com/search.json');
            searchUrl.searchParams.set('engine', 'ebay');
            searchUrl.searchParams.set('_nkw', searchTerm);
            searchUrl.searchParams.set('_ipg', '25');
            searchUrl.searchParams.set('api_key', apiKey);
            const response = await fetch(searchUrl, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                return res.status(502).json({ error: `SerpApi returned ${response.status} for eBay search` });
            }

            const data = await response.json();
            if (typeof data.error === 'string') {
                return res.status(502).json({ error: `SerpApi eBay search failed: ${data.error}` });
            }
            const listings = (Array.isArray(data.organic_results) ? data.organic_results : [])
                .slice(0, resultLimit)
                .flatMap((item) => {
                    let link;
                    try {
                        link = new URL(item.link);
                    } catch (_) {
                        return [];
                    }
                    if (link.protocol !== 'https:' || !['www.ebay.com', 'ebay.com'].includes(link.hostname) || typeof item.title !== 'string') {
                        return [];
                    }

                    const price = item.price?.raw
                        || (item.price?.from?.raw && item.price?.to?.raw
                            ? `${item.price.from.raw} - ${item.price.to.raw}`
                            : item.price?.from?.raw || item.price?.to?.raw || '');
                    return [{
                        title: item.title,
                        price,
                        condition: typeof item.condition === 'string' ? item.condition : '',
                        link: link.href,
                        image: typeof item.thumbnail === 'string' && /^https:\/\/.*\.ebayimg\.com\//i.test(item.thumbnail)
                            ? item.thumbnail
                            : ''
                    }];
                });

            return res.status(200).json({ query: searchTerm, listings });
        } catch (err) {
            return res.status(500).json({ error: 'eBay search failed', message: err.message });
        }
    }

    // Generic JSON / CORS proxy passthrough
    if (url) {
        try {
            const decodedUrl = decodeURIComponent(url);
            const targetRes = await fetch(decodedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*'
                }
            });
            if (!targetRes.ok) {
                return res.status(targetRes.status).json({ error: `Upstream returned ${targetRes.status}` });
            }
            const data = await targetRes.json();
            return res.status(200).json(data);
        } catch (err) {
            return res.status(500).json({ error: 'Proxy fetch failed', message: err.message });
        }
    }

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

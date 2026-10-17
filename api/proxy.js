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

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
        throw new Error(`Upstream returned ${response.status}`);
    }
    return response.json();
}

function parseWebUrl(value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 2048) return null;
    try {
        const parsed = new URL(value.trim());
        return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password
            ? parsed
            : null;
    } catch {
        return null;
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

    if (action === 'shorten') {
        const targetUrl = parseWebUrl(req.query.target);
        if (!targetUrl) {
            return res.status(400).json({ error: 'Provide a valid HTTP or HTTPS URL to shorten.' });
        }
        try {
            const shortenUrl = new URL('https://is.gd/create.php');
            shortenUrl.searchParams.set('format', 'json');
            shortenUrl.searchParams.set('url', targetUrl.href);
            const data = await fetchJson(shortenUrl);
            if (typeof data.shorturl !== 'string' || !parseWebUrl(data.shorturl)) {
                return res.status(502).json({ error: data.errormessage || 'is.gd did not return a shortened URL.' });
            }
            return res.status(200).json({ originalUrl: targetUrl.href, shortUrl: data.shorturl });
        } catch (err) {
            return res.status(502).json({ error: 'URL shortening failed', message: err.message });
        }
    }

    if (action === 'expand') {
        const shortUrl = parseWebUrl(req.query.target);
        if (!shortUrl) {
            return res.status(400).json({ error: 'Provide a valid HTTP or HTTPS short URL to expand.' });
        }
        try {
            const expandUrl = new URL(`https://unshorten.me/json/${encodeURIComponent(shortUrl.href)}`);
            const data = await fetchJson(expandUrl);
            const expandedUrl = parseWebUrl(data.resolved_url);
            if (!data.success || !expandedUrl) {
                return res.status(422).json({ error: data.error || 'The short URL could not be expanded.' });
            }
            return res.status(200).json({ shortUrl: shortUrl.href, expandedUrl: expandedUrl.href });
        } catch (err) {
            return res.status(502).json({ error: 'URL expansion failed', message: err.message });
        }
    }

    if (action === 'upcoming_launches') {
        const resultLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 5);
        try {
            const launchesUrl = new URL('https://ll.thespacedevs.com/2.2.0/launch/upcoming/');
            launchesUrl.searchParams.set('limit', String(resultLimit));
            const data = await fetchJson(launchesUrl);
            return res.status(200).json({
                results: (Array.isArray(data.results) ? data.results : []).slice(0, resultLimit)
            });
        } catch (err) {
            return res.status(502).json({ error: 'Upcoming launch lookup failed', message: err.message });
        }
    }

    if (action === 'minecraft_status') {
        const address = typeof req.query.address === 'string' ? req.query.address.trim() : '';
        const match = address.match(/^([a-z0-9.-]+)(?::(\d{1,5}))?$/i);
        if (!match || match[1].startsWith('.') || match[1].endsWith('.') || match[1].includes('..')) {
            return res.status(400).json({ error: 'Provide a valid Minecraft server hostname, optionally with a port.' });
        }
        const port = match[2] ? Number(match[2]) : null;
        if (port !== null && (port < 1 || port > 65535)) {
            return res.status(400).json({ error: 'Minecraft server port must be between 1 and 65535.' });
        }
        try {
            const statusUrl = new URL(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(address)}`);
            const data = await fetchJson(statusUrl);
            return res.status(200).json(data);
        } catch (err) {
            return res.status(502).json({ error: 'Minecraft server lookup failed', message: err.message });
        }
    }

    if (action === 'color_lookup') {
        const hex = typeof req.query.hex === 'string' ? req.query.hex.replace(/^#/, '') : '';
        if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
            return res.status(400).json({ error: 'Provide a valid 3- or 6-digit hexadecimal color.' });
        }
        try {
            const colorUrl = new URL('https://www.thecolorapi.com/id');
            colorUrl.searchParams.set('hex', hex.length === 3 ? [...hex].map((digit) => digit + digit).join('') : hex);
            const data = await fetchJson(colorUrl);
            return res.status(200).json(data);
        } catch (err) {
            return res.status(502).json({ error: 'Color lookup failed', message: err.message });
        }
    }

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

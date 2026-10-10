export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url, q, limit, channelLimit, action, channelId, channelName, handle } = req.query;

    if (action === 'ebay_search') {
        const searchTerm = typeof q === 'string' ? q.trim() : '';
        if (!searchTerm) {
            return res.status(400).json({ error: 'Missing query parameter "q"' });
        }

        const resultLimit = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 12);
        try {
            const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            if (!response.ok) {
                return res.status(502).json({ error: `eBay returned ${response.status}` });
            }

            const html = await response.text();
            const itemStarts = [...html.matchAll(/<li\b[^>]*class=["'][^"']*\bs-item\b[^"']*["'][^>]*>/gi)];
            const listings = [];
            const seenLinks = new Set();

            const extractText = (markup, className) => {
                const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const element = markup.match(new RegExp(
                    `<([a-z][a-z0-9]*)\\b[^>]*class=["'][^"']*\\b${escapedClass}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
                    'i'
                ));
                return element ? element[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
            };
            const decodeEntities = (value) => value
                .replace(/&amp;/gi, '&')
                .replace(/&quot;/gi, '"')
                .replace(/&#39;|&apos;/gi, "'")
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, '>')
                .replace(/&nbsp;/gi, ' ')
                .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
                .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));

            for (let index = 0; index < itemStarts.length && listings.length < resultLimit; index++) {
                const start = itemStarts[index].index;
                const end = index + 1 < itemStarts.length ? itemStarts[index + 1].index : html.length;
                const item = html.slice(start, end);
                const title = decodeEntities(extractText(item, 's-item__title'));
                const price = decodeEntities(extractText(item, 's-item__price'));
                const condition = decodeEntities(extractText(item, 'SECONDARY_INFO'));
                const linkMatch = item.match(/<a\b[^>]*class=["'][^"']*\bs-item__link\b[^"']*["'][^>]*href=["']([^"']+)["']/i)
                    || item.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*\bs-item__link\b[^"']*["']/i);
                if (!title || /^shop on ebay$/i.test(title) || !linkMatch) continue;

                let link;
                try {
                    link = new URL(decodeEntities(linkMatch[1]), searchUrl);
                } catch (_) {
                    continue;
                }
                if (link.protocol !== 'https:' || link.hostname !== 'www.ebay.com' || seenLinks.has(link.href)) continue;
                seenLinks.add(link.href);

                const imageMatch = item.match(/<img\b[^>]*class=["'][^"']*\bs-item__image-img\b[^"']*["'][^>]*>/i);
                const imageSource = imageMatch && (imageMatch[0].match(/\bdata-src=["']([^"']+)["']/i)
                    || imageMatch[0].match(/\bsrc=["']([^"']+)["']/i));
                let image = '';
                if (imageSource) {
                    try {
                        const imageUrl = new URL(decodeEntities(imageSource[1]), searchUrl);
                        if (imageUrl.protocol === 'https:' && /\.ebayimg\.com$/i.test(imageUrl.hostname)) {
                            image = imageUrl.href;
                        }
                    } catch (_) {}
                }

                listings.push({ title, price, condition, link: link.href, image });
            }

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

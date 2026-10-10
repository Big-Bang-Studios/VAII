[1mdiff --git a/script.js b/script.js[m
[1mindex 23d3f31..87e608f 100644[m
[1m--- a/script.js[m
[1m+++ b/script.js[m
[36m@@ -3105,16 +3105,18 @@[m [mfunction compileFinalSourceIndexBox(query, wikiData) {[m
                     <strong>📺 ${wikiData.youtube.title}</strong><br>[m
                     <em style="color: #bbb; font-size: 0.85rem;">${wikiData.youtube.text}</em>[m
             ${(() => {[m
[31m-                      const ch = (window._vaiiCurrentWikiChannel = wikiData.channel);[m
[31m-                      return `<div onclick="const c = window._vaiiCurrentWikiChannel; window.openVAIIChannelView(c.channelId, c.title, c.subscribers, '', c.thumbnail, c.handle);" style="display: flex; gap: 10px; align-items: center; background: #222; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: 1px solid #333; margin: 10px 0 6px 0; text-align: left;">[m
[31m-                    <img src="${ch.thumbnail || "https://www.youtube.com/s/desktop/f67cc957/img/favicon_144x144.png"}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">[m
[31m-                    <div style="overflow: hidden; flex: 1;">[m
[31m-                        <div style="font-size: 0.85rem; font-weight: bold; color: #fff;">${ch.title} <span style="font-size: 0.72rem; color: #ff8888; font-weight: normal; margin-left: 4px;">${ch.subscribers}</span></div>[m
[31m-                        <div style="font-size: 0.72rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(ch.description || '')}</div>[m
[31m-                    </div>[m
[31m-                    <span style="color: #4da3ff; font-size: 0.75rem; font-weight: bold;">View ➔</span>[m
[31m-                </div>`;[m
[31m-            })()}[m
[32m+[m[32m                        const ch = wikiData.channel;[m
[32m+[m[32m                        if (!ch || !ch.channelId) return "";[m
[32m+[m[32m                        window._vaiiWikiChannel = ch;[m
[32m+[m[32m                        return `<div onclick="if(window._vaiiWikiChannel){const c=window._vaiiWikiChannel; window.openVAIIChannelView(c.channelId, c.title, c.subscribers, c.description || '', c.thumbnail, c.handle);}" style="display: flex; gap: 10px; align-items: center; background: #222; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: 1px solid #333; margin: 10px 0 6px 0; text-align: left;">[m
[32m+[m[32m                                <img src="${ch.thumbnail || "https://www.youtube.com/s/desktop/f67cc957/img/favicon_144x144.png"}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">[m
[32m+[m[32m                                <div style="overflow: hidden; flex: 1;">[m
[32m+[m[32m                                    <div style="font-size: 0.85rem; font-weight: bold; color: #fff;">${escapeHtml(ch.title || "")} <span style="font-size: 0.72rem; color: #ff8888; font-weight: normal; margin-left: 4px;">${escapeHtml(ch.subscribers || "")}</span></div>[m
[32m+[m[32m                                    <div style="font-size: 0.72rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(ch.description || "")}</div>[m
[32m+[m[32m                                </div>[m
[32m+[m[32m                                <span style="color: #4da3ff; font-size: 0.75rem; font-weight: bold;">View ➔</span>[m
[32m+[m[32m                            </div>`;[m
[32m+[m[32m                    })()}[m
                     ${videosListHtml}[m
                 </div>[m
             `);[m

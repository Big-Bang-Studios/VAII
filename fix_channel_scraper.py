import re

with open("api/proxy.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace the channel splitter so it captures the full channelRenderer block
old_split_pattern = r'const chMatches = ytHtml\.match\(/.*?channelRenderer.*?/g\) \|\| \[\];'
new_split = 'const chMatches = ytHtml.match(/"channelRenderer":\{[\s\S]*?(?="subscriptionButton"|"subscriberCountText"|"viewChannelButton"|"channelId":|$)/g) || [];'

code = re.sub(old_split_pattern, new_split, code)

# Ensure subsMatch checks videoCountText and simpleText/accessibilityData
old_subs_pattern = r'const subsMatch = rawCh\.match\(/.*?subscribers?.*?\);'
new_subs = '''const subsMatch = rawCh.match(/"(?:videoCountText|subscriberCountText)":\{[^}]*?"simpleText":"([^"]+)"\}/) ||
                          rawCh.match(/"label":"([^"]*?subscribers?)"/i) ||
                          rawCh.match(/([0-9.]+[KMBkmb]?\\s+subscribers?)/i);'''

code = re.sub(old_subs_pattern, new_subs, code)

# Ensure fallback doesn't output "Channel"
code = code.replace('let subs = subsMatch ? subsMatch[1] : "Channel";', 'let subs = subsMatch ? subsMatch[1] : "";')
code = code.replace('let subs = subsMatch ? subsMatch[1] : "Subscribers unavailable";', 'let subs = subsMatch ? subsMatch[1] : "";')

with open("api/proxy.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Channel scraper successfully updated!")

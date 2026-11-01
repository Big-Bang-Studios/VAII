const COMMANDS = [
    { aliases: ["convert", "currency", "exchange", "fx"], syntax: "convert [amount] [from-currency] to [currency]", examples: ["convert 100 USD to EUR", "fx 50 GBP to JPY"], mode: "argument" },
    { aliases: ["calculator", "calc", "calculate", "math"], syntax: "calc [expression]", examples: ["calc 25 * 4", "calculator sqrt(144)"], mode: "argument" },
    { aliases: ["timer", "countdown", "set timer"], syntax: "timer [duration]", examples: ["timer 5m", "countdown 1m30s"], mode: "argument" },
    { aliases: ["stopwatch", "sw", "start stopwatch"], syntax: "stopwatch", examples: ["stopwatch"], mode: "none" },
    { aliases: ["repo", "github", "repository"], syntax: "repo [owner/repository]", examples: ["repo facebook/react", "github vercel/next.js"], mode: "argument" },
    { aliases: ["movie", "film", "ticket", "tickets", "stream", "watch"], syntax: "[movie|film|tickets|stream|watch] [title]", examples: ["movie Inception", "watch The Matrix"], mode: "argument" },
    { aliases: ["define", "dictionary", "meaning", "meaning of", "definition of", "definition for", "what is the meaning of", "what's the meaning of", "what does", "define the word"], syntax: "define [word]", examples: ["define serendipity", "meaning of ephemeral", "what does ephemeral mean"], mode: "argument" },
    { aliases: ["country", "flag of", "flag for", "flag", "tell me about country"], syntax: "country [country-name]", examples: ["country Japan", "flag of Brazil"], mode: "argument" },
    { aliases: ["drink", "cocktail", "recipe"], syntax: "drink [cocktail-name]", examples: ["drink Margarita", "random drink"], mode: "argument" },
    { aliases: ["random drink", "random cocktail", "surprise me with a drink"], syntax: "random drink", examples: ["random drink", "random cocktail"], mode: "none" },
    { aliases: ["song", "music", "track", "play"], syntax: "[song|music|track|play] [title or artist]", examples: ["song Bohemian Rhapsody", "play Daft Punk"], mode: "argument" },
    { aliases: ["anime", "animation", "anime series"], syntax: "anime [title]", examples: ["anime One Piece", "animation Naruto"], mode: "argument" },
    { aliases: ["manga", "comic", "manga series"], syntax: "manga [title]", examples: ["manga Berserk", "comic One Piece"], mode: "argument" },
    { aliases: ["book", "novel", "find a book"], syntax: "book [title or author]", examples: ["book The Hobbit", "novel Jane Austen"], mode: "argument" },
    { aliases: ["open", "browse", "visit"], syntax: "open [website or domain]", examples: ["open Wikipedia", "visit example.com"], mode: "argument" },
    { aliases: ["html", "editor", "htmleditor"], syntax: "editor [optional HTML]", examples: ["editor", "html <h1>Hello</h1>"], mode: "optional" },
    { aliases: ["shorten", "shorturl", "make short link"], syntax: "shorten [URL]", examples: ["shorten https://example.com", "shorturl https://example.com"], mode: "argument" },
    { aliases: ["expand", "unshorten", "reveal short link"], syntax: "expand [short URL]", examples: ["expand https://is.gd/example", "unshorten https://is.gd/example"], mode: "argument" },
    { aliases: ["launches", "spacex", "rocket launches"], syntax: "launches", examples: ["launches", "spacex"], mode: "none" },
    { aliases: ["color", "hex", "colour"], syntax: "color [hex-code]", examples: ["color #ff0055", "hex 7289da"], mode: "argument" },
    { aliases: ["subnet", "cidr", "subnet calculator"], syntax: "subnet [IPv4 address]/[prefix]", examples: ["subnet 192.168.1.0/24", "cidr 10.0.0.0/16"], mode: "argument" },
    { aliases: ["mc", "minecraft", "server"], syntax: "mc [server-address]", examples: ["mc hypixel.net"], mode: "argument" },
    { aliases: ["http", "statuscat", "http cat"], syntax: "http [status-code]", examples: ["http 404", "statuscat 500"], mode: "argument" },
    { aliases: ["avatar", "profile picture", "make avatar"], syntax: "avatar [username or seed]", examples: ["avatar VAiiGuest"], mode: "argument" },
    { aliases: ["ebay", "shop", "ebay search"], syntax: "ebay [product search]", examples: ["ebay noise cancelling headphones"], mode: "argument" },
    { aliases: ["bored", "activity", "random activity"], syntax: "bored", examples: ["bored", "random activity"], mode: "none" },
    { aliases: ["ghuser", "githubuser", "github user"], syntax: "ghuser [username]", examples: ["ghuser torvalds"], mode: "argument" },
    { aliases: ["asciiweather", "terminal weather", "ascii weather"], syntax: "asciiweather [city]", examples: ["asciiweather London"], mode: "argument" },
    { aliases: ["isbn", "bookisbn", "lookup isbn"], syntax: "isbn [ISBN-10 or ISBN-13]", examples: ["isbn 9780140328721"], mode: "optional" },
    { aliases: ["whereami", "locate", "my location"], syntax: "whereami", examples: ["whereami", "locate"], mode: "none" },
    { aliases: ["chuck", "chucknorris", "chuck norris joke"], syntax: "chuck", examples: ["chuck"], mode: "none" },
    { aliases: ["crypto", "coin", "token"], syntax: "crypto [symbol]", examples: ["crypto BTC", "coin ETH"], mode: "argument" },
    { aliases: ["status", "servicestatus", "service status"], syntax: "status [provider]", examples: ["status github", "status cloudflare"], mode: "optional" },
    { aliases: ["airquality", "aqi", "air quality"], syntax: "airquality [city]", examples: ["airquality Tokyo", "aqi Los Angeles"], mode: "argument" },
    { aliases: ["holiday", "holidays", "public holidays"], syntax: "holiday [country-code]", examples: ["holiday US", "holiday GB"], mode: "argument" },
    { aliases: ["battery", "power", "battery status"], syntax: "battery", examples: ["battery", "power"], mode: "none" },
    { aliases: ["speed", "network", "connection"], syntax: "speed", examples: ["speed", "network"], mode: "none" },
    { aliases: ["spaceweather", "solarwind", "solar wind"], syntax: "spaceweather", examples: ["spaceweather", "solarwind"], mode: "none" },
    { aliases: ["onthisday", "history", "today in history"], syntax: "onthisday", examples: ["onthisday", "history"], mode: "none" },
    { aliases: ["earthquake", "earthquakes", "quakes", "seismic"], syntax: "earthquakes", examples: ["earthquakes", "seismic"], mode: "none" },
    { aliases: ["bsky", "bluesky", "blue sky"], syntax: "bsky [handle]", examples: ["bsky jay.bsky.team"], mode: "argument" },
    { aliases: ["wayback", "archive", "snapshot"], syntax: "archive [domain or URL]", examples: ["archive wikipedia.org"], mode: "argument" },
    { aliases: ["npm", "package", "npm package"], syntax: "npm [package-name]", examples: ["npm express"], mode: "argument" },
    { aliases: ["space", "whoisinspace", "astronauts"], syntax: "space", examples: ["space", "whoisinspace"], mode: "none" },
    { aliases: ["flight", "aircraft", "track flight"], syntax: "flight [callsign]", examples: ["flight UAL420"], mode: "argument" },
    { aliases: ["neo", "asteroid", "asteroids"], syntax: "neo", examples: ["neo", "asteroids"], mode: "none" },
    { aliases: ["dns", "dig", "nslookup"], syntax: "dns [domain]", examples: ["dns google.com", "dig github.com"], mode: "argument" },
    { aliases: ["barcode", "food", "product"], syntax: "barcode [numeric UPC/EAN]", examples: ["barcode 737628064502"], mode: "optional" },
    { aliases: ["chat", "contact", "open chat"], syntax: "chat", examples: ["chat"], mode: "none" },
    { aliases: ["terminal", "shell", "sandbox"], syntax: "terminal", examples: ["terminal", "shell"], mode: "none" },
    { aliases: ["qr", "qrcode", "qr code"], syntax: "qr [text or URL]", examples: ["qr https://example.com"], mode: "argument" },
    { aliases: ["iss", "orbit", "space station", "where is the iss"], syntax: "iss", examples: ["iss", "orbit"], mode: "none" },
    { aliases: ["duck", "ducks", "random duck"], syntax: "duck", examples: ["duck", "random duck"], mode: "none" },
    { aliases: ["zip", "postal", "postal code"], syntax: "zip [postal code or city]", examples: ["zip 90210", "postal London"], mode: "argument" },
    { aliases: ["college", "university", "find a college"], syntax: "college [school name]", examples: ["college Stanford", "university MIT"], mode: "argument" },
    { aliases: ["nasa", "apod", "astronomy"], syntax: "nasa", examples: ["nasa", "apod"], mode: "none" },
    { aliases: ["advice", "quote", "give me advice"], syntax: "advice", examples: ["advice", "quote"], mode: "none" },
    { aliases: ["age", "predict age", "estimate age"], syntax: "age [first name]", examples: ["age Logan", "predict age Alex"], mode: "argument" },
    { aliases: ["dog", "dogs", "random dog"], syntax: "dog", examples: ["dog", "random dog"], mode: "none" },
    { aliases: ["cat", "cats", "random cat"], syntax: "cat", examples: ["cat", "random cat"], mode: "none" },
    { aliases: ["ip", "my ip", "ip lookup", "what is my ip"], syntax: "my ip", examples: ["my ip", "ip lookup"], mode: "none" },
    { aliases: ["trivia", "quiz", "trivia question"], syntax: "trivia", examples: ["trivia", "quiz"], mode: "none" },
    { aliases: ["free games", "free game", "deals", "giveaways"], syntax: "free games", examples: ["free games", "deals"], mode: "none" },
    { aliases: ["joke", "tell me a joke", "tell me a random joke", "tell me something funny", "random joke", "make me laugh", "dadjoke"], syntax: "joke", examples: ["joke", "tell me a joke"], mode: "none" },
    { aliases: ["pokemon", "pokedex", "pokemon lookup"], syntax: "pokemon [name or number]", examples: ["pokemon Charizard"], mode: "argument" },
    { aliases: ["news", "top news", "latest news about"], syntax: "news [optional: about topic]", examples: ["news", "news about technology"], mode: "optional" },
    { aliases: ["note", "remember", "add note"], syntax: "note: [text]", examples: ["note: Check server deployments", "remember to call mom"], mode: "argument" },
    { aliases: ["show notes", "my notes", "notes"], syntax: "show notes", examples: ["show notes", "my notes"], mode: "none" },
    { aliases: ["draw", "art", "generate image"], syntax: "draw [image description]", examples: ["draw a cyberpunk city"], mode: "argument" },
    { aliases: ["call", "dial", "call phone"], syntax: "call [phone number]", examples: ["call 555-0199"], mode: "argument" },
    { aliases: ["text", "sms", "msg"], syntax: "text [phone number] [optional message]", examples: ["text 555-0199 on my way"], mode: "argument" },
    { aliases: ["reserve", "reservation", "order", "find"], syntax: "[reserve|order|find] [food or restaurant] [city]", examples: ["reserve sushi New York", "order pizza Orlando"], mode: "argument" },
    { aliases: ["weather", "forecast", "weather report", "weather in", "weather for", "forecast for", "temperature in", "current weather in", "weather like in", "the weather in", "find the weather in", "what is the weather in", "what's the weather in", "whats the weather in", "what's the temperature in"], syntax: "weather [optional city]", examples: ["weather", "weather in London", "what's the weather in Tokyo"], mode: "optional" },
    { aliases: ["school", "vaii school", "classroom"], syntax: "school", examples: ["school", "vaii school"], mode: "none" },
    { aliases: ["map", "map of", "show map", "show me a map of", "show a map of"], syntax: "map of [place]", examples: ["map of Tokyo", "show me a map of Paris"], mode: "argument" },
    { aliases: ["time in", "clock", "current time in", "the current time in", "what time is it in"], syntax: "time in [city]", examples: ["time in London", "what time is it in Tokyo"], mode: "argument" },
    { aliases: ["sunrise", "sunset", "sunrise time", "sunset time"], syntax: "[sunrise|sunset] [optional city]", examples: ["sunrise", "sunset in Tokyo"], mode: "optional" }
];

const aliasEntries = COMMANDS.flatMap(command =>
    command.aliases.map(alias => ({ alias, command }))
).sort((left, right) => right.alias.length - left.alias.length);

const COMMAND_REWRITES = new Map(COMMANDS.flatMap(command =>
    command.aliases.map(alias => [alias, command.aliases[0]])
));

for (const alias of ["calculator", "calc", "calculate", "math"]) COMMAND_REWRITES.set(alias, "");
for (const alias of ["space", "whoisinspace", "astronauts"]) COMMAND_REWRITES.set(alias, alias);
for (const alias of ["movie", "film", "ticket", "tickets", "stream", "watch", "play"]) COMMAND_REWRITES.set(alias, alias);
for (const alias of ["song", "music", "track"]) COMMAND_REWRITES.set(alias, alias === "song" ? "song" : "song");
for (const alias of ["sunrise", "sunset", "time in", "map of", "show map", "where is the iss", "random drink", "top news", "show notes", "my notes"]) {
    COMMAND_REWRITES.set(alias, alias);
}
for (const alias of ["html", "editor", "htmleditor"]) COMMAND_REWRITES.set(alias, alias);

const COMMAND_REWRITES_OVERRIDES = new Map([
    ["currency", "convert"], ["exchange", "convert"], ["fx", "convert"],
    ["repository", "repo"], ["dictionary", "define"], ["meaning", "define"], ["meaning of", "define"],
    ["definition of", "define"], ["definition for", "define"], ["what is the meaning of", "define"], ["what's the meaning of", "define"],
    ["what does", "define"], ["define the word", "define"],
    ["flag", "country"], ["flag of", "country"], ["flag for", "country"], ["tell me about country", "country"], ["cocktail", "drink"], ["recipe", "drink"],
    ["browse", "open"], ["visit", "open"], ["shorturl", "shorten"], ["unshorten", "expand"],
    ["colour", "color"], ["minecraft", "mc"], ["server", "mc"],
    ["profile picture", "avatar"], ["shop", "ebay"], ["random activity", "bored"], ["activity", "bored"],
    ["githubuser", "ghuser"], ["github user", "ghuser"], ["weather report", "weather"],
    ["bookisbn", "isbn"], ["my location", "whereami"], ["chucknorris", "chuck"],
    ["coin", "crypto"], ["token", "crypto"], ["servicestatus", "status"],
    ["air quality", "airquality"], ["holidays", "holiday"], ["connection", "speed"],
    ["rocket launches", "launches"], ["space station", "iss"], ["dadjoke", "joke"], ["tell me something funny", "joke"],
    ["product", "barcode"], ["art", "draw"], ["forecast", "weather"], ["notes", "show notes"],
    ["classroom", "school"], ["map", "map of"], ["show me a map of", "map of"], ["show a map of", "map of"], ["clock", "time in"],
    ["current time in", "time in"], ["the current time in", "time in"], ["what time is it in", "time in"],
    ["animation", "anime"], ["comic", "manga"], ["predict age", "age"],
    ["remember", "note:"], ["add note", "note:"], ["random cocktail", "random drink"],
    ["open", "open"], ["news", "news"], ["note", "note:"]
]);

for (const [alias, replacement] of COMMAND_REWRITES_OVERRIDES) COMMAND_REWRITES.set(alias, replacement);
for (const alias of ["weather in", "weather for", "forecast for", "temperature in", "current weather in", "weather like in", "the weather in", "find the weather in", "what is the weather in", "what's the weather in", "whats the weather in", "what's the temperature in"]) {
    COMMAND_REWRITES.set(alias, "weather");
}
for (const alias of ["tell me a random joke", "random joke"]) COMMAND_REWRITES.set(alias, "joke");
COMMAND_REWRITES.set("latest news about", "news about");
COMMAND_REWRITES.set("sunrise time", "sunrise");
COMMAND_REWRITES.set("sunset time", "sunset");

function matchCommand(query) {
    const trimmed = String(query || "").trim();
    const withoutSlash = trimmed.replace(/^\//, "");
    const lower = withoutSlash.toLowerCase();
    return aliasEntries.find(({ alias }) =>
        lower === alias || lower.startsWith(`${alias} `)
    ) || null;
}

export function normalizeNativeCommand(query) {
    const trimmed = String(query || "").trim();
    const match = matchCommand(trimmed);
    if (!match) return query;
    const withoutSlash = trimmed.replace(/^\//, "");
    let argument = withoutSlash.slice(match.alias.length).trim();
    const replacement = COMMAND_REWRITES.get(match.alias);
    if (match.alias === "what does") argument = argument.replace(/\s+mean\??$/i, "").trim();
    if (match.alias === "show map") argument = argument.replace(/^of\s+/i, "");
    if (match.alias === "stream" && /^song(?:\s|$)/i.test(argument)) return withoutSlash;
    if (replacement === "") return argument;
    if (replacement) return `${replacement}${argument ? ` ${argument}` : ""}`;
    return withoutSlash;
}

export function getNativeCommandSyntaxIssue(query) {
    const match = matchCommand(query);
    if (!match) return null;
    const trimmed = String(query || "").trim().replace(/^\//, "");
    const argument = trimmed.slice(match.alias.length).trim();
    const { command } = match;
    if (command.mode === "argument" && !argument) return command;
    if (command.mode === "none" && argument) return command;
    return null;
}

export function getNativeCommandSuggestions(input) {
    const prefix = String(input || "").trim().replace(/^\//, "").toLowerCase();
    if (!prefix) return [];
    const exactCommand = aliasEntries.find(({ alias }) => alias === prefix)?.command;
    const matchingAliases = exactCommand
        ? exactCommand.aliases
        : aliasEntries
            .filter(({ alias }) => alias.startsWith(prefix))
            .sort((left, right) =>
                Number(right.alias === right.command.aliases[0]) - Number(left.alias === left.command.aliases[0])
                || right.alias.length - left.alias.length
            )
            .map(({ alias }) => alias);
    return [...new Set(matchingAliases
        .map(alias => {
            const command = aliasEntries.find(entry => entry.alias === alias)?.command;
            return command?.mode === "argument" ? `${alias} ` : alias;
        }))]
        .slice(0, 12);
}

export function getNativeCommandDefinitions() {
    return COMMANDS.map(command => ({
        aliases: [...command.aliases],
        mode: command.mode
    }));
}

function getSingleCommandTypoDistance(input, candidate) {
    if (input === candidate || Math.abs(input.length - candidate.length) > 1) return null;

    if (input.length === candidate.length) {
        const differences = [];
        for (let i = 0; i < input.length; i++) {
            if (input[i] !== candidate[i]) differences.push(i);
        }
        if (differences.length === 1) return { distance: 1, transposition: false };
        if (differences.length === 2 && differences[1] === differences[0] + 1 &&
            input[differences[0]] === candidate[differences[1]] &&
            input[differences[1]] === candidate[differences[0]]) {
            return { distance: 1, transposition: true };
        }
        return null;
    }

    const shorter = input.length < candidate.length ? input : candidate;
    const longer = input.length < candidate.length ? candidate : input;
    let shortIndex = 0;
    let longIndex = 0;
    let skipped = false;
    while (shortIndex < shorter.length && longIndex < longer.length) {
        if (shorter[shortIndex] === longer[longIndex]) {
            shortIndex++;
            longIndex++;
        } else if (skipped) {
            return null;
        } else {
            skipped = true;
            longIndex++;
        }
    }
    return { distance: 1, transposition: false };
}

export function autocorrectNativeCommandQuery(query) {
    const original = String(query || "");
    const request = original.trim();
    const requestPrefixes = [
        /^(?:hey|hi|hello)[,!\s]+/i,
        /^(?:please|kindly)\s+/i,
        /^(?:can|could|would|will) you(?: please)?\s+/i,
        /^(?:can|could) i get\s+/i,
        /^(?:i want to know|i want to|i need to know|i need to|i'd like to know|i'd like to)\s+/i,
        /^(?:tell me|show me|give me|find me|find the|look up(?: the)?|search for)\s+/i
    ];

    function matchAliasAtStart(text, allowTypo) {
        const words = [...text.matchAll(/\S+/g)].map(match => ({
            value: match[0].replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, "").toLowerCase(),
            start: match.index,
            end: match.index + match[0].length
        }));
        const candidates = [];
        for (const { alias } of aliasEntries) {
            const aliasWords = alias.toLowerCase().split(/\s+/);
            if (aliasWords.length > words.length) continue;

            let distance = 0;
            let correctionIndex = -1;
            let correction = "";
            for (let index = 0; index < aliasWords.length; index++) {
                if (words[index].value === aliasWords[index]) continue;
                if (!allowTypo) {
                    distance = 2;
                    break;
                }
                const typo = getSingleCommandTypoDistance(words[index].value, aliasWords[index]);
                if (!typo || (!typo.transposition && words[index].value.slice(0, 2) !== aliasWords[index].slice(0, 2))) {
                    distance = 2;
                    break;
                }
                distance++;
                correctionIndex = index;
                correction = aliasWords[index];
                if (distance > 1) break;
            }
            if (distance <= 1) {
                candidates.push({ alias, aliasWords, distance, correctionIndex, correction, end: words[aliasWords.length - 1].end });
            }
        }

        candidates.sort((left, right) =>
            left.distance - right.distance
            || right.aliasWords.length - left.aliasWords.length
            || right.alias.length - left.alias.length
        );
        const best = candidates[0];
        if (!best) return null;

        const consumed = text.slice(0, best.end).split(/\s+/);
        if (best.correctionIndex >= 0) consumed[best.correctionIndex] = best.correction;
        const correctedPrefix = consumed.join(" ");
        const tail = text.slice(best.end);
        return `${correctedPrefix}${tail}`.trim().replace(/\?+$/, "");
    }

    let candidate = request;
    for (let attempt = 0; attempt <= requestPrefixes.length; attempt++) {
        const prefix = requestPrefixes.find(pattern => pattern.test(candidate));
        if (!prefix) break;
        candidate = candidate.replace(prefix, "").trim();
        const exactPrefixedMatch = matchAliasAtStart(candidate, false);
        if (exactPrefixedMatch) return exactPrefixedMatch;
    }
    const exactMatch = matchAliasAtStart(request, false);
    if (exactMatch) return exactMatch;
    return matchAliasAtStart(candidate, true) || original;
}

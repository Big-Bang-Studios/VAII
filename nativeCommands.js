const COMMANDS = [
    { aliases: ["convert", "currency", "exchange", "fx"], syntax: "convert [amount] [from-currency] to [currency]", examples: ["convert 100 USD to EUR", "fx 50 GBP to JPY"], mode: "argument" },
    { aliases: ["calculator", "calc"], syntax: "calc [expression]", examples: ["calc 25 * 4", "calculator sqrt(144)"], mode: "argument" },
    { aliases: ["timer", "countdown"], syntax: "timer [duration]", examples: ["timer 5m", "countdown 1m30s"], mode: "argument" },
    { aliases: ["stopwatch", "sw"], syntax: "stopwatch", examples: ["stopwatch"], mode: "none" },
    { aliases: ["repo", "github", "repository"], syntax: "repo [owner/repository]", examples: ["repo facebook/react", "github vercel/next.js"], mode: "argument" },
    { aliases: ["movie", "film", "ticket", "tickets", "stream", "watch"], syntax: "[movie|film|tickets|stream|watch] [title]", examples: ["movie Inception", "watch The Matrix"], mode: "argument" },
    { aliases: ["define", "dictionary", "meaning"], syntax: "define [word]", examples: ["define serendipity", "meaning ephemeral"], mode: "argument" },
    { aliases: ["country", "flag of", "flag"], syntax: "country [country-name]", examples: ["country Japan", "flag of Brazil"], mode: "argument" },
    { aliases: ["drink", "cocktail", "recipe"], syntax: "drink [cocktail-name]", examples: ["drink Margarita", "random drink"], mode: "argument" },
    { aliases: ["random drink", "random cocktail"], syntax: "random drink", examples: ["random drink", "random cocktail"], mode: "none" },
    { aliases: ["song", "music", "track", "play"], syntax: "[song|music|track|play] [title or artist]", examples: ["song Bohemian Rhapsody", "play Daft Punk"], mode: "argument" },
    { aliases: ["anime", "animation"], syntax: "anime [title]", examples: ["anime One Piece", "animation Naruto"], mode: "argument" },
    { aliases: ["manga", "comic"], syntax: "manga [title]", examples: ["manga Berserk", "comic One Piece"], mode: "argument" },
    { aliases: ["book", "novel"], syntax: "book [title or author]", examples: ["book The Hobbit", "novel Jane Austen"], mode: "argument" },
    { aliases: ["open", "browse", "visit"], syntax: "open [website or domain]", examples: ["open Wikipedia", "visit example.com"], mode: "argument" },
    { aliases: ["html", "editor", "htmleditor"], syntax: "editor [optional HTML]", examples: ["editor", "html <h1>Hello</h1>"], mode: "optional" },
    { aliases: ["shorten", "shorturl"], syntax: "shorten [URL]", examples: ["shorten https://example.com"], mode: "argument" },
    { aliases: ["expand", "unshorten"], syntax: "expand [short URL]", examples: ["expand https://is.gd/example"], mode: "argument" },
    { aliases: ["launches", "spacex", "rocket launches"], syntax: "launches", examples: ["launches", "spacex"], mode: "none" },
    { aliases: ["color", "hex", "colour"], syntax: "color [hex-code]", examples: ["color #ff0055", "hex 7289da"], mode: "argument" },
    { aliases: ["subnet", "cidr"], syntax: "subnet [IPv4 address]/[prefix]", examples: ["subnet 192.168.1.0/24", "cidr 10.0.0.0/16"], mode: "argument" },
    { aliases: ["mc", "minecraft", "server"], syntax: "mc [server-address]", examples: ["mc hypixel.net"], mode: "argument" },
    { aliases: ["http", "statuscat"], syntax: "http [status-code]", examples: ["http 404", "statuscat 500"], mode: "argument" },
    { aliases: ["avatar", "profile picture"], syntax: "avatar [username or seed]", examples: ["avatar VAiiGuest"], mode: "argument" },
    { aliases: ["ebay", "shop"], syntax: "ebay [product search]", examples: ["ebay noise cancelling headphones"], mode: "argument" },
    { aliases: ["bored", "activity", "random activity"], syntax: "bored", examples: ["bored", "random activity"], mode: "none" },
    { aliases: ["ghuser", "githubuser", "github user"], syntax: "ghuser [username]", examples: ["ghuser torvalds"], mode: "argument" },
    { aliases: ["asciiweather", "weather report"], syntax: "asciiweather [city]", examples: ["asciiweather London"], mode: "argument" },
    { aliases: ["isbn", "bookisbn"], syntax: "isbn [ISBN-10 or ISBN-13]", examples: ["isbn 9780140328721"], mode: "optional" },
    { aliases: ["whereami", "locate", "my location"], syntax: "whereami", examples: ["whereami", "locate"], mode: "none" },
    { aliases: ["chuck", "chucknorris"], syntax: "chuck", examples: ["chuck"], mode: "none" },
    { aliases: ["crypto", "coin", "token"], syntax: "crypto [symbol]", examples: ["crypto BTC", "coin ETH"], mode: "argument" },
    { aliases: ["status", "servicestatus"], syntax: "status [provider]", examples: ["status github", "status cloudflare"], mode: "optional" },
    { aliases: ["airquality", "aqi", "air quality"], syntax: "airquality [city]", examples: ["airquality Tokyo", "aqi Los Angeles"], mode: "argument" },
    { aliases: ["holiday", "holidays"], syntax: "holiday [country-code]", examples: ["holiday US", "holiday GB"], mode: "argument" },
    { aliases: ["battery", "power"], syntax: "battery", examples: ["battery", "power"], mode: "none" },
    { aliases: ["speed", "network", "connection"], syntax: "speed", examples: ["speed", "network"], mode: "none" },
    { aliases: ["spaceweather", "solarwind"], syntax: "spaceweather", examples: ["spaceweather", "solarwind"], mode: "none" },
    { aliases: ["onthisday", "history"], syntax: "onthisday", examples: ["onthisday", "history"], mode: "none" },
    { aliases: ["earthquake", "earthquakes", "quakes", "seismic"], syntax: "earthquakes", examples: ["earthquakes", "seismic"], mode: "none" },
    { aliases: ["bsky", "bluesky"], syntax: "bsky [handle]", examples: ["bsky jay.bsky.team"], mode: "argument" },
    { aliases: ["wayback", "archive", "snapshot"], syntax: "archive [domain or URL]", examples: ["archive wikipedia.org"], mode: "argument" },
    { aliases: ["npm", "package"], syntax: "npm [package-name]", examples: ["npm express"], mode: "argument" },
    { aliases: ["space", "whoisinspace", "astronauts"], syntax: "space", examples: ["space", "whoisinspace"], mode: "none" },
    { aliases: ["flight", "aircraft"], syntax: "flight [callsign]", examples: ["flight UAL420"], mode: "argument" },
    { aliases: ["neo", "asteroid", "asteroids"], syntax: "neo", examples: ["neo", "asteroids"], mode: "none" },
    { aliases: ["dns", "dig", "nslookup"], syntax: "dns [domain]", examples: ["dns google.com", "dig github.com"], mode: "argument" },
    { aliases: ["barcode", "food", "product"], syntax: "barcode [numeric UPC/EAN]", examples: ["barcode 737628064502"], mode: "optional" },
    { aliases: ["chat", "contact"], syntax: "chat", examples: ["chat"], mode: "none" },
    { aliases: ["terminal", "shell", "sandbox"], syntax: "terminal", examples: ["terminal", "shell"], mode: "none" },
    { aliases: ["qr", "qrcode"], syntax: "qr [text or URL]", examples: ["qr https://example.com"], mode: "argument" },
    { aliases: ["iss", "orbit", "space station", "where is the iss"], syntax: "iss", examples: ["iss", "orbit"], mode: "none" },
    { aliases: ["duck", "ducks", "random duck"], syntax: "duck", examples: ["duck", "random duck"], mode: "none" },
    { aliases: ["zip", "postal"], syntax: "zip [postal code or city]", examples: ["zip 90210", "postal London"], mode: "argument" },
    { aliases: ["college", "university"], syntax: "college [school name]", examples: ["college Stanford", "university MIT"], mode: "argument" },
    { aliases: ["nasa", "apod", "astronomy"], syntax: "nasa", examples: ["nasa", "apod"], mode: "none" },
    { aliases: ["advice", "quote", "give me advice"], syntax: "advice", examples: ["advice", "quote"], mode: "none" },
    { aliases: ["age", "predict age"], syntax: "age [first name]", examples: ["age Logan", "predict age Alex"], mode: "argument" },
    { aliases: ["dog", "dogs", "random dog"], syntax: "dog", examples: ["dog", "random dog"], mode: "none" },
    { aliases: ["cat", "cats", "random cat"], syntax: "cat", examples: ["cat", "random cat"], mode: "none" },
    { aliases: ["ip", "my ip", "ip lookup", "what is my ip"], syntax: "my ip", examples: ["my ip", "ip lookup"], mode: "none" },
    { aliases: ["trivia", "quiz"], syntax: "trivia", examples: ["trivia", "quiz"], mode: "none" },
    { aliases: ["free games", "free game", "deals", "giveaways"], syntax: "free games", examples: ["free games", "deals"], mode: "none" },
    { aliases: ["joke", "tell me a joke", "make me laugh", "dadjoke"], syntax: "joke", examples: ["joke", "tell me a joke"], mode: "none" },
    { aliases: ["pokemon", "pokedex"], syntax: "pokemon [name or number]", examples: ["pokemon Charizard"], mode: "argument" },
    { aliases: ["news", "top news"], syntax: "news [optional: about topic]", examples: ["news", "news about technology"], mode: "optional" },
    { aliases: ["note", "remember", "add note"], syntax: "note: [text]", examples: ["note: Check server deployments", "remember to call mom"], mode: "argument" },
    { aliases: ["show notes", "my notes", "notes"], syntax: "show notes", examples: ["show notes", "my notes"], mode: "none" },
    { aliases: ["draw", "art"], syntax: "draw [image description]", examples: ["draw a cyberpunk city"], mode: "argument" },
    { aliases: ["call", "dial"], syntax: "call [phone number]", examples: ["call 555-0199"], mode: "argument" },
    { aliases: ["text", "sms", "msg"], syntax: "text [phone number] [optional message]", examples: ["text 555-0199 on my way"], mode: "argument" },
    { aliases: ["reserve", "reservation", "order", "find"], syntax: "[reserve|order|find] [food or restaurant] [city]", examples: ["reserve sushi New York", "order pizza Orlando"], mode: "argument" },
    { aliases: ["weather", "forecast"], syntax: "weather [optional city]", examples: ["weather", "weather Orlando"], mode: "optional" },
    { aliases: ["school", "vaii school", "classroom"], syntax: "school", examples: ["school", "vaii school"], mode: "none" },
    { aliases: ["map", "map of", "show map"], syntax: "map of [place]", examples: ["map of Tokyo", "show map of Paris"], mode: "argument" },
    { aliases: ["time in", "clock"], syntax: "time in [city]", examples: ["time in London", "clock New York"], mode: "argument" },
    { aliases: ["sunrise", "sunset"], syntax: "[sunrise|sunset] [optional city]", examples: ["sunrise", "sunset in Tokyo"], mode: "optional" }
];

const aliasEntries = COMMANDS.flatMap(command =>
    command.aliases.map(alias => ({ alias, command }))
).sort((left, right) => right.alias.length - left.alias.length);

const COMMAND_REWRITES = new Map([
    ["calculator", ""], ["calc", ""],
    ["currency", "convert"], ["exchange", "convert"], ["fx", "convert"],
    ["repository", "repo"], ["dictionary", "define"], ["meaning", "define"],
    ["flag", "country"], ["cocktail", "drink"], ["recipe", "drink"],
    ["browse", "open"], ["visit", "open"], ["shorturl", "shorten"], ["unshorten", "expand"],
    ["colour", "color"], ["minecraft", "mc"], ["server", "mc"],
    ["profile picture", "avatar"], ["shop", "ebay"], ["random activity", "bored"],
    ["githubuser", "ghuser"], ["github user", "ghuser"], ["weather report", "asciiweather"],
    ["bookisbn", "isbn"], ["my location", "whereami"], ["chucknorris", "chuck"],
    ["coin", "crypto"], ["token", "crypto"], ["servicestatus", "status"],
    ["air quality", "airquality"], ["holidays", "holiday"], ["connection", "speed"],
    ["rocket launches", "launches"], ["space station", "iss"], ["dadjoke", "joke"],
    ["activity", "bored"], ["product", "barcode"], ["art", "draw"], ["forecast", "weather"], ["notes", "show notes"],
    ["classroom", "school"], ["map", "map of"], ["clock", "time in"],
    ["animation", "anime"], ["comic", "manga"], ["predict age", "age"],
    ["remember", "note:"], ["add note", "note:"], ["random cocktail", "random drink"]
]);

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
    const argument = withoutSlash.slice(match.alias.length).trim();
    const replacement = COMMAND_REWRITES.get(match.alias);
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
        : aliasEntries.filter(({ alias }) => alias.startsWith(prefix)).map(({ alias }) => alias);
    return [...new Set(matchingAliases
        .map(alias => {
            const command = aliasEntries.find(entry => entry.alias === alias)?.command;
            return command?.mode === "argument" ? `${alias} ` : alias;
        }))]
        .slice(0, 12);
}

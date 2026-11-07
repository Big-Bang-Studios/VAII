const MCP_PROTOCOL_VERSION = "2025-03-26";
const MAX_REQUEST_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;

const SCHOOL_GUIDANCE = [
    "VAII School learning-integrity policy: Never agree to provide answers to an assessment, graded assignment, quiz, or answer key. Do not solve or complete the learner's assessed work for them.",
    "Instead, say you can help them learn, explain the relevant concept, offer one hint at a time, ask a guiding question, or demonstrate the method on a different example. Encourage the learner to attempt the next step.",
    "This MCP server does not expose student accounts, school records, assessment questions, submissions, or answer keys. Contact Chat is not available through this MCP server."
].join(" ");

const TOOLS = [
    {
        name: "vaii_get_weather",
        description: "Get current weather for a named location using VAII's Open-Meteo integration.",
        inputSchema: {
            type: "object",
            properties: { location: { type: "string", description: "City or place name." } },
            required: ["location"],
            additionalProperties: false
        }
    },
    {
        name: "vaii_convert_currency",
        description: "Convert an amount between currencies using VAII's Frankfurter exchange-rate integration.",
        inputSchema: {
            type: "object",
            properties: {
                amount: { type: "number", description: "Positive amount to convert." },
                from: { type: "string", description: "Three-letter source currency code." },
                to: { type: "string", description: "Three-letter destination currency code." }
            },
            required: ["amount", "from", "to"],
            additionalProperties: false
        }
    },
    {
        name: "vaii_define_word",
        description: "Look up definitions and examples using VAII's dictionary integration.",
        inputSchema: {
            type: "object",
            properties: { word: { type: "string", description: "An English word to define." } },
            required: ["word"],
            additionalProperties: false
        }
    },
    {
        name: "vaii_lookup_country",
        description: "Look up public country, capital, region, currency, and population information using VAII's country integration.",
        inputSchema: {
            type: "object",
            properties: { country: { type: "string", description: "Country name or ISO country code." } },
            required: ["country"],
            additionalProperties: false
        }
    },
    {
        name: "vaii_school_learning_guidance",
        description: "Get VAII School's learning-integrity rules. Never agree to give learners answers to assessments or graded work; provide hints and teaching instead. This tool does not expose student records or answer keys.",
        inputSchema: {
            type: "object",
            properties: {
                request_type: {
                    type: "string",
                    enum: ["asks_for_answers", "asks_for_learning_help", "teacher_support"],
                    description: "The kind of School-related help being requested."
                },
                subject: {
                    type: "string",
                    enum: ["math", "ela", "science", "other"],
                    description: "Optional subject area."
                }
            },
            required: ["request_type"],
            additionalProperties: false
        }
    }
];

function jsonRpcError(id, code, message) {
    return { jsonrpc: "2.0", id, error: { code, message } };
}

function textResult(text, isError = false) {
    return {
        content: [{ type: "text", text }],
        ...(isError ? { isError: true } : {})
    };
}

function validateText(value, label, maximumLength = 100) {
    if (typeof value !== "string" || !value.trim() || value.trim().length > maximumLength) {
        throw new Error(`${label} must be a non-empty string of at most ${maximumLength} characters.`);
    }
    return value.trim();
}

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
            "User-Agent": "VAII-MCP/1.0 (https://vaii-two.vercel.app)"
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (!response.ok) {
        throw new Error(`${new URL(url).hostname} returned HTTP ${response.status}.`);
    }
    return response.json();
}

async function getWeather(args) {
    const location = validateText(args.location, "location");
    const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodingUrl.searchParams.set("name", location);
    geocodingUrl.searchParams.set("count", "1");
    geocodingUrl.searchParams.set("language", "en");
    geocodingUrl.searchParams.set("format", "json");
    const geocoding = await fetchJson(geocodingUrl);
    const place = geocoding.results?.[0];
    if (!place) throw new Error(`No location found for "${location}".`);

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(place.latitude));
    forecastUrl.searchParams.set("longitude", String(place.longitude));
    forecastUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m");
    forecastUrl.searchParams.set("timezone", "auto");
    const forecast = await fetchJson(forecastUrl);
    return {
        location: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
        current: forecast.current,
        units: forecast.current_units,
        source: "Open-Meteo"
    };
}

async function convertCurrency(args) {
    if (typeof args.amount !== "number" || !Number.isFinite(args.amount) || args.amount <= 0 || args.amount > 1_000_000_000) {
        throw new Error("amount must be a positive number no greater than 1,000,000,000.");
    }
    const from = validateText(args.from, "from", 3).toUpperCase();
    const to = validateText(args.to, "to", 3).toUpperCase();
    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
        throw new Error("from and to must be three-letter currency codes.");
    }
    const url = new URL("https://api.frankfurter.app/latest");
    url.searchParams.set("amount", String(args.amount));
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    return { ...(await fetchJson(url)), source: "Frankfurter" };
}

async function defineWord(args) {
    const word = validateText(args.word, "word", 80);
    if (!/^[\p{L}' -]+$/u.test(word)) throw new Error("word may only contain letters, spaces, apostrophes, and hyphens.");
    try {
        const data = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!Array.isArray(data)) throw new Error("dictionaryapi.dev returned an unexpected response.");
        return data.slice(0, 3).map(entry => ({
            word: entry.word,
            phonetic: entry.phonetic || "",
            meanings: (entry.meanings || []).slice(0, 5).map(meaning => ({
                partOfSpeech: meaning.partOfSpeech,
                definitions: (meaning.definitions || []).slice(0, 3).map(definition => ({
                    definition: definition.definition,
                    ...(definition.example ? { example: definition.example } : {})
                }))
            }))
        }));
    } catch (primaryError) {
        const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase())}`;
        try {
            const data = await fetchJson(url);
            const meanings = Object.entries(data)
                .slice(0, 5)
                .map(([partOfSpeech, entries]) => ({
                    partOfSpeech,
                    definitions: (Array.isArray(entries) ? entries : [])
                        .flatMap(entry => entry.definitions || [])
                        .slice(0, 3)
                        .map(definition => ({
                            definition: definition.definition,
                            ...(definition.example ? { example: definition.example } : {})
                        }))
                }))
                .filter(meaning => meaning.definitions.length);
            if (!meanings.length) throw new Error("Wiktionary returned no definitions.");
            return [{ word, phonetic: "", meanings, source: "Wiktionary" }];
        } catch (fallbackError) {
            throw new Error(`Dictionary lookup failed: ${primaryError.message} Wiktionary fallback failed: ${fallbackError.message}`);
        }
    }
}

async function lookupCountry(args) {
    const country = validateText(args.country, "country");
    const url = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
    const countries = await fetchJson(url);
    if (!Array.isArray(countries)) {
        throw new Error("Country dataset returned an unexpected response (expected a JSON array).");
    }
    const query = country.toLocaleLowerCase();
    const validCountries = countries.filter(item => item && typeof item === "object" && item.name && typeof item.name === "object");
    const exactMatches = validCountries.filter(item => {
        const aliases = Array.isArray(item.altSpellings) ? item.altSpellings : [];
        const names = [item.name.common, item.name.official, item.cca2, item.cca3, ...aliases];
        return names.some(name => typeof name === "string" && name.toLocaleLowerCase() === query);
    });
    const matches = exactMatches.length ? exactMatches : validCountries.filter(item =>
        typeof item.name.common === "string" && item.name.common.toLocaleLowerCase().includes(query)
    );
    return matches
        .slice(0, 5)
        .map(item => ({
            name: item.name.common,
            officialName: item.name.official,
            countryCode: item.cca2,
            capital: Array.isArray(item.capital) ? item.capital : [],
            region: item.region,
            subregion: item.subregion,
            population: item.population,
            currencies: item.currencies,
            languages: item.languages,
            source: "Mledoze Countries dataset"
        }));
}

async function callTool(name, args) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
        throw new Error("Tool arguments must be a JSON object.");
    }
    switch (name) {
        case "vaii_get_weather":
            return getWeather(args);
        case "vaii_convert_currency":
            return convertCurrency(args);
        case "vaii_define_word":
            return defineWord(args);
        case "vaii_lookup_country":
            return lookupCountry(args);
        case "vaii_school_learning_guidance": {
            const requestType = validateText(args.request_type, "request_type", 40);
            if (!["asks_for_answers", "asks_for_learning_help", "teacher_support"].includes(requestType)) {
                throw new Error("request_type must be asks_for_answers, asks_for_learning_help, or teacher_support.");
            }
            if (args.subject !== undefined && !["math", "ela", "science", "other"].includes(args.subject)) {
                throw new Error("subject must be math, ela, science, or other.");
            }
            return { requestType, subject: args.subject || null, guidance: SCHOOL_GUIDANCE };
        }
        default:
            throw new Error(`Unknown VAII tool: ${name}`);
    }
}

function parseRequestBody(body) {
    if (typeof body === "string") {
        if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) throw new Error("Request body is too large.");
        return JSON.parse(body);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Request body must be a JSON object.");
    if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_REQUEST_BYTES) throw new Error("Request body is too large.");
    return body;
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, MCP-Protocol-Version");
    res.setHeader("Access-Control-Expose-Headers", "MCP-Protocol-Version");
    res.setHeader("MCP-Protocol-Version", MCP_PROTOCOL_VERSION);
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST, OPTIONS");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const accept = req.headers?.accept || "";
    if (!accept.includes("application/json") && !accept.includes("text/event-stream")) {
        return res.status(406).json({ error: "Accept must include application/json or text/event-stream." });
    }

    let message;
    try {
        message = parseRequestBody(req.body);
    } catch (error) {
        return res.status(400).json(jsonRpcError(null, -32700, error.message || "Invalid JSON request."));
    }
    if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
        return res.status(400).json(jsonRpcError(message.id ?? null, -32600, "Invalid JSON-RPC request."));
    }
    if (!Object.hasOwn(message, "id")) return res.status(202).end();

    let result;
    switch (message.method) {
        case "initialize": {
            const requestedVersion = message.params?.protocolVersion;
            result = {
                protocolVersion: requestedVersion === "2024-11-05" ? requestedVersion : MCP_PROTOCOL_VERSION,
                capabilities: { tools: {} },
                serverInfo: { name: "vaii-integrations", version: "1.0.0" },
                instructions: `${SCHOOL_GUIDANCE} VAII's read-only MCP tools include weather, currency conversion, dictionary lookup, country lookup, and School learning guidance. VAII contact chat is not integrated; open VAII to use Contact Chat.`
            };
            break;
        }
        case "ping":
            result = {};
            break;
        case "tools/list":
            result = { tools: TOOLS };
            break;
        case "tools/call": {
            const name = message.params?.name;
            if (typeof name !== "string") {
                return res.status(200).json(jsonRpcError(message.id, -32602, "Tool name is required."));
            }
            try {
                const data = await callTool(name, message.params?.arguments || {});
                result = textResult(JSON.stringify(data));
            } catch (error) {
                result = textResult(error.message || "VAII integration failed.", true);
            }
            break;
        }
        default:
            return res.status(200).json(jsonRpcError(message.id, -32601, `Method not found: ${message.method}`));
    }

    return res.status(200).json({ jsonrpc: "2.0", id: message.id, result });
}

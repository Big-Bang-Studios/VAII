import assert from "node:assert/strict";
import test from "node:test";
import mcpHandler from "../api/mcp.js";

function createResponse() {
    return {
        statusCode: null,
        body: null,
        headers: {},
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
        end() {}
    };
}

function createRequest(message, headers = { accept: "application/json, text/event-stream" }) {
    return { method: "POST", headers, body: message };
}

test("MCP initialize announces tools and the VAII School answer-sharing policy", async () => {
    const response = createResponse();
    await mcpHandler(createRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-03-26" }
    }), response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.result.protocolVersion, "2025-03-26");
    assert.match(response.body.result.instructions, /Never agree to provide answers/);
    assert.match(response.body.result.instructions, /contact chat is not (?:integrated|available)/i);
});

test("tools/list exposes VAII public integrations and School guidance but no chat tool", async () => {
    const response = createResponse();
    await mcpHandler(createRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" }), response);

    const toolNames = response.body.result.tools.map(tool => tool.name);
    assert.deepEqual(toolNames, [
        "vaii_get_weather",
        "vaii_convert_currency",
        "vaii_define_word",
        "vaii_lookup_country",
        "vaii_school_learning_guidance"
    ]);
    assert.equal(toolNames.some(name => name.includes("chat")), false);
});

test("School guidance refuses assessment answers and guides the AI to teach instead", async () => {
    const response = createResponse();
    await mcpHandler(createRequest({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
            name: "vaii_school_learning_guidance",
            arguments: { request_type: "asks_for_answers", subject: "math" }
        }
    }), response);

    const result = JSON.parse(response.body.result.content[0].text);
    assert.match(result.guidance, /Never agree to provide answers/);
    assert.match(result.guidance, /offer one hint at a time/);
    assert.match(result.guidance, /does not expose student accounts/);
    assert.equal(result.subject, "math");
});

test("word lookup falls back to Wiktionary when dictionaryapi.dev rejects the server request", async () => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    globalThis.fetch = async (url, options) => {
        requestedUrls.push(new URL(url));
        assert.match(options.headers["User-Agent"], /^VAII-MCP\//);
        if (requestedUrls.length === 1) {
            return { ok: false, status: 403 };
        }
        return {
            ok: true,
            json: async () => ({
                noun: [{
                    definitions: [{ definition: "A test definition." }]
                }]
            })
        };
    };

    try {
        const response = createResponse();
        await mcpHandler(createRequest({
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: { name: "vaii_define_word", arguments: { word: "example" } }
        }), response);

        assert.equal(response.body.result.isError, undefined);
        assert.equal(requestedUrls[0].hostname, "api.dictionaryapi.dev");
        assert.equal(requestedUrls[1].hostname, "en.wiktionary.org");
        const result = JSON.parse(response.body.result.content[0].text);
        assert.equal(result[0].source, "Wiktionary");
        assert.equal(result[0].meanings[0].definitions[0].definition, "A test definition.");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("MCP accepts requests from remote AI servers without browser origins or session cookies", async () => {
    const response = createResponse();
    await mcpHandler(createRequest(
        { jsonrpc: "2.0", id: 6, method: "tools/list" },
        { accept: "application/json, text/event-stream", origin: "https://ai-backend.example" }
    ), response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.result.tools.length, 5);
    assert.equal(response.headers["Access-Control-Allow-Origin"], "*");
});

test("country lookup handles an API error object without crashing", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({ status: 404, message: "Not Found" })
    });

    try {
        const response = createResponse();
        await mcpHandler(createRequest({
            jsonrpc: "2.0",
            id: 7,
            method: "tools/call",
            params: { name: "vaii_lookup_country", arguments: { country: "unknown" } }
        }), response);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.result.isError, true);
        assert.match(response.body.result.content[0].text, /Country service returned an unexpected response/);
        assert.match(response.body.result.content[0].text, /Not Found/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("country lookup returns normalized records from an array response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: true,
        json: async () => [{
            name: { common: "Testland", official: "Republic of Testland" },
            cca2: "TT",
            capital: ["Test City"],
            region: "Test Region",
            population: 12345,
            currencies: { TST: { name: "Test dollar", symbol: "$" } },
            languages: { eng: "English" }
        }]
    });

    try {
        const response = createResponse();
        await mcpHandler(createRequest({
            jsonrpc: "2.0",
            id: 8,
            method: "tools/call",
            params: { name: "vaii_lookup_country", arguments: { country: "Testland" } }
        }), response);

        assert.equal(response.body.result.isError, undefined);
        assert.deepEqual(JSON.parse(response.body.result.content[0].text), [{
            name: "Testland",
            officialName: "Republic of Testland",
            countryCode: "TT",
            capital: ["Test City"],
            region: "Test Region",
            population: 12345,
            currencies: { TST: { name: "Test dollar", symbol: "$" } },
            languages: { eng: "English" }
        }]);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("currency integration validates arguments and returns a converted rate", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl;
    globalThis.fetch = async url => {
        requestedUrl = new URL(url);
        return { ok: true, json: async () => ({ amount: 10, base: "USD", rates: { EUR: 9.2 } }) };
    };

    try {
        const response = createResponse();
        await mcpHandler(createRequest({
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: { name: "vaii_convert_currency", arguments: { amount: 10, from: "usd", to: "eur" } }
        }), response);

        assert.equal(response.statusCode, 200);
        assert.equal(requestedUrl.origin, "https://api.frankfurter.app");
        assert.equal(requestedUrl.searchParams.get("amount"), "10");
        assert.equal(requestedUrl.searchParams.get("from"), "USD");
        assert.equal(requestedUrl.searchParams.get("to"), "EUR");
        assert.deepEqual(JSON.parse(response.body.result.content[0].text), {
            amount: 10,
            base: "USD",
            rates: { EUR: 9.2 },
            source: "Frankfurter"
        });

        const invalidResponse = createResponse();
        await mcpHandler(createRequest({
            jsonrpc: "2.0",
            id: 5,
            method: "tools/call",
            params: { name: "vaii_convert_currency", arguments: { amount: -1, from: "USD", to: "EUR" } }
        }), invalidResponse);
        assert.equal(invalidResponse.body.result.isError, true);
        assert.match(invalidResponse.body.result.content[0].text, /positive number/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("MCP rejects unsupported HTTP methods and malformed JSON-RPC requests", async () => {
    const getResponse = createResponse();
    await mcpHandler({ method: "GET", headers: { accept: "application/json" } }, getResponse);
    assert.equal(getResponse.statusCode, 405);
    assert.equal(getResponse.headers.Allow, "POST, OPTIONS");

    const malformedResponse = createResponse();
    await mcpHandler(createRequest("{not-json"), malformedResponse);
    assert.equal(malformedResponse.statusCode, 400);
    assert.equal(malformedResponse.body.error.code, -32700);
});

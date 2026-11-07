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

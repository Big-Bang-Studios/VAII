import assert from "node:assert/strict";
import test from "node:test";
import proxyHandler from "../api/proxy.js";

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

test("URL expansion returns the final URL from Microlink", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl;
    globalThis.fetch = async (url) => {
        requestedUrl = new URL(url);
        return {
            ok: true,
            json: async () => ({
                status: "success",
                data: { url: "https://example.com/" }
            })
        };
    };

    try {
        const response = createResponse();
        await proxyHandler({
            method: "GET",
            headers: { origin: "https://vaii-two.vercel.app" },
            query: { action: "expand", target: "https://is.gd/AG3Hwv" }
        }, response);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            shortUrl: "https://is.gd/AG3Hwv",
            expandedUrl: "https://example.com/"
        });
        assert.equal(requestedUrl.origin, "https://api.microlink.io");
        assert.equal(requestedUrl.searchParams.get("url"), "https://is.gd/AG3Hwv");
        assert.equal(requestedUrl.searchParams.get("meta"), "false");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

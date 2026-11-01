import assert from "node:assert/strict";
import test from "node:test";
import {
    getNativeCommandDefinitions,
    getNativeCommandSuggestions,
    getNativeCommandSyntaxIssue,
    normalizeNativeCommand
} from "../nativeCommands.js";

test("native command aliases normalize to supported command syntax", () => {
    assert.equal(normalizeNativeCommand("fx 50 GBP to JPY"), "convert 50 GBP to JPY");
    assert.equal(normalizeNativeCommand("calculator 25 * 4"), "25 * 4");
    assert.equal(normalizeNativeCommand("flag Japan"), "country Japan");
    assert.equal(normalizeNativeCommand("forecast Tokyo"), "weather Tokyo");
    assert.equal(normalizeNativeCommand("weather report Tokyo"), "weather Tokyo");
    assert.equal(normalizeNativeCommand("random activity"), "bored");
    assert.equal(normalizeNativeCommand("classroom"), "school");
    assert.equal(normalizeNativeCommand("map Tokyo"), "map of Tokyo");
    assert.equal(normalizeNativeCommand("show map of Paris"), "show map Paris");
    assert.equal(normalizeNativeCommand("notes"), "show notes");
    assert.equal(normalizeNativeCommand("animation Naruto"), "anime Naruto");
    assert.equal(normalizeNativeCommand("comic Berserk"), "manga Berserk");
    assert.equal(normalizeNativeCommand("predict age Alex"), "age Alex");
    assert.equal(normalizeNativeCommand("remember to call mom"), "note: to call mom");
    assert.equal(normalizeNativeCommand("random cocktail"), "random drink");
    assert.equal(normalizeNativeCommand("shorturl https://example.com"), "shorten https://example.com");
    assert.equal(normalizeNativeCommand("unshorten https://is.gd/example"), "expand https://is.gd/example");
    assert.equal(normalizeNativeCommand("countdown 5m"), "timer 5m");
    assert.equal(normalizeNativeCommand("contact"), "chat");
    assert.equal(normalizeNativeCommand("aircraft UAL420"), "flight UAL420");
    assert.equal(normalizeNativeCommand("server hypixel.net"), "mc hypixel.net");
    assert.equal(normalizeNativeCommand("shop headphones"), "ebay headphones");
    assert.equal(normalizeNativeCommand("play Blinding Lights"), "play Blinding Lights");
    assert.equal(normalizeNativeCommand("where is the iss"), "where is the iss");
});

test("natural-language aliases execute the matching dictionary, weather, time, and joke commands", () => {
    assert.equal(normalizeNativeCommand("meaning of ephemeral"), "define ephemeral");
    assert.equal(normalizeNativeCommand("definition of serendipity"), "define serendipity");
    assert.equal(normalizeNativeCommand("what is the meaning of concise"), "define concise");
    assert.equal(normalizeNativeCommand("what does concise mean?"), "define concise");
    assert.equal(normalizeNativeCommand("define the word lucid"), "define lucid");
    assert.equal(normalizeNativeCommand("weather in London"), "weather London");
    assert.equal(normalizeNativeCommand("forecast for Toronto"), "weather Toronto");
    assert.equal(normalizeNativeCommand("what's the weather in Paris"), "weather Paris");
    assert.equal(normalizeNativeCommand("what time is it in Tokyo"), "time in Tokyo");
    assert.equal(normalizeNativeCommand("random joke"), "joke");
    assert.equal(getNativeCommandSyntaxIssue("meaning of"), getNativeCommandSyntaxIssue("define"));
});

test("slash-prefixed forms work for registered commands", () => {
    assert.equal(normalizeNativeCommand("/dns example.com"), "dns example.com");
    assert.equal(normalizeNativeCommand("/weather London"), "weather London");
    assert.equal(normalizeNativeCommand("/spacex"), "launches");
    assert.equal(normalizeNativeCommand("/unshorten https://is.gd/example"), "expand https://is.gd/example");
});

test("syntax help identifies missing arguments and unexpected arguments", () => {
    assert.equal(getNativeCommandSyntaxIssue("dns"), getNativeCommandSyntaxIssue("dig"));
    assert.deepEqual(getNativeCommandSyntaxIssue("dns"), {
        aliases: ["dns", "dig", "nslookup"],
        syntax: "dns [domain]",
        examples: ["dns google.com", "dig github.com"],
        mode: "argument"
    });
    assert.equal(getNativeCommandSyntaxIssue("battery extra")?.syntax, "battery");
    assert.equal(getNativeCommandSyntaxIssue("dns example.com"), null);
    assert.equal(getNativeCommandSyntaxIssue("battery"), null);
    assert.equal(getNativeCommandSyntaxIssue("school extra")?.syntax, "school");
});

test("autocomplete suggests registered aliases", () => {
    const suggestions = getNativeCommandSuggestions("/mc");
    assert.ok(suggestions.includes("mc "));
    assert.ok(suggestions.includes("minecraft "));
    assert.ok(getNativeCommandSuggestions("w").includes("weather"));
});

test("every registered command alias normalizes without falling into the syntax error path", () => {
    for (const command of getNativeCommandDefinitions()) {
        for (const alias of command.aliases) {
            const query = command.mode === "argument" ? `${alias} example` : alias;
            assert.equal(getNativeCommandSyntaxIssue(query), null, `${alias} should not show syntax help`);
            assert.ok(normalizeNativeCommand(query).trim(), `${alias} should produce an executable query`);
        }
    }
});

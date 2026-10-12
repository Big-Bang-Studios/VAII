import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const chatSource = await readFile(fileURLToPath(new URL("../chat.js", import.meta.url)), "utf8");
const chatModule = await import(`data:text/javascript;base64,${Buffer.from(chatSource).toString("base64")}`);
const {
    buildChatRoomId,
    configureContactChat,
    createChatMessage,
    decryptChatMessage,
    deriveChatRoomKey,
    encryptChatMessage,
    ensureChatRoom,
    getOtherRoomParticipant,
    getAuthenticatedUser,
    getContactDisplayName,
    hasExpectedRoomParticipants,
    mergeDiscoveredRoomContacts,
    mergeMessageDisplayName
} = chatModule;
globalThis.window = { crypto: webcrypto };
const inviteId = Buffer.alloc(16, 1).toString("base64url");
const alternateInviteId = Buffer.alloc(16, 4).toString("base64url");
const inviteSecret = Buffer.alloc(32, 2).toString("base64url");

function configureMockAuth(currentUser = null, anonymousUser = { uid: "anonymous-uid" }) {
    const app = {};
    const auth = { app, currentUser };
    let anonymousSignInCalls = 0;

    configureContactChat({
        app,
        auth,
        onAuthStateChanged(_auth, callback) {
            queueMicrotask(() => callback(auth.currentUser));
            return () => {};
        },
        async signInAnonymously(targetAuth) {
            anonymousSignInCalls++;
            targetAuth.currentUser = anonymousUser;
            return { user: anonymousUser };
        }
    });

    return {
        auth,
        getAnonymousSignInCalls: () => anonymousSignInCalls
    };
}

test("room IDs are deterministic and reject identical or missing UIDs", () => {
    assert.equal(buildChatRoomId("uid-b", "uid-a"), "uid-a_uid-b");
    assert.throws(() => buildChatRoomId("uid-a", "uid-a"), /two different/);
    assert.throws(() => buildChatRoomId("", "uid-b"), /two different/);
});

test("room participant validation requires exactly the two distinct UIDs", () => {
    assert.equal(hasExpectedRoomParticipants(["uid-a", "uid-b"], "uid-a", "uid-b"), true);
    assert.equal(hasExpectedRoomParticipants(["uid-a", "uid-a"], "uid-a", "uid-b"), false);
    assert.equal(hasExpectedRoomParticipants(["uid-a", "uid-b", "uid-c"], "uid-a", "uid-b"), false);
    assert.equal(hasExpectedRoomParticipants(["uid-a"], "uid-a", "uid-b"), false);
});

test("a single invite link lets the recipient create the shared room and the inviter discover them", () => {
    const loganUid = "logan-auth-uid";
    const guestUid = "guest-auth-uid";
    const inviteLinkTarget = loganUid;
    const recipientRoomId = buildChatRoomId(guestUid, inviteLinkTarget);
    const inviterRoomId = buildChatRoomId(loganUid, guestUid);
    const inviterView = mergeDiscoveredRoomContacts(
        [{
            participants: [guestUid, loganUid],
            participantNames: {
                [loganUid]: "Logan",
                [guestUid]: "Guest_7637"
            }
        }],
        loganUid,
        []
    );

    assert.equal(recipientRoomId, inviterRoomId);
    assert.equal(getOtherRoomParticipant([guestUid, loganUid], loganUid), guestUid);
    assert.deepEqual(inviterView.discovered, [{ id: guestUid, name: "Guest_7637" }]);
    assert.equal(getContactDisplayName(inviterView.discovered[0]), "Guest_7637");
});

test("contact title uses a saved display name and falls back to UID until known", () => {
    assert.equal(getContactDisplayName({ id: "uid-logan", name: "Logan" }), "Logan");
    assert.equal(getContactDisplayName({ id: "uid-logan", name: "uid-logan" }), "uid-logan");
    assert.equal(getContactDisplayName({ id: "uid-logan", name: "" }), "uid-logan");

    const contacts = [{ id: "uid-logan", name: "uid-logan" }];
    assert.deepEqual(
        mergeMessageDisplayName(contacts, "uid-logan", "uid-logan", "Logan"),
        [{ id: "uid-logan", name: "Logan" }]
    );
    assert.deepEqual(
        mergeMessageDisplayName(contacts, "uid-logan", "someone-else", "Impersonated"),
        contacts
    );
});

test("room discovery ignores rooms that are not valid two-party memberships", () => {
    assert.equal(getOtherRoomParticipant(["uid-a", "uid-b"], "uid-c"), null);
    assert.equal(getOtherRoomParticipant(["uid-a", "uid-a"], "uid-a"), null);
    assert.equal(getOtherRoomParticipant(["uid-a", "uid-b", "uid-c"], "uid-a"), null);

    const result = mergeDiscoveredRoomContacts([
        { participants: ["uid-a", "uid-b"] },
        { participants: ["uid-a", "uid-b"] },
        { participants: ["uid-a", "uid-c", "uid-d"] }
    ], "uid-a", [{ id: "uid-b", name: "Saved contact name" }]);
    assert.deepEqual(result.contacts, [{ id: "uid-b", name: "Saved contact name" }]);
    assert.deepEqual(result.discovered, []);
});

test("room discovery upgrades a UID fallback to the room's saved display name", () => {
    const result = mergeDiscoveredRoomContacts([{
        participants: ["uid-a", "uid-b"],
        participantNames: { "uid-b": "Logan" }
    }], "uid-a", [{ id: "uid-b", name: "uid-b" }]);

    assert.deepEqual(result.contacts, [{ id: "uid-b", name: "Logan" }]);
    assert.deepEqual(result.discovered, [{ id: "uid-b", name: "Logan" }]);
});

test("chat reuses an already authenticated Firebase user", async () => {
    const user = { uid: "existing-auth-uid" };
    const auth = configureMockAuth(user);

    assert.equal(await getAuthenticatedUser(), user);
    assert.equal(auth.getAnonymousSignInCalls(), 0);
});

test("chat signs in anonymously when Firebase has no current user", async () => {
    const anonymousUser = { uid: "new-anonymous-uid" };
    const auth = configureMockAuth(null, anonymousUser);

    assert.equal(await getAuthenticatedUser(), anonymousUser);
    assert.equal(auth.auth.currentUser, anonymousUser);
    assert.equal(auth.getAnonymousSignInCalls(), 1);
});

test("anonymous authentication failures are surfaced", async () => {
    const app = {};
    const auth = { app, currentUser: null };
    configureContactChat({
        app,
        auth,
        onAuthStateChanged(_auth, callback) {
            queueMicrotask(() => callback(null));
            return () => {};
        },
        async signInAnonymously() {
            throw new Error("anonymous provider disabled");
        }
    });

    await assert.rejects(getAuthenticatedUser(), /anonymous provider disabled/);
});

test("room creation uses sorted UIDs and server timestamp", async () => {
    const calls = [];
    const firebase = {
        db: {},
        doc(_db, ...segments) {
            return segments;
        },
        async getDoc() {
            throw new Error("missing room read denied");
        },
        async setDoc(reference, data) {
            calls.push({ reference, data });
        },
        serverTimestamp() {
            return "server-timestamp";
        }
    };

    const result = await ensureChatRoom(firebase, "uid-z", "uid-a", {}, inviteId);
    assert.deepEqual(result, {
        roomId: "uid-a_uid-z",
        participants: ["uid-a", "uid-z"]
    });
    assert.deepEqual(calls, [{
        reference: ["vaii_rooms", "uid-a_uid-z"],
        data: {
            participants: ["uid-a", "uid-z"],
            participantNames: {
                "uid-z": "",
                "uid-a": ""
            },
            keyId: inviteId,
            createdAt: "server-timestamp"
        }
    }]);
});

test("an existing deterministic room is accepted only for the exact participants", async () => {
    let roomData = { participants: ["uid-a", "uid-b"], keyId: inviteId };
    const firebase = {
        db: {},
        doc(_db, ...segments) {
            return segments;
        },
        async setDoc() {
            assert.fail("an existing room must not be rewritten");
        },
        async getDoc() {
            return {
                exists: () => true,
                data: () => roomData
            };
        }
    };

    assert.equal((await ensureChatRoom(firebase, "uid-b", "uid-a", {}, inviteId)).roomId, "uid-a_uid-b");
    roomData = { participants: ["uid-a", "uid-b"], keyId: alternateInviteId };
    await assert.rejects(
        ensureChatRoom(firebase, "uid-b", "uid-a", {}, inviteId),
        /different encryption invite/
    );
    roomData = { participants: ["uid-a", "uid-c"] };
    await assert.rejects(ensureChatRoom(firebase, "uid-b", "uid-a", {}, inviteId), /different participant list/);
});

test("a concurrent room creator is accepted only after validating the created room", async () => {
    let roomExists = false;
    const firebase = {
        db: {},
        doc() {
            return {};
        },
        async getDoc() {
            return {
                exists: () => roomExists,
                data: () => ({ participants: ["uid-a", "uid-b"], keyId: inviteId })
            };
        },
        async setDoc(_reference, data) {
            assert.deepEqual(data.participants, ["uid-a", "uid-b"]);
            assert.equal(data.keyId, inviteId);
            roomExists = true;
            throw new Error("duplicate create");
        },
        serverTimestamp() {
            return "server-timestamp";
        }
    };

    assert.equal((await ensureChatRoom(firebase, "uid-b", "uid-a", {}, inviteId)).roomId, "uid-a_uid-b");
});

test("room creation errors are not hidden when no readable room exists", async () => {
    const firebase = {
        db: {},
        doc() {
            return {};
        },
        async setDoc() {
            throw new Error("permission denied");
        },
        async getDoc() {
            throw new Error("permission denied");
        },
        serverTimestamp() {
            return "server-timestamp";
        }
    };

    await assert.rejects(ensureChatRoom(firebase, "uid-a", "uid-b", {}, inviteId), /permission denied/);
});

test("message validation stores only the encrypted payload and Firestore timestamp", () => {
    const ciphertext = Buffer.from("encrypted payload").toString("base64");
    const iv = Buffer.alloc(12, 3).toString("base64");
    const message = createChatMessage("auth-uid", "Guest_1234", ciphertext, iv, "server-timestamp");
    assert.deepEqual(message, {
        senderId: "auth-uid",
        senderName: "Guest_1234",
        ciphertext,
        iv,
        createdAt: "server-timestamp"
    });
    assert.equal(Object.hasOwn(message, "text"), false);
    assert.throws(() => createChatMessage("", "Guest_1234", ciphertext, iv, "timestamp"), /valid sender/);
    assert.throws(() => createChatMessage("auth-uid", "", ciphertext, iv, "timestamp"), /valid sender/);
    assert.throws(() => createChatMessage("auth-uid", "Guest_1234", "", iv, "timestamp"), /ciphertext/);
    assert.throws(() => createChatMessage("auth-uid", "Guest_1234", ciphertext, "bad", "timestamp"), /ciphertext/);
});

test("PBKDF2 room keys are deterministic, pair-specific, and encrypt/decrypt AES-GCM payloads", async () => {
    const key = await deriveChatRoomKey(inviteSecret, "uid-a", "uid-b");
    const reversedKey = await deriveChatRoomKey(inviteSecret, "uid-b", "uid-a");
    const otherRoomKey = await deriveChatRoomKey(inviteSecret, "uid-a", "uid-c");
    const first = await encryptChatMessage(" private 🔒 message ", key);
    const second = await encryptChatMessage("private 🔒 message", key);

    assert.notEqual(first.iv, second.iv);
    assert.notEqual(first.ciphertext, second.ciphertext);
    assert.equal(await decryptChatMessage(first.ciphertext, first.iv, reversedKey), "private 🔒 message");
    await assert.rejects(
        decryptChatMessage(first.ciphertext, first.iv, otherRoomKey)
    );
});

test("message encryption rejects empty or overlong plaintext and malformed key material", async () => {
    const key = await deriveChatRoomKey(inviteSecret, "uid-a", "uid-b");
    await assert.rejects(encryptChatMessage("  ", key), /1–500/);
    await assert.rejects(encryptChatMessage("x".repeat(501), key), /1–500/);
    await assert.rejects(deriveChatRoomKey("not-a-key", "uid-a", "uid-b"), /shared invite secret/);
});

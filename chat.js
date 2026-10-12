const FIREBASE_VERSION = "10.8.0";
const USERNAME_KEY = "vaii_chat_username";
const CONTACTS_KEY = "vaii_chat_contacts_v2";
const CHAT_KEYS_KEY = "vaii_chat_e2ee_keys_v1";
const PENDING_INVITES_KEY = "vaii_chat_e2ee_invites_v1";
const FIRESTORE_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`;

let firebaseModulesPromise = null;
let firebaseApp = null;
let firebaseAuth = null;
let observeAuthState = null;
let signInAnonymously = null;
let authStatePromise = null;
let anonymousSignInPromise = null;
let unsubscribeRoomDiscovery = null;
let discoveredRoomsUid = null;
let observedAuthUid;
let overlay = null;
let elements = null;
let activeContact = null;
let activeRoomKey = null;
let activeRoomKeyContactId = null;
let messageSnapshotSequence = 0;
let unsubscribeMessages = null;
let returnFocusToTerminal = false;
let previousFocus = null;

function getDisplayName() {
    let username = localStorage.getItem(USERNAME_KEY);
    if (!username) {
        username = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem(USERNAME_KEY, username);
    }
    return username.slice(0, 30);
}

function readContacts() {
    const storedContacts = localStorage.getItem(CONTACTS_KEY);
    if (!storedContacts) return [];

    const contacts = JSON.parse(storedContacts);
    if (!Array.isArray(contacts)) {
        throw new Error("Saved chat contacts have an invalid format.");
    }
    return contacts.filter(contact =>
        contact &&
        typeof contact.id === "string" &&
        typeof contact.name === "string"
    );
}

function saveContacts(contacts) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

function isValidUserId(userId) {
    return typeof userId === "string" &&
        userId.length > 0 &&
        userId.length <= 128 &&
        !userId.includes("/");
}

export function buildChatRoomId(firstUid, secondUid) {
    if (!isValidUserId(firstUid) || !isValidUserId(secondUid) || firstUid === secondUid) {
        throw new Error("A chat room requires two different valid Firebase UIDs.");
    }
    return [firstUid, secondUid].sort().join("_");
}

export function hasExpectedRoomParticipants(participants, firstUid, secondUid) {
    if (!isValidUserId(firstUid) || !isValidUserId(secondUid) || firstUid === secondUid) return false;
    const expected = [firstUid, secondUid].sort();
    return Array.isArray(participants) &&
        participants.length === 2 &&
        new Set(participants).size === 2 &&
        participants[0] === expected[0] &&
        participants[1] === expected[1];
}

export function getOtherRoomParticipant(participants, currentUid) {
    if (!isValidUserId(currentUid) ||
        !Array.isArray(participants) ||
        participants.length !== 2 ||
        new Set(participants).size !== 2 ||
        !participants.every(isValidUserId) ||
        !participants.includes(currentUid)) {
        return null;
    }
    return participants.find(uid => uid !== currentUid) || null;
}

export function getContactDisplayName(contact) {
    const savedName = typeof contact?.name === "string" ? contact.name.trim() : "";
    return savedName && savedName !== contact.id ? savedName : contact?.id || "Unknown contact";
}

export function mergeDiscoveredRoomContacts(roomDataList, currentUid, contacts = []) {
    const merged = new Map(
        contacts
            .filter(contact => contact && isValidUserId(contact.id) && typeof contact.name === "string")
            .map(contact => [contact.id, { id: contact.id, name: contact.name }])
    );
    const discovered = [];

    roomDataList.forEach(roomData => {
        const peerUid = getOtherRoomParticipant(roomData?.participants, currentUid);
        if (!peerUid) return;

        const savedContact = merged.get(peerUid);
        const roomName = typeof roomData.participantNames?.[peerUid] === "string"
            ? roomData.participantNames[peerUid].trim().slice(0, 30)
            : "";
        const contactName = roomName || savedContact?.name || peerUid;
        const contact = { id: peerUid, name: contactName };
        if (!savedContact) {
            discovered.push(contact);
            merged.set(peerUid, contact);
        } else if (savedContact.name === peerUid && roomName) {
            merged.set(peerUid, contact);
            discovered.push(contact);
        }
    });

    return { contacts: Array.from(merged.values()), discovered };
}

export function mergeMessageDisplayName(contacts, contactUid, senderId, senderName) {
    const normalizedName = typeof senderName === "string" ? senderName.trim().slice(0, 30) : "";
    if (!normalizedName || senderId !== contactUid) return contacts;

    return contacts.map(contact =>
        contact.id === contactUid &&
        (!contact.name || contact.name === contactUid || /^Guest_\d+$/.test(contact.name))
            ? { ...contact, name: normalizedName }
            : contact
    );
}

function getWebCrypto() {
    const cryptoApi = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
    if (!cryptoApi?.subtle || !cryptoApi.getRandomValues) {
        throw new Error("This browser does not support the Web Cryptography API required for encrypted chat.");
    }
    return cryptoApi;
}

function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function base64ToBytes(encoded) {
    if (typeof encoded !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
        throw new Error("Invalid base64 chat data.");
    }
    const binary = atob(encoded);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function bytesToBase64Url(bytes) {
    return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(encoded) {
    if (typeof encoded !== "string" || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
        throw new Error("Invalid invite key encoding.");
    }
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    return base64ToBytes(base64 + "=".repeat((4 - base64.length % 4) % 4));
}

function isValidInviteMaterial(inviteId, secret) {
    try {
        return isValidInviteId(inviteId) && isValidChatSecret(secret);
    } catch {
        return false;
    }
}

function isValidInviteId(inviteId) {
    try {
        return base64UrlToBytes(inviteId).length === 16;
    } catch {
        return false;
    }
}

function isValidChatSecret(secret) {
    try {
        return base64UrlToBytes(secret).length === 32;
    } catch {
        return false;
    }
}

export async function deriveChatRoomKey(sharedSecret, firstUid, secondUid) {
    if (!isValidChatSecret(sharedSecret)) {
        throw new Error("A valid 256-bit shared invite secret is required.");
    }
    if (!isValidUserId(firstUid) || !isValidUserId(secondUid) || firstUid === secondUid) {
        throw new Error("A room key requires two different valid Firebase UIDs.");
    }
    const cryptoApi = getWebCrypto();
    const secretBytes = base64UrlToBytes(sharedSecret);
    const passwordKey = await cryptoApi.subtle.importKey("raw", secretBytes, "PBKDF2", false, ["deriveKey"]);
    const salt = new TextEncoder().encode(
        `VAII contact chat E2EE v1:${[firstUid, secondUid].sort().join(":")}`
    );
    return cryptoApi.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptChatMessage(plaintext, key) {
    if (typeof plaintext !== "string" || !plaintext.trim() || plaintext.length > 500) {
        throw new Error("Message must contain 1–500 characters of text.");
    }
    const cryptoApi = getWebCrypto();
    const iv = cryptoApi.getRandomValues(new Uint8Array(12));
    const ciphertext = await cryptoApi.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(plaintext.trim())
    );
    return {
        ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
        iv: bytesToBase64(iv)
    };
}

export async function decryptChatMessage(ciphertext, iv, key) {
    const ivBytes = base64ToBytes(iv);
    if (ivBytes.length !== 12) throw new Error("Invalid AES-GCM initialization vector.");
    const encryptedBytes = base64ToBytes(ciphertext);
    const plaintext = await getWebCrypto().subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        key,
        encryptedBytes
    );
    return new TextDecoder().decode(plaintext);
}

export function createChatMessage(senderId, senderName, ciphertext, iv, createdAt) {
    const normalizedName = typeof senderName === "string" ? senderName.trim().slice(0, 30) : "";
    let validCiphertext = false;
    let validIv = false;
    try {
        validCiphertext = base64ToBytes(ciphertext).length > 16;
        validIv = base64ToBytes(iv).length === 12;
    } catch {
        validCiphertext = false;
    }
    if (!isValidUserId(senderId) || !normalizedName || !validCiphertext || !validIv) {
        throw new Error("Message must include a valid sender, display name, ciphertext, and AES-GCM IV.");
    }
    return { senderId, senderName: normalizedName, ciphertext, iv, createdAt };
}

function readStoredSecretMap(storageKey) {
    const value = localStorage.getItem(storageKey);
    if (!value) return Object.create(null);
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Saved chat encryption keys have an invalid format.");
    }
    return Object.assign(Object.create(null), parsed);
}

function persistIncomingInvite(contactUid, inviteId, secret) {
    if (!isValidInviteMaterial(inviteId, secret)) {
        throw new Error("This invite does not contain a valid chat encryption key.");
    }
    const keys = readStoredSecretMap(CHAT_KEYS_KEY);
    const existing = keys[contactUid];
    if (existing && existing.inviteId !== inviteId) return false;
    keys[contactUid] = { inviteId, secret };
    localStorage.setItem(CHAT_KEYS_KEY, JSON.stringify(keys));
    return true;
}

function getContactInviteKey(contactUid) {
    const stored = readStoredSecretMap(CHAT_KEYS_KEY)[contactUid];
    return stored && isValidInviteMaterial(stored.inviteId, stored.secret) ? stored : null;
}

function storePendingInvite(inviteId, secret) {
    const invites = readStoredSecretMap(PENDING_INVITES_KEY);
    invites[inviteId] = secret;
    localStorage.setItem(PENDING_INVITES_KEY, JSON.stringify(invites));
}

function adoptDiscoveredInviteKeys(roomDataList, currentUid) {
    const invites = readStoredSecretMap(PENDING_INVITES_KEY);
    const keys = readStoredSecretMap(CHAT_KEYS_KEY);
    const adopted = [];
    let consumedInvite = false;
    roomDataList.forEach(roomData => {
        const peerUid = getOtherRoomParticipant(roomData?.participants, currentUid);
        const secret = invites[roomData?.keyId];
        if (!peerUid || !secret || !isValidInviteMaterial(roomData.keyId, secret)) return;
        if (keys[peerUid] && keys[peerUid].inviteId !== roomData.keyId) return;
        if (!keys[peerUid]) {
            keys[peerUid] = { inviteId: roomData.keyId, secret };
            adopted.push(peerUid);
        }
        delete invites[roomData.keyId];
        consumedInvite = true;
    });
    if (adopted.length) localStorage.setItem(CHAT_KEYS_KEY, JSON.stringify(keys));
    if (consumedInvite) localStorage.setItem(PENDING_INVITES_KEY, JSON.stringify(invites));
    return adopted;
}

export function configureContactChat({ app, auth, onAuthStateChanged, signInAnonymously: anonymousSignIn }) {
    if (!app || !auth || auth.app !== app || !onAuthStateChanged || !anonymousSignIn) {
        throw new Error("Contact chat requires the VAII Firebase app and its Auth methods.");
    }
    firebaseApp = app;
    firebaseAuth = auth;
    observeAuthState = onAuthStateChanged;
    signInAnonymously = anonymousSignIn;
    authStatePromise = null;
    anonymousSignInPromise = null;
    firebaseModulesPromise = null;
    unsubscribeRoomDiscovery?.();
    unsubscribeRoomDiscovery = null;
    discoveredRoomsUid = null;
    observedAuthUid = undefined;
}

export function handleContactChatAuthState(user) {
    const nextUid = user?.uid || null;
    if (observedAuthUid !== undefined && observedAuthUid !== null && observedAuthUid !== nextUid) {
        unsubscribeRoomDiscovery?.();
        unsubscribeRoomDiscovery = null;
        discoveredRoomsUid = null;
        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }
        activeContact = null;
        closeContactChat();
    }
    if (!user) anonymousSignInPromise = null;
    observedAuthUid = nextUid;
    if (user) startRoomDiscovery(user).catch(error => {
        console.error("Chat room discovery failed:", error);
        setStatus(`Could not discover chats: ${error.message}`, true);
    });
}

export async function getAuthenticatedUser() {
    if (!firebaseAuth || !observeAuthState || !signInAnonymously) {
        throw new Error("Firebase Authentication is not configured for chat.");
    }
    if (firebaseAuth.currentUser) return firebaseAuth.currentUser;

    if (!authStatePromise) {
        authStatePromise = new Promise((resolve, reject) => {
            let unsubscribe;
            unsubscribe = observeAuthState(firebaseAuth, user => {
                unsubscribe();
                resolve(user);
            }, error => {
                unsubscribe?.();
                reject(error);
            });
        }).catch(error => {
            authStatePromise = null;
            throw error;
        });
    }

    await authStatePromise;
    if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
    if (!anonymousSignInPromise) {
        anonymousSignInPromise = signInAnonymously(firebaseAuth)
            .then(credential => {
                anonymousSignInPromise = null;
                return credential.user;
            })
            .catch(error => {
                anonymousSignInPromise = null;
                throw error;
            });
    }
    return anonymousSignInPromise;
}

function setStatus(message, isError = false) {
    if (!elements) return;
    elements.status.textContent = message;
    elements.status.dataset.error = String(isError);
}

async function getFirebaseModules() {
    if (!firebaseModulesPromise) {
        firebaseModulesPromise = import(FIRESTORE_URL).then(firestoreModule => {
            if (!firebaseApp) {
                throw new Error("Firebase is not configured for chat.");
            }
            return {
                db: firestoreModule.getFirestore(firebaseApp),
                doc: firestoreModule.doc,
                getDoc: firestoreModule.getDoc,
                setDoc: firestoreModule.setDoc,
                collection: firestoreModule.collection,
                where: firestoreModule.where,
                addDoc: firestoreModule.addDoc,
                onSnapshot: firestoreModule.onSnapshot,
                query: firestoreModule.query,
                orderBy: firestoreModule.orderBy,
                limit: firestoreModule.limit,
                serverTimestamp: firestoreModule.serverTimestamp
            };
        }).catch(error => {
            firebaseModulesPromise = null;
            throw error;
        });
    }
    return firebaseModulesPromise;
}

async function startRoomDiscovery(user) {
    if (discoveredRoomsUid === user.uid && unsubscribeRoomDiscovery) return;

    unsubscribeRoomDiscovery?.();
    unsubscribeRoomDiscovery = null;
    discoveredRoomsUid = user.uid;

    const firebase = await getFirebaseModules();
    if (firebaseAuth?.currentUser?.uid !== user.uid || discoveredRoomsUid !== user.uid) return;

    const userRoomsQuery = firebase.query(
        firebase.collection(firebase.db, "vaii_rooms"),
        firebase.where("participants", "array-contains", user.uid)
    );
    unsubscribeRoomDiscovery = firebase.onSnapshot(userRoomsQuery, snapshot => {
        if (firebaseAuth?.currentUser?.uid !== user.uid || discoveredRoomsUid !== user.uid) return;

        try {
            const roomDataList = snapshot.docs.map(document => document.data());
            const result = mergeDiscoveredRoomContacts(
                roomDataList,
                user.uid,
                readContacts()
            );
            const adoptedKeyPeers = adoptDiscoveredInviteKeys(roomDataList, user.uid);
            if (result.discovered.length) {
                saveContacts(result.contacts);
                renderContacts();
                if (activeContact) {
                    const refreshedActiveContact = result.contacts.find(contact => contact.id === activeContact.id);
                    if (refreshedActiveContact) {
                        activeContact = refreshedActiveContact;
                        elements.contactName.textContent = getContactDisplayName(activeContact);
                    }
                }
            }
            if (!activeContact && result.discovered.length) {
                activeContact = result.discovered[result.discovered.length - 1];
                if (overlay && !overlay.hidden) selectContact(activeContact);
            } else if (overlay && !overlay.hidden && adoptedKeyPeers.includes(activeContact?.id)) {
                selectContact(activeContact);
            }
        } catch (error) {
            setStatus(`Could not save discovered contacts: ${error.message}`, true);
        }
    }, error => {
        console.error("Chat room discovery listener failed:", error);
        setStatus(`Could not discover chats: ${error.message}`, true);
    });
}

function renderContacts() {
    if (!elements) return;
    let contacts;
    try {
        contacts = readContacts();
    } catch (error) {
        setStatus(`Could not load saved contacts: ${error.message}`, true);
        return;
    }
    elements.contacts.replaceChildren();

    if (contacts.length === 0) {
        const empty = document.createElement("p");
        empty.className = "vaii-chat-empty";
        empty.textContent = "No contacts yet. Add a user ID or share your invite link.";
        elements.contacts.append(empty);
        return;
    }

    contacts.forEach(contact => {
        const button = document.createElement("button");
        button.className = "vaii-chat-contact";
        button.type = "button";
        button.dataset.contactId = contact.id;
        button.setAttribute("aria-current", String(activeContact?.id === contact.id));

        const name = document.createElement("strong");
        name.textContent = contact.name || contact.id;
        const id = document.createElement("span");
        id.textContent = contact.id;
        button.append(name, id);
        button.addEventListener("click", () => selectContact(contact));
        elements.contacts.append(button);
    });
}

function renderMessages(messages) {
    elements.messages.replaceChildren();

    if (messages.length === 0) {
        const empty = document.createElement("p");
        empty.className = "vaii-chat-empty";
        empty.textContent = "No messages yet. Say hello!";
        elements.messages.append(empty);
    } else {
        const userId = firebaseAuth?.currentUser?.uid;
        messages.forEach(message => {
            const item = document.createElement("article");
            item.className = `vaii-chat-message${message.senderId === userId ? " vaii-chat-message-own" : ""}`;

            const heading = document.createElement("div");
            heading.className = "vaii-chat-message-heading";
            const sender = document.createElement("strong");
            sender.textContent = message.senderName || message.senderId || "Unknown";
            const time = document.createElement("time");
            if (message.createdAt?.toDate) {
                time.dateTime = message.createdAt.toDate().toISOString();
                time.textContent = message.createdAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
            } else {
                time.textContent = "Sending…";
            }
            heading.append(sender, time);

            const text = document.createElement("p");
            text.textContent = typeof message.text === "string" ? message.text : "";
            item.append(heading, text);
            elements.messages.append(item);
        });
    }

    elements.messages.scrollTop = elements.messages.scrollHeight;
}

function closeContactChat() {
    if (!overlay || overlay.hidden) return;
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }
    activeRoomKey = null;
    activeRoomKeyContactId = null;
    messageSnapshotSequence++;
    elements.encryptionNotice.hidden = true;
    overlay.hidden = true;

    if (returnFocusToTerminal) {
        requestAnimationFrame(() => {
            const terminal = document.getElementById("vaii-terminal-overlay");
            const terminalInput = document.getElementById("terminal-cli-input");
            if (terminal && terminal.style.display !== "none" && terminalInput) {
                terminalInput.focus();
            }
        });
    } else if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
    }
    returnFocusToTerminal = false;
}

export async function ensureChatRoom(firebase, myUid, targetUid, displayNames = {}, inviteId) {
    const roomId = buildChatRoomId(myUid, targetUid);
    if (!isValidInviteId(inviteId)) {
        throw new Error("A valid invite ID is required to create an encrypted chat room.");
    }
    const roomRef = firebase.doc(firebase.db, "vaii_rooms", roomId);
    const participants = [myUid, targetUid].sort();
    const validateExistingRoom = snapshot => {
        if (!snapshot.exists()) return false;
        const roomData = snapshot.data();
        if (!hasExpectedRoomParticipants(roomData.participants, myUid, targetUid)) {
            throw new Error("This room already exists with a different participant list; access was not granted.");
        }
        if (roomData.keyId !== inviteId) {
            throw new Error("This room uses a different encryption invite. Use the original invite link.");
        }
        return true;
    };

    let existingRoom;
    try {
        existingRoom = await firebase.getDoc(roomRef);
    } catch {
        // Rules may deny reads of a missing room; try the create-only write next.
    }
    if (existingRoom && validateExistingRoom(existingRoom)) return { roomId, participants };

    try {
        await firebase.setDoc(roomRef, {
            participants,
            participantNames: {
                [myUid]: getValidDisplayName(displayNames[myUid]),
                [targetUid]: getValidDisplayName(displayNames[targetUid])
            },
            keyId: inviteId,
            createdAt: firebase.serverTimestamp()
        });
        return { roomId, participants };
    } catch (createError) {
        let roomSnapshot;
        try {
            roomSnapshot = await firebase.getDoc(roomRef);
        } catch {
            throw createError;
        }
        if (validateExistingRoom(roomSnapshot)) return { roomId, participants };
        throw createError;
    }
}

function getValidDisplayName(name) {
    return typeof name === "string" && name.trim()
        ? name.trim().slice(0, 30)
        : "";
}

async function selectContact(contact) {
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }

    activeRoomKey = null;
    activeRoomKeyContactId = null;
    messageSnapshotSequence++;
    activeContact = contact;
    elements.contactName.textContent = getContactDisplayName(contact);
    elements.contactId.textContent = contact.id;
    elements.encryptionNotice.hidden = true;
    elements.messages.replaceChildren();
    elements.composer.disabled = true;
    elements.send.disabled = true;
    renderContacts();
    setStatus("Establishing encrypted connection…");

    try {
        const user = await getAuthenticatedUser();
        if (overlay.hidden || activeContact?.id !== contact.id) return;
        if (user.uid === contact.id) {
            throw new Error("You cannot start a chat with your own Firebase UID.");
        }

        const inviteKey = getContactInviteKey(contact.id);
        if (!inviteKey) {
            throw new Error("No shared encryption key is available. Ask this contact to send you a secure invite link.");
        }
        const roomKey = await deriveChatRoomKey(inviteKey.secret, user.uid, contact.id);
        if (overlay.hidden || activeContact?.id !== contact.id) return;

        const firebase = await getFirebaseModules();
        if (overlay.hidden || activeContact?.id !== contact.id) return;

        const { roomId } = await ensureChatRoom(firebase, user.uid, contact.id, {
            [user.uid]: getDisplayName(),
            [contact.id]: contact.name
        }, inviteKey.inviteId);
        if (overlay.hidden || activeContact?.id !== contact.id) return;
        activeRoomKey = roomKey;
        activeRoomKeyContactId = contact.id;
        elements.encryptionNotice.hidden = false;
        elements.composer.disabled = false;
        elements.send.disabled = false;
        const messagesQuery = firebase.query(
            firebase.collection(firebase.db, "vaii_rooms", roomId, "messages"),
            firebase.orderBy("createdAt", "asc"),
            firebase.limit(50)
        );
        unsubscribeMessages = firebase.onSnapshot(messagesQuery, snapshot => {
            if (!overlay.hidden && activeContact?.id === contact.id) {
                const sequence = ++messageSnapshotSequence;
                const currentKey = activeRoomKey;
                const encryptedMessages = snapshot.docs.map(document => document.data());
                Promise.all(encryptedMessages.map(async message => {
                    try {
                        return {
                            ...message,
                            text: await decryptChatMessage(message.ciphertext, message.iv, currentKey)
                        };
                    } catch {
                        return { ...message, text: "[Decryption error]" };
                    }
                })).then(messages => {
                    if (overlay.hidden ||
                        activeContact?.id !== contact.id ||
                        activeRoomKey !== currentKey ||
                        messageSnapshotSequence !== sequence) return;
                    renderMessages(messages);
                    const latestPeerMessage = [...encryptedMessages].reverse()
                        .find(message => message.senderId === contact.id && message.senderName);
                    if (latestPeerMessage?.senderName) {
                        const contacts = readContacts();
                        const updatedContacts = mergeMessageDisplayName(
                            contacts,
                            contact.id,
                            latestPeerMessage.senderId,
                            latestPeerMessage.senderName
                        );
                        const updatedContact = updatedContacts.find(saved => saved.id === contact.id);
                        if (updatedContact) {
                            const savedContact = contacts.find(saved => saved.id === contact.id);
                            if (updatedContact.name !== savedContact?.name) {
                                saveContacts(updatedContacts);
                                renderContacts();
                            }
                            contact.name = updatedContact.name;
                            if (activeContact?.id === contact.id) {
                                activeContact = { ...activeContact, name: updatedContact.name };
                                elements.contactName.textContent = getContactDisplayName(activeContact);
                            }
                        }
                    }
                    setStatus("Connected");
                }).catch(error => {
                    if (activeContact?.id === contact.id) {
                        setStatus(`Could not decrypt messages: ${error.message}`, true);
                    }
                });
            }
        }, error => {
            if (activeContact?.id === contact.id) {
                setStatus(`Could not load messages: ${error.message}`, true);
            }
        });
    } catch (error) {
        setStatus(`Could not connect to Firestore: ${error.message}`, true);
    }
}

function addContact(userId, name = "") {
    const normalizedId = userId.trim();
    if (!isValidUserId(normalizedId)) {
        setStatus("Enter a valid Firebase UID (up to 128 characters, without /).", true);
        return null;
    }

    const contacts = readContacts();
    const existing = contacts.find(contact => contact.id === normalizedId);
    const contact = {
        id: normalizedId,
        name: name.trim().slice(0, 30) || existing?.name || normalizedId
    };
    if (existing) {
        Object.assign(existing, contact);
    } else {
        contacts.push(contact);
    }
    saveContacts(contacts);
    renderContacts();
    return contact;
}

async function sendMessage() {
    const text = elements.composer.value.trim();
    if (!text) return;
    if (["exit", "/exit", "quit", "/quit"].includes(text.toLowerCase())) {
        closeContactChat();
        return;
    }
    if (text.length > 500 || !activeContact) return;

    const contact = activeContact;
    const key = activeRoomKeyContactId === contact.id ? activeRoomKey : null;
    let inviteKey;
    try {
        inviteKey = getContactInviteKey(contact.id);
    } catch (error) {
        setStatus(`Could not load chat encryption key: ${error.message}`, true);
        return;
    }
    if (!key || !inviteKey) {
        setStatus("This chat is not encrypted yet. Get a secure invite link from your contact.", true);
        return;
    }
    elements.send.disabled = true;
    setStatus("Sending…");
    try {
        const user = await getAuthenticatedUser();
        if (user.uid === contact.id) {
            throw new Error("You cannot send a message to your own Firebase UID.");
        }
        const firebase = await getFirebaseModules();
        const { roomId } = await ensureChatRoom(firebase, user.uid, contact.id, {
            [user.uid]: getDisplayName(),
            [contact.id]: contact.name
        }, inviteKey.inviteId);
        const encrypted = await encryptChatMessage(text, key);
        const message = createChatMessage(
            user.uid,
            getDisplayName(),
            encrypted.ciphertext,
            encrypted.iv,
            firebase.serverTimestamp()
        );
        await firebase.addDoc(
            firebase.collection(firebase.db, "vaii_rooms", roomId, "messages"),
            message
        );
        elements.composer.value = "";
        if (!overlay.hidden && activeContact?.id === contact.id) {
            setStatus("Connected");
            elements.composer.focus();
        }
    } catch (error) {
        setStatus(`Could not send message: ${error.message}`, true);
    } finally {
        elements.send.disabled = !activeContact || activeRoomKeyContactId !== activeContact.id;
    }
}

function createChatOverlay() {
    const style = document.createElement("style");
    style.textContent = `
        #vaii-contact-chat-overlay[hidden] { display: none !important; }
        #vaii-contact-chat-overlay {
            position: fixed; inset: 0; z-index: 100001; display: flex;
            background: #0d1117; color: #c9d1d9; font: 14px system-ui, sans-serif;
        }
        #vaii-contact-chat-overlay * { box-sizing: border-box; }
        #vaii-contact-chat-overlay button,
        #vaii-contact-chat-overlay input {
            font: inherit;
        }
        #vaii-contact-chat-overlay button {
            color: inherit; cursor: pointer;
        }
        .vaii-chat-sidebar {
            width: min(320px, 34vw); min-width: 250px; padding: 20px;
            background: #161b22; border-right: 1px solid #30363d;
            display: flex; flex-direction: column; gap: 18px;
        }
        .vaii-chat-profile { border-bottom: 1px solid #30363d; padding-bottom: 16px; }
        .vaii-chat-profile-label, .vaii-chat-label {
            display: block; color: #8b949e; font-size: 12px; margin-bottom: 7px;
        }
        .vaii-chat-profile-name { color: #7ee787; font-weight: 700; }
        .vaii-chat-rename-row, .vaii-chat-add-row, .vaii-chat-composer {
            display: flex; gap: 8px;
        }
        .vaii-chat-rename-row[hidden] { display: none; }
        .vaii-chat-rename-row input, .vaii-chat-add-row input, .vaii-chat-composer input {
            min-width: 0; flex: 1; color: #f0f6fc; background: #0d1117;
            border: 1px solid #30363d; border-radius: 6px; padding: 10px 11px;
        }
        .vaii-chat-button {
            background: #21262d; border: 1px solid #30363d; border-radius: 6px;
            padding: 9px 12px;
        }
        .vaii-chat-button:hover { border-color: #58a6ff; }
        .vaii-chat-invite { width: 100%; color: #0d1117 !important; background: #7ee787; font-weight: 700; }
        .vaii-chat-contacts { min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
        .vaii-chat-contact {
            display: flex; flex-direction: column; gap: 4px; text-align: left;
            background: transparent; border: 1px solid transparent; border-radius: 7px; padding: 10px;
        }
        .vaii-chat-contact[aria-current="true"] { background: #21262d; border-color: #30363d; }
        .vaii-chat-contact strong { color: #f0f6fc; }
        .vaii-chat-contact span { color: #8b949e; font-size: 11px; overflow-wrap: anywhere; }
        .vaii-chat-main { min-width: 0; flex: 1; display: flex; flex-direction: column; }
        .vaii-chat-header {
            min-height: 76px; padding: 15px 22px; border-bottom: 1px solid #30363d;
            display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .vaii-chat-contact-heading { min-width: 0; }
        .vaii-chat-contact-heading strong { display: block; color: #f0f6fc; font-size: 16px; }
        .vaii-chat-contact-heading span { color: #8b949e; overflow-wrap: anywhere; font-size: 12px; }
        .vaii-chat-close { font-size: 21px; line-height: 1; padding: 8px 11px; }
        .vaii-chat-status { padding: 7px 22px 0; color: #8b949e; font-size: 12px; min-height: 24px; }
        .vaii-chat-status[data-error="true"] { color: #ff7b72; }
        .vaii-chat-encryption-notice {
            flex: 0 0 auto; margin: 10px 20px 0; padding: 8px 12px;
            color: #a9d6b2; background: #12251b; border: 1px solid #245b37;
            border-radius: 7px; font-size: 12px; line-height: 1.4;
        }
        .vaii-chat-messages {
            flex: 1; min-height: 0; overflow-y: auto; padding: 20px;
            display: flex; flex-direction: column; align-items: flex-start; gap: 12px;
        }
        .vaii-chat-message {
            max-width: min(75%, 680px); padding: 10px 13px; border: 1px solid #30363d;
            border-radius: 10px 10px 10px 3px; background: #161b22; overflow-wrap: anywhere;
        }
        .vaii-chat-message-own { align-self: flex-end; background: #12251b; border-color: #245b37; border-radius: 10px 10px 3px 10px; }
        .vaii-chat-message-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; }
        .vaii-chat-message-heading strong { color: #7ee787; font-size: 12px; white-space: nowrap; }
        .vaii-chat-message-heading time { color: #8b949e; font-size: 10px; white-space: nowrap; margin-left: auto; }
        .vaii-chat-message p { white-space: pre-wrap; margin: 6px 0 0; }
        .vaii-chat-empty { margin: auto; color: #8b949e; text-align: center; padding: 12px; }
        .vaii-chat-composer { padding: 14px 20px 20px; border-top: 1px solid #30363d; }
        .vaii-chat-composer input:disabled { opacity: .55; }
        @media (max-width: 680px) {
            .vaii-chat-sidebar { width: 40%; min-width: 145px; padding: 12px; gap: 14px; }
            .vaii-chat-main { min-width: 0; }
            .vaii-chat-header { padding: 12px; }
            .vaii-chat-status { padding-left: 12px; }
            .vaii-chat-encryption-notice { margin: 8px 12px 0; padding: 7px 9px; }
            .vaii-chat-messages { padding: 12px; }
            .vaii-chat-composer { padding: 10px 12px 12px; }
            .vaii-chat-add-row { flex-direction: column; }
            .vaii-chat-message { max-width: 100%; padding: 8px 9px; }
            .vaii-chat-message-heading strong { font-size: 11px; }
        }
    `;
    document.head.append(style);

    overlay = document.createElement("section");
    overlay.id = "vaii-contact-chat-overlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-label", "VAII contact chat");
    overlay.innerHTML = `
        <aside class="vaii-chat-sidebar">
            <div class="vaii-chat-profile">
                <span class="vaii-chat-profile-label">YOUR VAII PROFILE</span>
                <div class="vaii-chat-rename-row">
                    <strong class="vaii-chat-profile-name" id="vaii-chat-username"></strong>
                    <button class="vaii-chat-button" id="vaii-chat-rename" type="button">Rename</button>
                </div>
                <div class="vaii-chat-rename-row" id="vaii-chat-rename-controls" hidden>
                    <input id="vaii-chat-rename-input" maxlength="30" aria-label="Display name">
                    <button class="vaii-chat-button" id="vaii-chat-rename-save" type="button">Save</button>
                    <button class="vaii-chat-button" id="vaii-chat-rename-cancel" type="button">Cancel</button>
                </div>
            </div>
            <button class="vaii-chat-button vaii-chat-invite" id="vaii-chat-invite" type="button">Copy My Invite Link</button>
            <div>
                <label class="vaii-chat-label" for="vaii-chat-add-input">ADD CONTACT BY FIREBASE UID</label>
                <div class="vaii-chat-add-row">
                    <input id="vaii-chat-add-input" placeholder="Firebase Auth UID" autocomplete="off">
                    <button class="vaii-chat-button" id="vaii-chat-add" type="button">Add</button>
                </div>
            </div>
            <div class="vaii-chat-contacts" id="vaii-chat-contacts" aria-label="Contacts"></div>
        </aside>
        <main class="vaii-chat-main">
            <header class="vaii-chat-header">
                <div class="vaii-chat-contact-heading">
                    <strong id="vaii-chat-contact-name">Select a contact</strong>
                    <span id="vaii-chat-contact-id"></span>
                </div>
                <button class="vaii-chat-button vaii-chat-close" id="vaii-chat-close" type="button" aria-label="Close chat">✕</button>
            </header>
            <div class="vaii-chat-status" id="vaii-chat-status" role="status" aria-live="polite"></div>
            <div class="vaii-chat-encryption-notice" id="vaii-chat-encryption-notice" hidden>
                🔒 Messages in this chat are end-to-end encrypted. Only participants with this invite key can read them.
            </div>
            <div class="vaii-chat-messages" id="vaii-chat-messages" aria-live="polite"></div>
            <div class="vaii-chat-composer">
                <input id="vaii-chat-message-input" maxlength="500" placeholder="Select a contact to start chatting" disabled>
                <button class="vaii-chat-button" id="vaii-chat-send" type="button" disabled>Send</button>
            </div>
        </main>
    `;
    document.body.append(overlay);

    elements = {
        username: overlay.querySelector("#vaii-chat-username"),
        rename: overlay.querySelector("#vaii-chat-rename"),
        renameControls: overlay.querySelector("#vaii-chat-rename-controls"),
        renameInput: overlay.querySelector("#vaii-chat-rename-input"),
        renameSave: overlay.querySelector("#vaii-chat-rename-save"),
        renameCancel: overlay.querySelector("#vaii-chat-rename-cancel"),
        invite: overlay.querySelector("#vaii-chat-invite"),
        addInput: overlay.querySelector("#vaii-chat-add-input"),
        add: overlay.querySelector("#vaii-chat-add"),
        contacts: overlay.querySelector("#vaii-chat-contacts"),
        contactName: overlay.querySelector("#vaii-chat-contact-name"),
        contactId: overlay.querySelector("#vaii-chat-contact-id"),
        status: overlay.querySelector("#vaii-chat-status"),
        encryptionNotice: overlay.querySelector("#vaii-chat-encryption-notice"),
        messages: overlay.querySelector("#vaii-chat-messages"),
        composer: overlay.querySelector("#vaii-chat-message-input"),
        send: overlay.querySelector("#vaii-chat-send"),
        close: overlay.querySelector("#vaii-chat-close")
    };

    elements.rename.addEventListener("click", () => {
        elements.renameControls.hidden = false;
        elements.renameInput.value = getDisplayName();
        elements.renameInput.focus();
    });
    const saveUsername = () => {
        const username = elements.renameInput.value.trim();
        if (!username) {
            setStatus("Display name cannot be empty.", true);
            elements.renameInput.focus();
            return;
        }
        localStorage.setItem(USERNAME_KEY, username.slice(0, 30));
        elements.username.textContent = username.slice(0, 30);
        elements.renameControls.hidden = true;
        setStatus("Display name updated.");
    };
    elements.renameSave.addEventListener("click", saveUsername);
    elements.renameInput.addEventListener("keydown", event => {
        if (event.key === "Enter") saveUsername();
        if (event.key === "Escape") elements.renameControls.hidden = true;
    });
    elements.renameCancel.addEventListener("click", () => {
        elements.renameControls.hidden = true;
    });

    elements.invite.addEventListener("click", async () => {
        try {
            const user = await getAuthenticatedUser();
            const cryptoApi = getWebCrypto();
            const inviteId = bytesToBase64Url(cryptoApi.getRandomValues(new Uint8Array(16)));
            const secret = bytesToBase64Url(cryptoApi.getRandomValues(new Uint8Array(32)));
            storePendingInvite(inviteId, secret);
            const inviteLink = `${window.location.origin}/?addContact=${encodeURIComponent(user.uid)}&name=${encodeURIComponent(getDisplayName())}&inviteId=${inviteId}#key=${secret}`;
            await navigator.clipboard.writeText(inviteLink);
            setStatus("Secure invite link copied. Share this link with one contact.");
        } catch (error) {
            setStatus(`Could not copy invite link: ${error.message}`, true);
        }
    });

    const addContactFromInput = async () => {
        try {
            const user = await getAuthenticatedUser();
            const targetUid = elements.addInput.value.trim();
            if (targetUid === user.uid) {
                setStatus("You cannot add your own Firebase UID.", true);
                return;
            }
            const contact = addContact(targetUid);
            if (!contact) return;
            elements.addInput.value = "";
            selectContact(contact);
        } catch (error) {
            setStatus(`Could not authenticate: ${error.message}`, true);
        }
    };
    elements.add.addEventListener("click", addContactFromInput);
    elements.addInput.addEventListener("keydown", event => {
        if (event.key === "Enter") addContactFromInput();
    });
    elements.send.addEventListener("click", sendMessage);
    elements.composer.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
    elements.close.addEventListener("click", closeContactChat);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !overlay.hidden) {
            event.preventDefault();
            closeContactChat();
        }
    });
}

export function openContactChat(contactId = "", contactName = "", inviteMaterial = null) {
    if (!overlay) createChatOverlay();
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }

    previousFocus = document.activeElement;
    const terminal = document.getElementById("vaii-terminal-overlay");
    const terminalInput = document.getElementById("terminal-cli-input");
    returnFocusToTerminal = Boolean(
        terminal && terminal.style.display !== "none" && terminalInput
    );
    terminalInput?.blur();

    overlay.hidden = false;
    elements.username.textContent = getDisplayName();
    renderContacts();
    elements.composer.disabled = true;
    elements.send.disabled = true;
    elements.add.disabled = true;
    setStatus("Authenticating…");
    elements.addInput.focus();

    getAuthenticatedUser().then(user => {
        if (overlay.hidden) return;
        elements.add.disabled = false;
        elements.username.textContent = getDisplayName();

        let contact = null;
        if (contactId) {
            if (contactId === user.uid) {
                setStatus("This invite points to your own Firebase UID.", true);
                return;
            }
            if (inviteMaterial) {
                persistIncomingInvite(contactId, inviteMaterial.inviteId, inviteMaterial.secret);
            }
            contact = addContact(contactId, contactName || contactId);
        } else if (activeContact) {
            contact = readContacts().find(savedContact => savedContact.id === activeContact.id) || activeContact;
        }

        if (contact) {
            selectContact(contact);
            elements.composer.focus();
            return;
        }
        activeContact = null;
        elements.contactName.textContent = "Select a contact";
        elements.contactId.textContent = "";
        elements.composer.disabled = true;
        elements.send.disabled = true;
        elements.messages.replaceChildren();
        const empty = document.createElement("p");
        empty.className = "vaii-chat-empty";
        empty.textContent = "Add a contact to start a conversation.";
        elements.messages.append(empty);
        setStatus("Ready");
    }).catch(error => setStatus(`Could not authenticate: ${error.message}`, true));
}

export function initializeContactChat() {
    const inviteParams = new URLSearchParams(window.location.search);
    const targetUserId = inviteParams.get("addContact");
    if (!targetUserId) return;

    const targetName = inviteParams.get("name") || "";
    const inviteId = inviteParams.get("inviteId") || "";
    const secret = new URLSearchParams(window.location.hash.slice(1)).get("key") || "";
    const inviteMaterial = isValidInviteMaterial(inviteId, secret) ? { inviteId, secret } : null;
    window.history.replaceState({}, document.title, window.location.pathname);
    if (isValidUserId(targetUserId)) {
        openContactChat(targetUserId, targetName, inviteMaterial);
    } else {
        console.error("Ignoring an invite URL with an invalid Firebase UID.");
    }
}

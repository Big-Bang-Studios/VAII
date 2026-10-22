# ⚡ VAII
> **Virtual Assistant with Internet Integrations**

VAII is a lightweight, frontend-only web application designed to act as a localized, multi-modal smart assistant. Built entirely on vanilla JavaScript (ES6 Modules), HTML5, and CSS3, it bypasses the need for heavy backend frameworks by interacting directly with a matrix of client-safe REST APIs and Google Cloud services.

The architecture is divided into two distinct processing engines: **VAII Native** (for live, widget-based web utilities and interactive telemetry) and the **Gemini Ecosystem** (for persistent, text-based conversational memory).

---

## 🛠️ Core Engine Modes

### 1. VAII Native (Integration Mode)
The primary runtime chassis. This mode intercepts user queries and routes them to specific external APIs to render interactive HTML widgets directly in the DOM.

* **🎤 Speech Recognition & Voice Playback:** Uses the native browser Web Speech API for voice input dictation and clean text-to-speech (TTS) audio playback without markdown tags or emojis.
* **💱 Live Forex & Currency Converter (Frankfurter & Open Exchange):** Converts real-time exchange rates across global currencies (e.g., `convert 100 USD to EUR`, `50 GBP to JPY`) backed by European Central Bank datasets.
* **📱 Dynamic QR Code Generator (QRServer):** Generates scannable QR code cards (e.g., `qr https://vaii-two.vercel.app`) with direct PNG download support.
* **🛰️ Live ISS Telemetry (Where the ISS at):** Tracks real-time International Space Station orbital parameters, velocity ($km/h$), altitude, and spatial coordinates plotted on Google Maps (e.g., `iss`, `orbit`).
* **🚀 Astronomy APOD (NASA API):** Retrieves NASA’s Astronomy Picture of the Day with full high-resolution imagery and scientific breakdowns (e.g., `space`, `nasa`).
* **🌫️ Air Quality (Open-Meteo):** Looks up a city's current US AQI and pollutant readings without an API key (e.g., `airquality Tokyo`, `aqi Los Angeles`).
* **🔗 URL Shortening & Expansion:** Create is.gd links with `shorten [URL]`, copy them to the clipboard, or inspect a short link's destination with `expand [URL]`.
* **🚀 Upcoming Rocket Launches:** Shows the next five Launch Library 2 missions with pad details, live countdowns, and available video streams (`launches`, `spacex`).
* **🎨 Color Palette & Hex Inspector:** Shows RGB/HSL conversions, WCAG contrast ratios, and generated complementary/triadic swatches (`color #ff0055`, `hex 7289da`).
* **🧮 Subnet & CIDR Calculator:** Calculates IPv4 network and broadcast addresses, subnet mask, host range, and assignable address count locally (`subnet 192.168.1.0/24`, `cidr 10.0.0.0/16`).
* **⛏️ Minecraft Server Status:** Checks a Java server's online status, MOTD, player count, version, and latency (`mc hypixel.net`).
* **🐱 HTTP Status Cats:** Displays the http.cat illustration for a status code (`http 404`, `statuscat 500`).
* **👾 DiceBear Avatars:** Generates seeded Bottts robot avatars with SVG and PNG download links (`avatar [username]`).
* **🔋 Device Battery Telemetry:** Shows a live battery gauge, charging state, and estimated time remaining with `battery` or `power` where the browser supports the Battery Status API.
* **📶 Network Connection Information:** Shows browser-reported downlink speed, connection type, and round-trip time with `speed` or `network` where the browser supports the Network Information API.
* **📅 Upcoming Public Holidays (Nager.Date):** Lists upcoming public holidays by two-letter country code (e.g., `holiday US`, `holiday GB`).
* **☀️ NOAA Space Weather:** Displays the latest planetary K-index and geomagnetic activity status (e.g., `spaceweather`, `solarwind`).
* **🏛️ On This Day in History:** Retrieves an event recorded on today's date from public historical archives (e.g., `onthisday`, `history`).
* **🎲 Random Activity Generator:** Fetches a random activity with type, participant, price, and accessibility details (e.g., `/bored`).
* **🐙 GitHub Profile Lookup:** Displays public GitHub profile metrics and lets you inspect the user's latest public repository (e.g., `/ghuser torvalds`).
* **💡 Inscriptional Advice Slip:** Provides quick random pieces of wisdom and thought-provoking quotes (e.g., `advice`).
* **📊 Demographic Age Predictor (Agify.io):** Calculates statistical age predictions and sample population counts for given first names (e.g., `age Logan`, `age Alex`).
* **📖 Dictionary & Phonetics (Free Dictionary API):** Pulls parts of speech, lexical definitions, example sentences, and playable `.mp3` voice pronunciations (e.g., `define serendipity`).
* **🐶 Random Cute Pets (Dog CEO & CATAAS):** Renders instant dog and cat photography cards (e.g., `dog`, `cat`).
* **🏳️ Country & Flag Cards (REST Countries & World Bank):** Fetches high-res SVG flags, capitals, official names, currencies, and live demographic population metrics via the **World Bank API** (e.g., `country Japan`, `country Canada`).
* **🍸 Drink & Cocktail Recipes (TheCocktailDB):** Pulls ingredients, measurements, glass types, and preparation instructions for classic mixed drinks (e.g., `drink Margarita`, `random drink`).
* **🌐 Client Network Telemetry (ipapi.co):** Displays public client IP address, ISP provider, geographical region, and postal telemetry (e.g., `my ip`).
* **🎯 Interactive Trivia Quizzes (Open Trivia DB):** Renders multiple-choice questions with interactive button choices, automated score checking, and audio feedback (e.g., `trivia`, `quiz`).
* **🎮 PC Gaming Deals & Freebies (CheapShark API):** Tracks live 100% off game giveaways and deep discounts across Steam, Epic Games Store, and GOG (e.g., `free games`, `deals`).
* **🛍️ eBay Shopping Search:** Searches eBay's Browse API for product listings, prices, and direct links; open an item on eBay to review or purchase (e.g., `ebay noise cancelling headphones`).
* **😂 Joke Engines (icanhazdadjoke & Chuck Norris Database):** Delivers instant clean dad jokes (`joke`) and random Chuck Norris facts (`chuck`, `/chuck`).
* **🎵 Music & Audio Previews (iTunes Search API):** Renders 30-second audio previews, album artwork, and Apple Music routing links (e.g., `song Bohemian Rhapsody`).
* **⛩️ Anime & Manga Metadata (AniList GraphQL):** Fetches synopsis, popularity ratings, genres, authors, and episode counts with high request limits (e.g., `anime Attack on Titan`, `manga Berserk`).
* **⚡ Pokédex Telemetry (PokéAPI):** Renders official Pokémon sprites, base statistics, typings, heights, and weights (e.g., `pokemon Charizard`).
* **📚 Book Archives & ISBN Scanner (Open Library):** Searches book metadata (e.g., `book The Hobbit`) or decodes ISBN-10/ISBN-13 barcodes into titles, authors, publishers, and cover art (`isbn [code]`). Upload a book photo and enter `isbn` to scan its barcode.
* **🛒 Grocery Barcode Scanner (Open Food Facts):** Looks up grocery ingredients, Nutri-Score, and Palm Oil status by UPC/EAN (`barcode [code]`, `food [code]`); upload a product photo and enter `barcode` or `food` to scan its barcode.
* **📰 News Aggregator (GNews API):** Pulls live top global headlines or specific topic news (e.g., `top news`, `news about technology`).
* **🎬 Cinematic Media (OMDb API):** Renders movie posters, plots, and IMDb metrics (e.g., `movie Inception`).
* **📝 Persistent Notes:** Local storage manager to save and delete personal tasks and memos (e.g., `note: text`, `show notes`).
* **🧠 General Knowledge:** Simultaneous multi-source knowledge lookup via **Wiktionary**, **Wikipedia**, and **YouTube Data API v3**.
* **👁️ Vision Engine:** Analyzes user-uploaded Base64 image files using **Gemini 3.7 Flash**.
* **🗺️ Interactive Maps:** Renders live, interactive embedded maps using the **Google Maps JavaScript API**.
* **☀️ Climate & Weather:** Pulls real-time climate readings, wind speeds, and localized timezones using **Open-Meteo**, with an interactive **Windy weather radar** centered on the searched coordinates. Bare `weather`, `sunrise`, and `sunset` use browser geolocation with BigDataCloud reverse geocoding; `/asciiweather [city]` renders wttr.in's terminal report.
* **📍 Reverse Geocoding (BigDataCloud):** Resolves the browser's approximate locality, subdivision, country, and continent with `whereami` or `/locate`.
* **🍔 Local Food Concierge:** Maps food cravings to local chains and provides deep routing links to **DoorDash** and **Google Local Ordering**.
* **🔢 Arithmetic & Conversions:** Evaluates math expressions and imperial/metric unit conversions.
* **🗣️ Language Translation:** Routes semantic phrases through the **MyMemory Translation API**.
* **🪙 Crypto & Market Tickers:** Queries CoinGecko asset prices, 24-hour changes, market caps, and volumes with `crypto [symbol]`; stock ticker routing remains available.
* **📡 Service Status Monitor:** Checks live GitHub, Discord, and Cloudflare status summaries with `status [provider]`.
* **🎨 AI Art Generation:** Generates on-demand graphics via **Pollinations AI**.
* **💬 Contact Chat:** Type `chat` or `/chat` in the terminal or normal menu for a fullscreen contact chat backed by Firebase Firestore. Chat uses the app's Firebase Auth identity (anonymous Auth for unauthenticated visitors) and stores contact lists, display names, and shared invite secrets locally in the browser. Secure invite links carry a random secret in the URL fragment; share each link with only one contact. Messages use browser Web Crypto (PBKDF2-derived AES-GCM room keys), and Firestore stores ciphertext and IV rather than message text. Losing the browser's local storage or invite secret prevents decrypting that room's history. Authenticated clients discover rooms containing their own UID, so the recipient can open an invite link and the inviter learns the recipient UID from the shared room. Either participant can end a room for both people; ended rooms cannot be reopened, and their encrypted message history remains stored. Legacy contacts created with local-only IDs are intentionally not migrated.
* **📚 VAII School:** Open with `vaii school`, `school`, `/school`, or the School button. School has a separate editable display name that does not affect the contact chat name. Teachers can create math, ELA, and science multiple-choice assessments and share join links; students who open a link are linked to that teacher and see assignments from all their teachers. Teachers can also share a leave link that removes only the signed-in student who opens it. Students submit one scored result per assessment, teachers can review submitted answers and scores, and the menu displays a boot-time alert when assessments are waiting. Membership, assessments, and submissions are stored in Firestore; teacher links and the School display name are cached in the current browser's local storage.

---

### 2. Gemini Ecosystem (Conversational Mode)
An isolated conversational layer designed for multi-turn conversational reasoning.
* **Persistent History:** Tracks multi-turn dialogue with saved session titles and thread deletion.
* **Model Fallback Matrix:** Cascades downstream starting from **Gemini 3.8 Flash** down to Gemma models to maintain uptime if rate limits occur. Each request has a timeout so the chat does not remain stuck connecting.
* **Custom System Instructions:** User-defined personality parameters stored in `localStorage`.
* **VAII Native Guidance:** Recognizes requests for VAII Native commands and directs users to switch modes to run those commands; Gemini does not claim to execute Native tools or provide their live results.

---

## ⚠️ APK Compilation Warning

There is no officially distributed APK or public API key set for VAII. Compiling a local instance of VAII into an Android APK using standard web-to-APK wrappers (such as AppsGeyser or basic Android WebViews) **will fail at the login screen.**

Google Cloud security policies (`Error 403: disallowed_useragent`) block OAuth sign-in flows inside embedded WebViews to prevent keystroke interception.

---

## 🔑 Environment & Setup

Configure client-side API keys within `script.js`, and server-side credentials in your deployment environment:

1. **Firebase Config:** Initialize your project credentials (`apiKey`, `authDomain`, `projectId`) in `firebaseConfig.js`. The contact chat and VAII School require Firestore and Firebase Authentication to be enabled. Deploy the configured [firestore.rules](./firestore.rules) with `firebase deploy --only firestore:rules` to authorize authenticated E2EE room participants and validate encrypted messages, as well as to restrict school records, assessments, and student submissions. Anonymous identities persist with Firebase Auth on the current browser/device; users changing devices need a linked or otherwise recoverable Auth account to retain the same UID.
2. **Google Maps API Key:** Required for spatial rendering and the Local Food Concierge (`&libraries=places`).
3. **Google Cloud / Gemini API Key:** Required for Vision analysis and Gemini fallback tiers.
4. **YouTube Data API Key:** Required for creator subscriber metrics.
5. **OMDb API Key:** Required for cinematic search queries.
6. **GNews API Key:** Required for live news feeds.
7. **SerpApi eBay search:** Set `SERPAPI_API_KEY` as a server environment variable. Create a SerpApi account and copy its API key from the dashboard. Keep the key server-side; do not add it to `script.js`.

### Proxy Origin Access
The `/api/proxy` endpoint accepts browser requests from `https://vaii-two.vercel.app` and localhost origins. Same-origin browser requests without an `Origin` header are accepted only when the browser marks them as `same-origin`. This protects browser users from cross-origin sites reading proxy results; origin headers are not authentication and can be forged by non-browser clients.

---

## 📁 File Structure

* `index.html`: Complete single-page layout, responsive CSS, and sliding drawer containers.
* `script.js`: Core ES6 controller handling Firebase Auth, routing patterns, and API fetchers.
* `firebaseConfig.js`: Shared Firebase project configuration for Auth and Firestore.
* `chat.js`: Fullscreen terminal contact chat and Firestore message listeners.
* `school.js`: VAII School teacher/student linking, assessment creation, test-taking, scoring, and results.
* `firestore.rules`: Firestore authorization and schema validation for E2EE chat and VAII School.
* `privacy.html`: Local data storage and API telemetry policies.

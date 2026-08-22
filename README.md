# ⚡ VAII v6.0
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
* **💡 Inscriptional Advice Slip:** Provides quick random pieces of wisdom and thought-provoking quotes (e.g., `advice`).
* **📊 Demographic Age Predictor (Agify.io):** Calculates statistical age predictions and sample population counts for given first names (e.g., `age Logan`, `age Alex`).
* **📖 Dictionary & Phonetics (Free Dictionary API):** Pulls parts of speech, lexical definitions, example sentences, and playable `.mp3` voice pronunciations (e.g., `define serendipity`).
* **🐶 Random Cute Pets (Dog CEO & CATAAS):** Renders instant dog and cat photography cards (e.g., `dog`, `cat`).
* **🏳️ Country & Flag Cards (REST Countries & World Bank):** Fetches high-res SVG flags, capitals, official names, currencies, and live demographic population metrics via the **World Bank API** (e.g., `country Japan`, `country Canada`).
* **🍸 Drink & Cocktail Recipes (TheCocktailDB):** Pulls ingredients, measurements, glass types, and preparation instructions for classic mixed drinks (e.g., `drink Margarita`, `random drink`).
* **🌐 Client Network Telemetry (ipapi.co):** Displays public client IP address, ISP provider, geographical region, and postal telemetry (e.g., `my ip`).
* **🎯 Interactive Trivia Quizzes (Open Trivia DB):** Renders multiple-choice questions with interactive button choices, automated score checking, and audio feedback (e.g., `trivia`, `quiz`).
* **🎮 PC Gaming Deals & Freebies (CheapShark API):** Tracks live 100% off game giveaways and deep discounts across Steam, Epic Games Store, and GOG (e.g., `free games`, `deals`).
* **😂 Dad Jokes Engine (icanhazdadjoke):** Delivers instant clean one-liners (e.g., `joke`, `make me laugh`).
* **🎵 Music & Audio Previews (iTunes Search API):** Renders 30-second audio previews, album artwork, and Apple Music routing links (e.g., `song Bohemian Rhapsody`).
* **⛩️ Anime & Manga Metadata (AniList GraphQL):** Fetches synopsis, popularity ratings, genres, authors, and episode counts with high request limits (e.g., `anime Attack on Titan`, `manga Berserk`).
* **⚡ Pokédex Telemetry (PokéAPI):** Renders official Pokémon sprites, base statistics, typings, heights, and weights (e.g., `pokemon Charizard`).
* **📚 Book Archives (Open Library):** Searches cover art, first publication dates, authors, and page counts (e.g., `book The Hobbit`).
* **📰 News Aggregator (GNews API):** Pulls live top global headlines or specific topic news (e.g., `top news`, `news about technology`).
* **🎬 Cinematic Media (OMDb API):** Renders movie posters, plots, and IMDb metrics (e.g., `movie Inception`).
* **📝 Persistent Notes:** Local storage manager to save and delete personal tasks and memos (e.g., `note: text`, `show notes`).
* **🧠 General Knowledge:** Simultaneous multi-source knowledge lookup via **Wiktionary**, **Wikipedia**, and **YouTube Data API v3**.
* **👁️ Vision Engine:** Analyzes user-uploaded Base64 image files using **Gemini 3.7 Flash**.
* **🗺️ Interactive Maps:** Renders live, interactive embedded maps using the **Google Maps JavaScript API**.
* **☀️ Climate & Weather:** Pulls real-time climate readings, wind speeds, and localized timezones using **Open-Meteo**.
* **🍔 Local Food Concierge:** Maps food cravings to local chains and provides deep routing links to **DoorDash** and **Google Local Ordering**.
* **🔢 Arithmetic & Conversions:** Evaluates math expressions and imperial/metric unit conversions.
* **🗣️ Language Translation:** Routes semantic phrases through the **MyMemory Translation API**.
* **🪙 Crypto & Market Tickers:** Queries live cryptocurrency prices and 24-hour trends via **CoinGecko**.
* **🎨 AI Art Generation:** Generates on-demand graphics via **Pollinations AI**.

---

### 2. Gemini Ecosystem (Conversational Mode)
An isolated conversational layer designed for multi-turn conversational reasoning.
* **Persistent History:** Tracks multi-turn dialogue with saved session titles and thread deletion.
* **Model Fallback Matrix:** Cascades downstream starting from **Gemini 3.7 Flash** down to Gemma models to maintain uptime if rate limits occur.
* **Custom System Instructions:** User-defined personality parameters stored in `localStorage`.
* **Isolated Environment:** Explicitly separated from native tools to preserve conversational integrity.

---

## ⚠️ APK Compilation Warning

There is no officially distributed APK or public API key set for VAII. Compiling a local instance of VAII into an Android APK using standard web-to-APK wrappers (such as AppsGeyser or basic Android WebViews) **will fail at the login screen.**

Google Cloud security policies (`Error 403: disallowed_useragent`) block OAuth sign-in flows inside embedded WebViews to prevent keystroke interception.

---

## 🔑 Environment & Setup

Configure your API keys within `script.js`:

1. **Firebase Config:** Initialize your project credentials (`apiKey`, `authDomain`, `projectId`).
2. **Google Maps API Key:** Required for spatial rendering and the Local Food Concierge (`&libraries=places`).
3. **Google Cloud / Gemini API Key:** Required for Vision analysis and Gemini fallback tiers.
4. **YouTube Data API Key:** Required for creator subscriber metrics.
5. **OMDb API Key:** Required for cinematic search queries.
6. **GNews API Key:** Required for live news feeds.

---

## 📁 File Structure

* `index.html`: Complete single-page layout, responsive CSS, and sliding drawer containers.
* `script.js`: Core ES6 controller handling Firebase Auth, routing patterns, API fetchers, and chat state.
* `privacy.html`: Local data storage and API telemetry policies.

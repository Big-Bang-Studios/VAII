import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. CONFIG & KEYS
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA6RmZ6rquzUR1dct30s355PzLu-r1_fwE",
    authDomain: "vaiinternet.firebaseapp.com",
    projectId: "vaiinternet",
    storageBucket: "vaiinternet.firebasestorage.app",
    messagingSenderId: "367548633672",
    appId: "1:367548633672:web:44da44d1761085424b3e7d",
    measurementId: "G-0XBYP585WQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const GOOGLE_API_KEY = "AIzaSyAJ" + "KTkU0nd6" + "ZB_zjIcN" + "QCAQQsff" + "HEp4WH8";
const GEMINI_VISION_KEY = "AQ.Ab8RN" + "6JH2s8Lpq" + "PfRqjRgs" + "OgOMy2f76" + "HU4b4Xmg_CYURTOmgJQ";
const OMDB_API_KEY = "bd1c" + "f679"; 
const GNEWS_API_KEY = "a461968b" + "01ba9829" + "5729c637" + "0ec31d8d"; 

function getActiveGeminiKey() {
    const customKey = localStorage.getItem('vaii_custom_api_key');
    if (customKey && customKey.trim() !== '') {
        return customKey.trim();
    }
    return GEMINI_VISION_KEY;
}

const BASELINE_FALLBACK_TREE = [
    { name: "Gemini 3.7", id: "gemini-3.7-flash" },
    { name: "Gemini 3.6", id: "gemini-3.6-flash" },
    { name: "Gemini 3.5", id: "gemini-3.5-flash" },
    { name: "Gemini 3.1", id: "gemini-3.1-flash" },
    { name: "Gemini 3", id: "gemini-3-flash" },
    { name: "Gemini 2.5", id: "gemini-2.5-flash" },
    { name: "Gemini 2", id: "gemini-2-flash" },
    { name: "Gemma 4 31B", id: "gemma-4-31b" },
    { name: "Gemma 4 26B", id: "gemma-4-26b" }
];

const LOCAL_FOOD_DB = {
    "burger": [
        { name: "Wendy's", item: "Baconator with fries" },
        { name: "Five Guys", item: "Bacon Cheeseburger with Cajun Fries" },
        { name: "Shake Shack", item: "ShackBurger and a milkshake" },
        { name: "In-N-Out Burger", item: "Double-Double Animal Style" },
        { name: "McDonald's", item: "Big Mac meal" },
        { name: "Burger King", item: "Whopper with cheese" },
        { name: "Smashburger", item: "Classic Double Smash" },
        { name: "Whataburger", item: "Patty Melt" },
        { name: "Carl's Jr", item: "Western Bacon Cheeseburger" },
        { name: "Hardee's", item: "Monster Thickburger" },
        { name: "Culver's", item: "ButterBurger Cheese" },
        { name: "Steak 'n Shake", item: "Original Double 'n Cheese" },
        { name: "Jack in the Box", item: "Ultimate Cheeseburger" },
        { name: "Dairy Queen", item: "FlameThrower GrillBurger" },
        { name: "Sonic Drive-In", item: "SuperSONIC Double Cheeseburger" }
    ],
    "fries": [
        { name: "Five Guys", item: "Large Cajun Fries" },
        { name: "McDonald's", item: "Large World Famous Fries" },
        { name: "Wendy's", item: "Baconator Fries" },
        { name: "Checkers", item: "Fully Loaded Fries" },
        { name: "Rally's", item: "Famous Seasoned Fries" },
        { name: "Arby's", item: "Curly Fries" },
        { name: "Chick-fil-A", item: "Waffle Potato Fries" },
        { name: "Shake Shack", item: "Cheese Fries" },
        { name: "Steak 'n Shake", item: "Cheese 'n Bacon Fries" },
        { name: "Taco Bell", item: "Nacho Fries" }
    ],
    "pizza": [
        { name: "Domino's Pizza", item: "ExtravaganZZa Specialty Pizza" },
        { name: "Pizza Hut", item: "Meat Lover's Pan Pizza" },
        { name: "Papa John's", item: "The Works Pizza" },
        { name: "Little Caesars", item: "Hot-N-Ready Pepperoni" },
        { name: "Papa Murphy's", item: "Cowboy Take 'N' Bake" },
        { name: "Marco's Pizza", item: "Pepperoni Magnifico" },
        { name: "Jet's Pizza", item: "Detroit-Style Deep Dish" },
        { name: "Blaze Pizza", item: "Build Your Own Artisanal Pizza" },
        { name: "MOD Pizza", item: "Mad Dog Pizza" },
        { name: "California Pizza Kitchen", item: "Original BBQ Chicken Pizza" },
        { name: "Mellow Mushroom", item: "Holy Shiitake Pie" },
        { name: "Cici's", item: "Mac & Cheese Pizza" },
        { name: "Sbarro", item: "XL NY Style Pepperoni Slice" },
        { name: "Hungry Howie's", item: "Flavored Crust Pizza" },
        { name: "Godfather's Pizza", item: "Classic Combo" }
    ],
    "chicken": [
        { name: "Chick-fil-A", item: "Spicy Chicken Sandwich" },
        { name: "Popeyes", item: "Classic Chicken Sandwich" },
        { name: "KFC", item: "Famous Bowl" },
        { name: "Church's Chicken", item: "Spicy Bone-In Chicken" },
        { name: "Bojangles", item: "Cajun Chicken Filet Biscuit" },
        { name: "Zaxby's", item: "Chicken Finger Plate" },
        { name: "Raising Cane's", item: "The Box Combo" },
        { name: "El Pollo Loco", item: "Fire-Grilled Chicken Meal" },
        { name: "Wingstop", item: "Lemon Pepper Wings" },
        { name: "Buffalo Wild Wings", item: "Honey BBQ Boneless Wings" },
        { name: "Jollibee", item: "Chickenjoy" },
        { name: "PDQ", item: "Crispy Chicken Tenders" }
    ],
    "mexican": [
        { name: "Taco Bell", item: "Crunchwrap Supreme" },
        { name: "Chipotle", item: "Steak Burrito Bowl" },
        { name: "Qdoba", item: "3-Cheese Queso Burrito" },
        { name: "Moe's Southwest Grill", item: "Homewrecker Burrito" },
        { name: "Del Taco", item: "The Del Taco" },
        { name: "Baja Fresh", item: "Baja Burrito" },
        { name: "Taco John's", item: "Potato Olés" },
        { name: "Torchy's Tacos", item: "Trailer Park Taco" },
        { name: "On The Border", item: "Fajitas" },
        { name: "Chuy's", item: "Chick-a-Chuy Chimi" },
        { name: "Fuzzy's Taco Shop", item: "Baja Tacos" }
    ],
    "sandwich": [
        { name: "Subway", item: "Italian B.M.T." },
        { name: "Jersey Mike's", item: "Original Italian" },
        { name: "Jimmy John's", item: "Vito Sub" },
        { name: "Firehouse Subs", item: "Hook & Ladder" },
        { name: "Panera Bread", item: "Bacon Turkey Bravo" },
        { name: "Quiznos", item: "Classic Italian" },
        { name: "Potbelly", item: "A Wreck Sandwich" },
        { name: "Schlotzsky's", item: "The Original" },
        { name: "Jason's Deli", item: "Muffaletta" },
        { name: "McAlister's Deli", item: "McAlister's Club" },
        { name: "Arby's", item: "Classic Roast Beef" },
        { name: "Penn Station", item: "Philly Cheesesteak" },
        { name: "Which Wich", item: "The Wicked" }
    ],
    "coffee": [
        { name: "Starbucks", item: "Caramel Macchiato" },
        { name: "Dunkin'", item: "Iced Coffee with Hazelnut" },
        { name: "Peet's Coffee", item: "Major Dickason's Blend" },
        { name: "Dutch Bros", item: "Golden Eagle" },
        { name: "Caribou Coffee", item: "Campfire Mocha" },
        { name: "Tim Hortons", item: "Iced Capp" },
        { name: "The Coffee Bean", item: "Ice Blended Drink" },
        { name: "Biggby Coffee", item: "Caramel Marvel" },
        { name: "Scooter's Coffee", item: "Caramelicious" },
        { name: "Philz Coffee", item: "Mint Mojito Iced Coffee" }
    ],
    "ice cream": [
        { name: "Baskin-Robbins", item: "Mint Chocolate Chip" },
        { name: "Dairy Queen", item: "Oreo Blizzard" },
        { name: "Cold Stone Creamery", item: "Founder's Favorite" },
        { name: "Ben & Jerry's", item: "Half Baked" },
        { name: "Haagen-Dazs", item: "Dulce de Leche Dazzler" },
        { name: "Rita's", item: "Mango Gelati" },
        { name: "Culver's", item: "Turtle Sundae" },
        { name: "Braum's", item: "Premium Ice Cream Cone" },
        { name: "Bruster's", item: "Waffle Cone" },
        { name: "Marble Slab", item: "Sweet Cream with Mix-ins" }
    ],
    "donuts": [
        { name: "Dunkin'", item: "Boston Kreme Donut" },
        { name: "Krispy Kreme", item: "Original Glazed" },
        { name: "Tim Hortons", item: "Timbits" },
        { name: "Shipley Do-Nuts", item: "Glazed Do-Nut" },
        { name: "Voodoo Doughnut", item: "Bacon Maple Bar" },
        { name: "Duck Donuts", item: "Bacon in the Sun" },
        { name: "Stan's Donuts", item: "Biscoff Banana Pocket" }
    ],
    "breakfast": [
        { name: "IHOP", item: "Rooty Tooty Fresh 'N Fruity" },
        { name: "Denny's", item: "Grand Slam" },
        { name: "Waffle House", item: "All-Star Special" },
        { name: "Cracker Barrel", item: "Momma's Pancake Breakfast" },
        { name: "First Watch", item: "Million Dollar Bacon" },
        { name: "Bob Evans", item: "Farmer's Choice" },
        { name: "Village Inn", item: "Lumberjack Breakfast" },
        { name: "Perkins", item: "Tremendous Twelve" },
        { name: "Snooze", item: "Pineapple Upside Down Pancakes" },
        { name: "The Original Pancake House", item: "Apple Pancake" }
    ],
    "asian": [
        { name: "Panda Express", item: "Orange Chicken with Chow Mein" },
        { name: "P.F. Chang's", item: "Lettuce Wraps" },
        { name: "Pei Wei", item: "Kung Pao Chicken" },
        { name: "Yoshinoya", item: "Gyudon Beef Bowl" },
        { name: "Sarku Japan", item: "Chicken Teriyaki" },
        { name: "Genghis Grill", item: "Build Your Own Bowl" },
        { name: "Kona Grill", item: "Macadamia Nut Chicken" },
        { name: "Benihana", item: "Hibachi Steak" },
        { name: "Sushi-San", item: "Spicy Tuna Roll" },
        { name: "Nobu", item: "Black Cod Miso" }
    ],
    "seafood": [
        { name: "Red Lobster", item: "Cheddar Bay Biscuits & Shrimp" },
        { name: "Long John Silver's", item: "Fish & Chicken Platter" },
        { name: "Captain D's", item: "Deluxe Seafood Platter" },
        { name: "Bonefish Grill", item: "Bang Bang Shrimp" },
        { name: "Joe's Crab Shack", item: "Crab Bucket" },
        { name: "Bubba Gump Shrimp", item: "Dumb Luck Coconut Shrimp" },
        { name: "McCormick & Schmick's", item: "Fresh Catch" },
        { name: "Legal Sea Foods", item: "New England Clam Chowder" }
    ],
    "steakhouse": [
        { name: "Outback Steakhouse", item: "Bloomin' Onion & Sirloin" },
        { name: "Texas Roadhouse", item: "Bone-In Ribeye with Rolls" },
        { name: "LongHorn Steakhouse", item: "Flo's Filet" },
        { name: "Ruth's Chris", item: "Petite Filet" },
        { name: "Capital Grille", item: "Dry Aged NY Strip" },
        { name: "Fogo de Chao", item: "Full Churrasco Experience" },
        { name: "Black Angus", item: "Campfire Feast" },
        { name: "Morton's", item: "Center-Cut Filet Mignon" },
        { name: "Saltgrass", item: "Pat's Ribeye" },
        { name: "Fleming's", item: "Prime Tomahawk" }
    ],
    "italian": [
        { name: "Olive Garden", item: "Tour of Italy" },
        { name: "Carrabba's", item: "Chicken Bryan" },
        { name: "Maggiano's", item: "Rigatoni D" },
        { name: "Macaroni Grill", item: "Penne Rustica" },
        { name: "Fazoli's", item: "Baked Ziti" },
        { name: "Buca di Beppo", item: "Spaghetti with Meatballs" },
        { name: "Old Spaghetti Factory", item: "Mizithra Cheese & Browned Butter" },
        { name: "Carbone", item: "Spicy Rigatoni Vodka" }
    ]
};

const ALL_FOOD_SUGGESTIONS = [];

Object.keys(LOCAL_FOOD_DB).forEach(cat => {
    ALL_FOOD_SUGGESTIONS.push(`Order ${cat}`);
});

Object.values(LOCAL_FOOD_DB).flat().forEach(b => {
    ALL_FOOD_SUGGESTIONS.push(`Order from ${b.name}`);
    ALL_FOOD_SUGGESTIONS.push(`Order ${b.item.toLowerCase()} from ${b.name}`);
});

// ==========================================
// 2. DOM & STATE
// ==========================================
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const authTitle = document.getElementById('auth-title');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const googleSigninBtn = document.getElementById('google-signin-btn');
const authToggle = document.getElementById('auth-toggle');
const authError = document.getElementById('auth-error');
const logoutActionBtn = document.getElementById('logout-action-btn');

const hubInput = document.getElementById('hub-input');
const datalist = document.getElementById('hub-suggestions');
const executeActionBtn = document.getElementById('execute-action-btn');
const output = document.getElementById('weather-output');
const routingWarning = document.getElementById('routing-warning');

const helpToggle = document.getElementById('help-toggle');
const helpGuide = document.getElementById('help-guide');
const changelogToggle = document.getElementById('changelog-toggle');
const changelogDrawer = document.getElementById('changelog-drawer');
const historyToggle = document.getElementById('history-toggle');
const historyDrawer = document.getElementById('history-drawer');
const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat-btn');

const prefsToggleBtn = document.getElementById('prefs-toggle-btn');
const prefsDrawer = document.getElementById('prefs-drawer');
const prefsCloseBtn = document.getElementById('prefs-close-btn');
const prefsInstructionsInput = document.getElementById('prefs-instructions-input');
const prefsApiKeyInput = document.getElementById('prefs-api-key-input');
const apiKeyNote = document.getElementById('api-key-note');
const prefsSaveBtn = document.getElementById('prefs-save-btn');

const micBtn = document.getElementById('mic-trigger-btn');
const ttsBtn = document.getElementById('tts-trigger-btn');
const cameraTriggerBtn = document.getElementById('camera-trigger-btn');
const imageFileInput = document.getElementById('image-file-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreviewThumbnail = document.getElementById('image-preview-thumbnail');
const imagePreviewFilename = document.getElementById('image-preview-filename');
const imageClearBtn = document.getElementById('image-clear-btn');

let debounceTimer;
let searchAbortController = null;
let activeImageBase64 = null; 
let activeImageMimeType = null;
let autoSpeak = false;

let chatHistory = [];
let currentSessionId = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const welcomeVaiiText = `Welcome to VAII Native! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto ticker, map request, or art prompt to begin...`;
const welcomeGeminiText = `Welcome to the Gemini Ecosystem! This is a persistent conversational space. Start typing below to begin a continuous chat thread...`;

const defaultAssistantSuggestions = [
    "Open Gemini", 
    "Convert 100 USD to EUR",
    "QR https://vaii-two.vercel.app",
    "ISS",
    "Sunset Tokyo",
    "Zip 90210",
    "Duck",
    "University Harvard",
    "Space",
    "Advice",
    "Age Logan",
    "Define serendipity",
    "Dog", 
    "Cat", 
    "Country Japan", 
    "Country Canada", 
    "Drink Margarita", 
    "My IP",
    "Trivia", 
    "Free Games", 
    "Joke",
    "Song Bohemian Rhapsody", 
    "Pokemon Charizard", 
    "Anime Attack on Titan", 
    "Manga Berserk", 
    "Book The Hobbit",
    "Davenport, Florida", 
    "Florida, United States", 
    "Draw a neon cyberpunk switch console artwork"
];

window.initVaiiMap = function() {
    console.log("Maps system ready.");
};

// ==========================================
// 3. UTILS & RENDERERS
// ==========================================
function closeAllDrawers() {
    const drawers = [helpGuide, changelogDrawer, historyDrawer, prefsDrawer];
    drawers.forEach(d => { 
        if (d) d.style.display = "none";
    });
}

function renderMarkdown(text) {
    if (!text) return "";
    let safeHtml = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
    safeHtml = safeHtml.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safeHtml = safeHtml.replace(/\*(.*?)\*/g, "<em>$1</em>");
    safeHtml = safeHtml.replace(/^[\s]*[\*\-]\s+(.*)$/gm, "<li style='margin-left: 15px; margin-bottom: 4px;'>$1</li>");
    safeHtml = safeHtml.replace(/\n/g, "<br>");
    return safeHtml;
}

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function decodeHTMLEntities(text) {
    let textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

function cleanWiktionaryDefinition(rawHtml) {
    if (!rawHtml) return "";
    let tmp = document.createElement("DIV");
    tmp.innerHTML = rawHtml;
    tmp.querySelectorAll('style, script, .mw-parser-output, .defdate').forEach(el => el.remove());
    let clean = tmp.textContent || tmp.innerText || "";
    clean = clean.replace(/\.[a-zA-Z0-9_-]+\s*\{[^}]*\}/g, '').trim();
    return clean;
}

function speakText(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

function updateWelcomeMessageText() {
    if (!output) return;
    const selectedMode = document.querySelector('input[name="vaii-mode"]:checked')?.value;
    output.innerHTML = (selectedMode === "gemini") ? welcomeGeminiText : welcomeVaiiText;
    if (ttsBtn) ttsBtn.style.display = 'none';
}

function getSavedSessions() {
    try {
        return JSON.parse(localStorage.getItem('vaii_chat_sessions')) || [];
    } catch (e) {
        return [];
    }
}

function saveSessionsToDisk(sessions) {
    localStorage.setItem('vaii_chat_sessions', JSON.stringify(sessions));
}

function saveCurrentSessionState(customGeneratedTitle = null) {
    if (chatHistory.length <= 2) return; 
    let sessions = getSavedSessions();
    let currentSession = sessions.find(s => s.id === currentSessionId);
    
    if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now();
        let fallbackTitle = "Gemini Chat Thread";
        if (chatHistory[2] && chatHistory[2].role === 'user') {
            fallbackTitle = chatHistory[2].parts[0].text.substring(0, 25) + "...";
        }
        currentSession = { 
            id: currentSessionId, 
            title: customGeneratedTitle || fallbackTitle, 
            history: chatHistory 
        };
        sessions.unshift(currentSession);
    } else if (currentSession) {
        currentSession.history = chatHistory;
        if (customGeneratedTitle) {
            currentSession.title = customGeneratedTitle;
        }
    }
    saveSessionsToDisk(sessions);
    renderHistoryListItems();
}

function renderHistoryListItems() {
    if (!historyList) return;
    historyList.innerHTML = "";
    let sessions = getSavedSessions();
    
    if (sessions.length === 0) {
        historyList.innerHTML = `<div style="color: #666; font-size: 0.8rem; font-style: italic; text-align: center; padding: 8px 0;">No saved conversational tracks.</div>`;
        return;
    }
    
    sessions.forEach(session => {
        const row = document.createElement('div');
        row.style = "display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; border: 1px solid #2d2d2d; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.15s ease; margin-bottom: 4px;";
        row.onmouseenter = () => row.style.background = "#222";
        row.onmouseleave = () => row.style.background = "#1a1a1a";
        
        const textWrapper = document.createElement('span');
        textWrapper.innerText = session.title;
        textWrapper.style = "flex: 1; font-size: 0.82rem; color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; margin-right: 8px;";
        
        textWrapper.addEventListener('click', () => {
            currentSessionId = session.id;
            chatHistory = session.history;
            renderFullChatLogBubble();
            const modeToggleInput = document.querySelector('input[name="vaii-mode"][value="gemini"]');
            if (modeToggleInput) modeToggleInput.checked = true;
            if (historyDrawer) historyDrawer.style.display = "none";
            if (historyToggle) historyToggle.innerText = "📜";
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.innerText = "🗑️";
        deleteButton.style = "background: none; border: none; color: #dc3545; cursor: pointer; padding: 2px 6px; font-size: 0.85rem; transition: opacity 0.15s;";
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            let updatedList = getSavedSessions().filter(s => s.id !== session.id);
            saveSessionsToDisk(updatedList);
            if (currentSessionId === session.id) {
                initializeFreshChatSession();
            }
            renderHistoryListItems();
        });
        
        row.appendChild(textWrapper);
        row.appendChild(deleteButton);
        historyList.appendChild(row);
    });
}

function initializeFreshChatSession() {
    currentSessionId = null;
    chatHistory = [];
    updateWelcomeMessageText(); 
}

function renderFullChatLogBubble() {
    if (!output) return;
    output.innerHTML = "";
    
    let dialogueItems = chatHistory.filter(msg => {
        let textStr = msg.parts[0].text;
        return !textStr.includes("proprietary features belong exclusively") && !textStr.includes("System connection established");
    });
    
    if (dialogueItems.length === 0) {
        output.innerHTML = welcomeGeminiText;
        if (ttsBtn) ttsBtn.style.display = 'none';
        return;
    }
    
    if (ttsBtn) ttsBtn.style.display = 'flex';
    
    dialogueItems.forEach(msg => {
        const isUserTurn = (msg.role === 'user');
        const bubble = document.createElement('div');
        bubble.style = isUserTurn 
            ? "background: #2a2a2a; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left; margin-bottom: 10px;"
            : "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left; margin-bottom: 10px;";
            
        let footerMetadataLabel = (!isUserTurn && msg.activeModelName) 
            ? `<div style="font-size: 0.68rem; color: #555; border-top: 1px solid #222; margin-top: 8px; padding-top: 4px; font-style: italic;">Running on this model: "${msg.activeModelName}"</div>` 
            : "";

        bubble.innerHTML = `
            <div style="font-size: 0.72rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">
                ${isUserTurn ? '👤 You' : '✨ Gemini Ecosystem'}
            </div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">${renderMarkdown(msg.parts[0].text)}</div>
            ${footerMetadataLabel}
        `;
        output.appendChild(bubble);
    });
    output.scrollTop = output.scrollHeight;
}

function updateDatalist(cities = [], wikiTitles = [], wikitubiaTitles = [], combinedSuggestions = []) {
    if (!datalist) return;
    datalist.innerHTML = "";
    
    combinedSuggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });

    defaultAssistantSuggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });

    wikiTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });

    wikitubiaTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });

    cities.forEach(location => {
        const option = document.createElement('option');
        let parts = [];
        if (location.name) parts.push(location.name);
        if (location.admin1 && !parts.includes(location.admin1)) parts.push(location.admin1);
        if (location.country && !parts.includes(location.country)) parts.push(location.country);

        option.value = parts.join(', ');
        option.setAttribute('data-lat', location.latitude);
        option.setAttribute('data-lon', location.longitude);
        option.setAttribute('data-tz', location.timezone || 'UTC');
        datalist.appendChild(option);
    });
}

function handleVaiiDataOutput(rawTextContent, defaultHtmlOutput, runMapCallback = null) {
    output.setAttribute('data-spoken', rawTextContent || "");
    output.innerHTML = defaultHtmlOutput;
    
    if (runMapCallback) runMapCallback();
    if (ttsBtn) ttsBtn.style.display = 'flex';
    
    if (autoSpeak) {
        let spokenData = rawTextContent || stripHtml(defaultHtmlOutput)
            .replace(/[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .replace(/Assistant:|👤 You|✨ Gemini Ecosystem/gi, '')
            .trim();
        speakText(spokenData);
        autoSpeak = false; 
    }
}

function showAuthError(err) {
    console.error("Firebase Auth Exception:", err); 
    if (authError) {
        let errorText = "Authentication failed. Please try again.";
        if (typeof err === "string") {
            errorText = err;
        } else if (err && err.message) {
            errorText = err.message;
        }
        
        authError.innerText = errorText.replace("Firebase: ", "").replace(" (auth/invalid-credential).", ".");
        authError.style.display = "block";
    }
}

function clearActiveImage() {
    activeImageBase64 = null;
    activeImageMimeType = null;
    if (imageFileInput) imageFileInput.value = "";
    if (imagePreviewThumbnail) imagePreviewThumbnail.src = "";
    if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
    if (cameraTriggerBtn) cameraTriggerBtn.classList.remove('active');
}

function renderNotesManager() {
    let notes = JSON.parse(localStorage.getItem('vaii_notes') || '[]');
    if (notes.length === 0) {
        handleVaiiDataOutput("No notes saved. Use the note command to add one.", `<div style="background: #1a1a1a; padding: 14px; border-left: 3px solid #ffc107; text-align: left; border-radius: 8px;">📝 No notes saved. Use <code>note: [text]</code> to add one.</div>`);
        return;
    }
    
    let html = `
        <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ffc107; text-align: left;">
            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">📝 My Notes</div>
            <div style="display: flex; flex-direction: column; gap: 8px;" id="notes-container"></div>
        </div>
    `;
    
    handleVaiiDataOutput("Here are your saved notes.", html, () => {
        const container = document.getElementById('notes-container');
        notes.forEach((note, index) => {
            const div = document.createElement('div');
            div.style = "display: flex; justify-content: space-between; background: #252525; padding: 8px 12px; border-radius: 6px;";
            div.innerHTML = `<span style="font-size: 0.9rem;">${note}</span> <button data-index="${index}" class="delete-note-btn" style="background:none; border:none; color:#dc3545; cursor:pointer;">✕</button>`;
            container.appendChild(div);
        });

        document.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let idx = e.target.getAttribute('data-index');
                notes.splice(idx, 1);
                localStorage.setItem('vaii_notes', JSON.stringify(notes));
                renderNotesManager();
            });
        });
    });
}

function fetchNewsAPI(topic) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching live news...</div>`;
    
    let cleanTopic = topic ? topic.trim() : "";
    let targetUrl = "";

    if (cleanTopic) {
        targetUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(cleanTopic)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
    } else {
        targetUrl = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
    }
        
    const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
                    
    fetch(proxiedUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.errors) {
                let errorMsg = Array.isArray(data.errors) ? data.errors[0] : (typeof data.errors === 'string' ? data.errors : "Unknown GNews error");
                return handleVaiiDataOutput("G News API Error: " + errorMsg, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;"><strong style="color:#ff4d4d;">GNews API Error:</strong> ${errorMsg}</div>`);
            }
            if (!data.articles || data.articles.length === 0) {
                return handleVaiiDataOutput("No articles found for this search.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No articles found for "${cleanTopic || 'general top news'}". Try a broader keyword like <code>technology</code> or <code>gaming</code>.</div>`);
            }
            
            let html = `<div style="text-align: left; margin-bottom: 10px; font-weight: bold; color: #aaa; text-transform: uppercase;">📰 Live News ${cleanTopic ? 'on ' + cleanTopic : 'Headlines'}</div>`;
            data.articles.slice(0, 3).forEach(art => {
                html += `
                    <a href="${art.url}" target="_blank" style="display: block; background: #1a1a1a; padding: 12px; border-left: 3px solid #17a2b8; text-decoration: none; color: #fff; margin-bottom: 10px; border-radius: 8px;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${art.title}</div>
                        <div style="font-size: 0.8rem; color: #888;">${art.source ? art.source.name : 'GNews'}</div>
                    </a>
                `;
            });
            handleVaiiDataOutput("Here are the latest news headlines.", html);
        })
        .catch(err => {
            console.error("News fetch error:", err);
            handleVaiiDataOutput("News routing failed. Network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">News routing failed. Network error or API key limit reached.</div>`);
        });
}

function fetchOMDBMedia(title) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying media database...</div>`;
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "False") return handleVaiiDataOutput(data.Error, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">${data.Error}</div>`);
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #e50914; text-align: left; display: flex; gap: 15px;">
                    ${data.Poster !== "N/A" ? `<img src="${data.Poster}" style="width: 90px; border-radius: 6px; object-fit: cover;">` : ''}
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 4px;">🎬 ${data.Title} (${data.Year})</div>
                        <div style="color: #ffc107; font-size: 0.85rem; margin-bottom: 8px;">⭐ IMDB: ${data.imdbRating} | ${data.Genre}</div>
                        <div style="color: #ccc; font-size: 0.9rem; line-height: 1.4;">${data.Plot}</div>
                    </div>
                </div>
            `;
            handleVaiiDataOutput("I found " + data.Title + " from " + data.Year + ". " + data.Plot, html);
        }).catch(() => handleVaiiDataOutput("OMDB routing failed. Network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">OMDB routing failed. Network error.</div>`));
}

// ==========================================
// 5. LOCATION, MAPS & SOLAR CLIMATE CARD
// ==========================================
function resolveAndRenderLocation(searchLocationQuery, greetingHTML = "") {
    output.innerHTML = greetingHTML + `<div class="generation-status"><div class="loader-spinner"></div> Locating coordinates for "${searchLocationQuery}"...</div>`;
    let baseQuery = searchLocationQuery.split(',')[0].trim();

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(baseQuery)}&count=5&language=en&format=json`)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                let bestLoc = data.results[0];
                if (searchLocationQuery.includes(",")) {
                    const secondary = searchLocationQuery.split(',')[1].toLowerCase().trim();
                    const matched = data.results.find(l => 
                        (l.admin1 && l.admin1.toLowerCase().includes(secondary)) || 
                        (l.country && l.country.toLowerCase().includes(secondary))
                    );
                    if (matched) bestLoc = matched;
                }

                let displayName = `${bestLoc.name}`;
                if (bestLoc.admin1 && bestLoc.admin1 !== bestLoc.name) displayName += `, ${bestLoc.admin1}`;
                if (bestLoc.country) displayName += ` (${bestLoc.country})`;

                renderUnifiedLocationCard(bestLoc.latitude, bestLoc.longitude, bestLoc.timezone || 'auto', displayName, greetingHTML);
            } else {
                handleVaiiDataOutput("Could not extract metrics for " + searchLocationQuery, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Could not extract location metrics for "${searchLocationQuery}".</div>`);
            }
        })
        .catch(err => {
            console.error("Open-Meteo Geocoding Error:", err);
            handleVaiiDataOutput("Location processing engine connection failure.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Location processing engine connection failure.</div>`);
        });
}

function renderUnifiedLocationCard(lat, lon, zone, displayName, greetingHTML = "") {
    output.innerHTML = greetingHTML + `<div class="generation-status"><div class="loader-spinner"></div> Loading telemetry for "${displayName}"...</div>`;
    
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`;

    fetch(weatherUrl)
        .then(res => res.json())
        .then(weatherData => {
            if (!weatherData || !weatherData.current_weather) {
                throw new Error("Missing weather metrics");
            }

            const tempCelsius = weatherData.current_weather.temperature;
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            const windSpeed = weatherData.current_weather.windspeed;
            
            let effectiveTz = weatherData.timezone;
            if (!effectiveTz || effectiveTz === 'auto') {
                effectiveTz = (zone && zone !== 'auto') ? zone : null;
            }

            let timeString = "N/A";
            let dateString = "N/A";
            try {
                const timeOpts = { hour: '2-digit', minute: '2-digit' };
                const dateOpts = { weekday: 'long', month: 'short', day: 'numeric' };
                if (effectiveTz) {
                    timeOpts.timeZone = effectiveTz;
                    dateOpts.timeZone = effectiveTz;
                }
                timeString = new Date().toLocaleTimeString("en-US", timeOpts);
                dateString = new Date().toLocaleDateString("en-US", dateOpts);
            } catch(e) {
                timeString = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
                dateString = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
            }

            let solarHtml = "";
            if (weatherData.daily && weatherData.daily.sunrise && weatherData.daily.sunset) {
                try {
                    const rawSunrise = weatherData.daily.sunrise[0];
                    const rawSunset = weatherData.daily.sunset[0];

                    const fmtSolar = (dtString) => {
                        if (!dtString) return "N/A";
                        const d = new Date(dtString);
                        const opts = { hour: '2-digit', minute: '2-digit' };
                        if (effectiveTz) opts.timeZone = effectiveTz;
                        return d.toLocaleTimeString("en-US", opts);
                    };

                    const sunriseTime = fmtSolar(rawSunrise);
                    const sunsetTime = fmtSolar(rawSunset);

                    const d1 = new Date(rawSunrise);
                    const d2 = new Date(rawSunset);
                    const diffHours = ((d2 - d1) / (1000 * 60 * 60)).toFixed(1);

                    solarHtml = `
                        <div style="background: linear-gradient(135deg, #2b1700 0%, #1e1e1e 100%); border: 1px solid #ff9800; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
                            <div style="font-size: 0.75rem; color: #ffb74d; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">☀️ Solar & Daylight Telemetry</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.82rem; color: #ddd;">
                                <div>🌅 <strong>Sunrise:</strong> ${sunriseTime}</div>
                                <div>🌇 <strong>Sunset:</strong> ${sunsetTime}</div>
                                <div>⏱️ <strong>Daylight:</strong> ${diffHours > 0 ? diffHours + ' hrs' : 'N/A'}</div>
                                <div>🌐 <strong>Zone:</strong> ${effectiveTz || 'UTC'}</div>
                            </div>
                        </div>
                    `;
                } catch(e) {}
            }
            
            const htmlOutput = greetingHTML + `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #4da3ff; text-align: left; margin-bottom: 15px;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 12px;">📍 ${displayName}</div>
                    <div style="display: flex; gap: 20px; margin-bottom: 15px; border-bottom: 1px solid #2a2a2a; padding-bottom: 12px;">
                        <div style="flex: 1;">
                            <span style="color: #888; font-size: 0.8rem; text-transform: uppercase;">Current Climate</span><br>
                            <span style="font-size: 1.1rem; font-weight: bold; color: #28a745;">🌡️ ${tempFahrenheit}°F</span> <span style="color:#666; font-size:0.9rem;">(${tempCelsius}°C)</span><br>
                            <span style="color: #ccc; font-size: 0.85rem;">💨 Wind: ${windSpeed} km/h</span>
                        </div>
                        <div style="flex: 1; border-left: 1px solid #2a2a2a; padding-left: 15px;">
                            <span style="color: #888; font-size: 0.8rem; text-transform: uppercase;">Localized Clock</span><br>
                            <span style="font-size: 1.1rem; font-weight: bold; color: #ffc107;">🕒 ${timeString}</span><br>
                            <span style="color: #ccc; font-size: 0.85rem;">📅 ${dateString}</span>
                        </div>
                    </div>
                    ${solarHtml}
                    <span style="color: #888; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 6px;">Interactive Mapping</span>
                    <div id="vaii-merged-map-canvas" style="width:100%; height:220px; border-radius:8px; background:#252525; border: 1px solid #333;"></div>
                </div>
            `;
            
            handleVaiiDataOutput(`Location data for ${displayName}. It is currently ${tempFahrenheit} degrees Fahrenheit.`, htmlOutput, () => {
                if (typeof google !== 'undefined' && google.maps) {
                    const mapCoordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
                    const loadedMapInstance = new google.maps.Map(document.getElementById('vaii-merged-map-canvas'), {
                        center: mapCoordinates, zoom: 12, disableDefaultUI: false,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                        ]
                    });
                    new google.maps.Marker({ position: mapCoordinates, map: loadedMapInstance, title: displayName });
                }
            });
        })
        .catch(err => {
            console.error("Open-Meteo Weather Error:", err);
            handleVaiiDataOutput("Error pulling metrics for spatial location.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Error pulling metrics for spatial location.</div>`);
        });
}

// ==========================================
// 6. UTILITIES (FOREX, QR, ISS, DUCK, COLLEGE, POSTAL, ETC.)
// ==========================================
const CURRENCY_SYMBOL_MAP = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY'
};

const VALID_ISO_CURRENCIES = new Set([
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'HKD', 'NZD',
    'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL',
    'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP',
    'AED', 'COP', 'SAR', 'MYR', 'RON', 'VND', 'ARS', 'IQD'
]);

function normalizeCurrencyCode(token) {
    if (!token) return 'USD';
    const clean = token.toUpperCase().trim();
    return CURRENCY_SYMBOL_MAP[clean] || clean;
}

function fetchForexConversion(amount, fromCurr, toCurr) {
    const from = normalizeCurrencyCode(fromCurr);
    const to = normalizeCurrencyCode(toCurr);
    const num = parseFloat(amount) || 1;

    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Converting ${num} ${from} to ${to}...</div>`;

    if (from === to) {
        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #28a745; text-align: left;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">💱 Currency Conversion</div>
                <div style="font-size: 1.3rem; font-weight: bold; color: #fff;">${num} ${from} = ${num} ${to}</div>
            </div>
        `;
        return handleVaiiDataOutput(`${num} ${from} equals ${num} ${to}`, html);
    }

    const url = `https://api.frankfurter.app/latest?amount=${num}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            const convertedTotal = data?.rates?.[to];
            if (convertedTotal === undefined) throw new Error("Rate not found");

            const singleRate = (convertedTotal / num).toFixed(4);

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #28a745; text-align: left;">
                    <div style="font-size: 0.75rem; color: #28a745; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">💱 Live European Central Bank Forex</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #fff;">${num} ${from} = <span style="color: #28a745;">${Number(convertedTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}</span></div>
                    <div style="font-size: 0.82rem; color: #888; margin-top: 6px;">Exchange Rate: 1 ${from} = ${singleRate} ${to} (Date: ${data.date})</div>
                </div>
            `;
            handleVaiiDataOutput(`${num} ${from} is equal to ${convertedTotal} ${to}`, html);
        })
        .catch(() => {
            fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`)
                .then(r => r.json())
                .then(erData => {
                    const rate = erData?.rates?.[to];
                    if (!rate) throw new Error("ER rate not found");
                    const total = (num * rate).toFixed(2);

                    const html = `
                        <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #28a745; text-align: left;">
                            <div style="font-size: 0.75rem; color: #28a745; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">💱 Live Forex Exchange</div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: #fff;">${num} ${from} = <span style="color: #28a745;">${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}</span></div>
                            <div style="font-size: 0.82rem; color: #888; margin-top: 6px;">Exchange Rate: 1 ${from} = ${rate.toFixed(4)} ${to}</div>
                        </div>
                    `;
                    handleVaiiDataOutput(`${num} ${from} is equal to ${total} ${to}`, html);
                })
                .catch(() => {
                    handleVaiiDataOutput(`Could not convert from ${from} to ${to}.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Currency conversion failed. Verify currency codes (e.g. USD, EUR, GBP, JPY).</div>`);
                });
        });
}

function generateQRCode(textData) {
    const cleanData = textData.trim();
    if (!cleanData) return;

    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Rendering dynamic QR code...</div>`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(cleanData)}`;

    const html = `
        <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #00bcd4; text-align: center;">
            <div style="font-size: 0.75rem; color: #00bcd4; text-transform: uppercase; font-weight: bold; margin-bottom: 10px; text-align: left;">📱 Dynamic QR Code</div>
            <div style="background: #fff; padding: 10px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <img src="${qrImageUrl}" style="width: 180px; height: 180px; display: block;" alt="QR Code">
            </div>
            <div style="font-size: 0.82rem; color: #aaa; margin-top: 10px; word-break: break-all; text-align: left;"><strong>Payload:</strong> ${cleanData}</div>
            <a href="${qrImageUrl}" download="qrcode.png" target="_blank" style="display: block; margin-top: 12px; background: #00bcd4; color: #121212; font-weight: bold; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 0.85rem;">Download QR Image ➔</a>
        </div>
    `;
    handleVaiiDataOutput("Dynamic QR Code generated.", html);
}

function fetchISSTelemetry() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Locking International Space Station orbital telemetry...</div>`;
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
        .then(res => res.json())
        .then(data => {
            if (!data.latitude || !data.longitude) throw new Error("ISS error");
            const lat = parseFloat(data.latitude).toFixed(4);
            const lon = parseFloat(data.longitude).toFixed(4);
            const velocity = Math.round(data.velocity).toLocaleString();
            const altitude = parseFloat(data.altitude).toFixed(1);
            const visibility = data.visibility ? data.visibility.toUpperCase() : "ORBITING";

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #00e676; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-size: 0.75rem; color: #00e676; text-transform: uppercase; font-weight: bold;">🛰️ International Space Station (NORAD #25544)</div>
                        <span style="background: #252525; border: 1px solid #333; color: #ffc107; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${visibility}</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 12px;">Live Orbit Coordinates</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid #2a2a2a; padding-top: 10px; font-size: 0.88rem; color: #ccc;">
                        <div><strong>🌐 Latitude:</strong> ${lat}°</div>
                        <div><strong>🌐 Longitude:</strong> ${lon}°</div>
                        <div><strong>🚀 Velocity:</strong> ${velocity} km/h</div>
                        <div><strong>📐 Altitude:</strong> ${altitude} km</div>
                    </div>
                    <div id="vaii-iss-map-canvas" style="width:100%; height:200px; border-radius:8px; background:#252525; border: 1px solid #333; margin-top: 12px;"></div>
                </div>
            `;

            handleVaiiDataOutput(`The International Space Station is at latitude ${lat}, longitude ${lon}, traveling at ${velocity} kilometers per hour.`, html, () => {
                if (typeof google !== 'undefined' && google.maps) {
                    const issPos = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
                    const issMap = new google.maps.Map(document.getElementById('vaii-iss-map-canvas'), {
                        center: issPos, 
                        zoom: 3, 
                        disableDefaultUI: false,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                        ]
                    });
                    new google.maps.Marker({ position: issPos, map: issMap, title: "ISS Current Position" });
                }
            });
        })
        .catch(() => handleVaiiDataOutput("ISS Telemetry unreachable.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Could not establish link with ISS telemetry feed.</div>`));
}

function fetchRandomDuck() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Loading cute duck...</div>`;

    const duckPool = [
        "https://images.unsplash.com/photo-1555852095-64e7428df0fa?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1459682687441-7761439a709d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1598439210625-5067c578f3f6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1563889362352-b0492c224f61?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1618233421255-09a25b1f02c4?auto=format&fit=crop&w=800&q=80"
    ];

    const randomDuck = duckPool[Math.floor(Math.random() * duckPool.length)];
    const html = `
        <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ffeb3b; text-align: left;">
            <div style="font-size: 0.85rem; font-weight: bold; color: #ffeb3b; margin-bottom: 8px;">🦆 Random Duck</div>
            <img src="${randomDuck}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; border: 1px solid #333;" alt="Random Duck">
        </div>
    `;

    handleVaiiDataOutput("Quack! Here is a cute duck for you.", html);
}

function fetchPostalCodeInfo(zipCode) {
    const cleanZip = zipCode.replace(/[^0-9a-zA-Z]/g, '').trim();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Geocoding postal code "${cleanZip}"...</div>`;

    fetch(`https://api.zippopotam.us/us/${encodeURIComponent(cleanZip)}`)
        .then(res => {
            if (!res.ok) throw new Error("Zip code not found");
            return res.json();
        })
        .then(data => {
            const place = data.places?.[0] || {};
            const placeName = place['place name'] || 'Unknown Area';
            const state = place['state'] || 'N/A';
            const stateAbbr = place['state abbreviation'] || '';
            const lat = place['latitude'] || '0';
            const lon = place['longitude'] || '0';

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #00bcd4; text-align: left;">
                    <div style="font-size: 0.75rem; color: #00bcd4; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">📮 Postal Code Geocoder</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #fff;">${placeName}, ${state} (${stateAbbr})</div>
                    <div style="font-size: 0.85rem; color: #aaa; margin-top: 2px;">Postal Index: <strong>${data['post code']}</strong> • Country: ${data.country} (${data['country abbreviation']})</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid #2a2a2a; padding-top: 10px; margin-top: 10px; font-size: 0.85rem; color: #ccc;">
                        <div><strong>🌐 Latitude:</strong> ${lat}</div>
                        <div><strong>🌐 Longitude:</strong> ${lon}</div>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`Postal code ${data['post code']} matches ${placeName}, ${state}.`, html);
        })
        .catch(() => handleVaiiDataOutput(`Postal code "${cleanZip}" not found.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">US Postal code "${cleanZip}" not found. Verify digits and try again.</div>`));
}

function fetchUniversityDirectory(collegeName) {
    const cleanCollege = collegeName.trim();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying university registry for "${cleanCollege}"...</div>`;

    const renderCollegeCard = (name, country, state, webPage, domain) => {
        const stateStr = state ? `, ${state}` : '';
        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #673ab7; text-align: left;">
                <div style="font-size: 0.75rem; color: #b388ff; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🎓 Higher Education Directory</div>
                <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 4px;">${name}</div>
                <div style="font-size: 0.85rem; color: #aaa;">📍 ${country}${stateStr} • Domain: <code>${domain || 'N/A'}</code></div>
                ${webPage ? `<a href="${webPage}" target="_blank" style="display: inline-block; margin-top: 10px; background: #673ab7; color: #fff; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: bold;">Visit Campus Portal ↗</a>` : ''}
            </div>
        `;
        handleVaiiDataOutput(`Found ${name} located in ${country}.`, html);
    };

    const targetUrl = `http://universities.hipolabs.com/search?name=${encodeURIComponent(cleanCollege)}`;

    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`)
        .then(res => {
            if (!res.ok) throw new Error("Proxy error");
            return res.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) throw new Error("No entries");
            const college = data[0];
            renderCollegeCard(
                college.name, 
                college.country, 
                college['state-province'], 
                college.web_pages?.[0], 
                college.domains?.[0]
            );
        })
        .catch(() => {
            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanCollege.replace(/ /g, '_'))}`)
                .then(r => r.json())
                .then(wikiData => {
                    if (!wikiData.title || wikiData.type === "disambiguation") {
                        return handleVaiiDataOutput(`No university found matching "${cleanCollege}".`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No university records found matching "${cleanCollege}". Check your spelling and try again.</div>`);
                    }
                    renderCollegeCard(
                        wikiData.title, 
                        "Worldwide", 
                        null, 
                        wikiData.content_urls?.desktop?.page || '#', 
                        wikiData.title.toLowerCase().replace(/[^a-z]/g, '') + ".edu"
                    );
                })
                .catch(() => {
                    handleVaiiDataOutput(`No university found matching "${cleanCollege}".`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No university records found matching "${cleanCollege}".</div>`);
                });
        });
}

function fetchNasaAPOD() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Transmitting NASA deep space telemetry...</div>`;
    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
        .then(res => res.json())
        .then(data => {
            if (!data.title) throw new Error("NASA APOD failed");
            const isVideo = data.media_type === "video";
            const mediaElement = isVideo
                ? `<iframe src="${data.url}" style="width: 100%; height: 220px; border-radius: 8px; border-left: 1px solid #333;" frameborder="0" allowfullscreen></iframe>`
                : `<img src="${data.url}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; border: 1px solid #333;">`;

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #3f51b5; text-align: left;">
                    <div style="font-size: 0.75rem; color: #7986cb; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🚀 NASA Astronomy Picture of the Day</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 10px;">${data.title} (${data.date})</div>
                    ${mediaElement}
                    <div style="font-size: 0.84rem; color: #ccc; line-height: 1.45; margin-top: 10px; max-height: 120px; overflow-y: auto;">${data.explanation}</div>
                </div>
            `;
            handleVaiiDataOutput(`NASA APOD: ${data.title}. ${data.explanation}`, html);
        })
        .catch(() => handleVaiiDataOutput("Could not load NASA telemetry.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">NASA APOD connection timed out. Please try again.</div>`));
}

function fetchAdviceSlip() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching advice...</div>`;
    fetch('https://api.adviceslip.com/advice')
        .then(res => res.json())
        .then(data => {
            const advice = data?.slip?.advice;
            if (!advice) throw new Error("Advice failed");
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #00bcd4; text-align: left;">
                    <div style="font-size: 0.75rem; color: #00bcd4; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">💡 Words of Advice</div>
                    <div style="font-size: 1.2rem; font-weight: 500; color: #fff; line-height: 1.45;">"${advice}"</div>
                </div>
            `;
            handleVaiiDataOutput(`Advice: ${advice}`, html);
        })
        .catch(() => handleVaiiDataOutput("Advice engine error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Advice engine network error.</div>`));
}

function fetchAgifyPrediction(name) {
    const cleanName = name.trim();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Calculating demographics for "${cleanName}"...</div>`;
    fetch(`https://api.agify.io/?name=${encodeURIComponent(cleanName)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.name || data.age === null) {
                return handleVaiiDataOutput(`Could not estimate age for "${cleanName}".`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No statistical demographic data found for name "${cleanName}".</div>`);
            }
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff4081; text-align: left;">
                    <div style="font-size: 0.75rem; color: #ff4081; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">📊 Name Demographic Estimator</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #fff; text-transform: capitalize;">${data.name}</div>
                    <div style="display: flex; gap: 20px; margin-top: 10px; border-top: 1px solid #2a2a2a; padding-top: 10px;">
                        <div><span style="color: #888; font-size: 0.78rem;">ESTIMATED AGE</span><br><strong style="font-size: 1.3rem; color: #00e676;">${data.age} yrs</strong></div>
                        <div style="border-left: 1px solid #2a2a2a; padding-left: 15px;"><span style="color: #888; font-size: 0.78rem;">SAMPLE POPULATION</span><br><strong style="font-size: 1.3rem; color: #ffc107;">${Number(data.count).toLocaleString()}</strong></div>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`The average estimated age for someone named ${data.name} is ${data.age} years old based on a sample of ${data.count} records.`, html);
        })
        .catch(() => handleVaiiDataOutput("Agify lookup failed.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Demographic server connection error.</div>`));
}

function fetchDictionaryDefinition(word) {
    const cleanWord = word.trim().toLowerCase();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Looking up definition for "${cleanWord}"...</div>`;
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
        .then(res => {
            if (!res.ok) throw new Error("Word not found");
            return res.json();
        })
        .then(data => {
            const entry = data[0];
            const phoneticText = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
            const audioUrl = entry.phonetics?.find(p => p.audio && p.audio.trim() !== '')?.audio || '';
            
            let meaningsHtml = "";
            (entry.meanings || []).slice(0, 2).forEach(m => {
                const def = m.definitions?.[0]?.definition || '';
                const example = m.definitions?.[0]?.example ? `<br><em style="color:#888; font-size:0.8rem;">"${m.definitions[0].example}"</em>` : '';
                meaningsHtml += `<div style="margin-top: 8px;"><span style="color:#4da3ff; font-weight:bold; font-size:0.8rem; text-transform:uppercase;">${m.partOfSpeech}</span>: <span style="color:#ddd; font-size:0.88rem;">${def}</span>${example}</div>`;
            });

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #8bc34a; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: #fff; text-transform: capitalize;">📖 ${entry.word}</div>
                            ${phoneticText ? `<div style="color: #8bc34a; font-size: 0.85rem;">${phoneticText}</div>` : ''}
                        </div>
                    </div>
                    ${audioUrl ? `
                        <div style="margin: 8px 0 12px 0;">
                            <span style="font-size: 0.72rem; color: #aaa; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Phonetic Audio:</span>
                            <audio controls style="width: 100%; height: 36px; border-radius: 6px;" src="${audioUrl}"></audio>
                        </div>
                    ` : ''}
                    <div style="border-top: 1px solid #2a2a2a; padding-top: 8px;">${meaningsHtml}</div>
                </div>
            `;
            handleVaiiDataOutput(`Definition for ${entry.word}: ${entry.meanings?.[0]?.definitions?.[0]?.definition || ''}`, html);
        })
        .catch(() => handleVaiiDataOutput(`No definition found for "${cleanWord}".`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">No dictionary definition found for "${cleanWord}".</div>`));
}

function fetchCuteAnimal(type = "dog") {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching cute ${type}...</div>`;
    if (type === "dog") {
        fetch('https://dog.ceo/api/breeds/image/random')
            .then(res => res.json())
            .then(data => {
                if (data.status !== "success") throw new Error("Dog API Error");
                const html = `
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: left;">
                        <div style="font-size: 0.85rem; font-weight: bold; color: #ff9800; margin-bottom: 8px;">🐶 Random Dog Picture</div>
                        <img src="${data.message}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; border: 1px solid #333;">
                    </div>
                `;
                handleVaiiDataOutput("Here is a cute dog picture!", html);
            })
            .catch(() => handleVaiiDataOutput("Could not load dog picture.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Could not load dog picture.</div>`));
    } else {
        const catUrl = `https://cataas.com/cat?t=${Date.now()}`;
        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #9c27b0; text-align: left;">
                <div style="font-size: 0.85rem; font-weight: bold; color: #9c27b0; margin-bottom: 8px;">🐱 Random Cat Picture</div>
                <img src="${catUrl}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; border: 1px solid #333;">
            </div>
        `;
        handleVaiiDataOutput("Here is a cute cat picture!", html);
    }
}

function fetchCountryInfo(countryName) {
    const cleanTarget = countryName.toLowerCase().trim();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching country data for "${cleanTarget}"...</div>`;

    const renderCard = (c, popValue) => {
        const commonName = c.name?.common || countryName;
        const officialName = c.name?.official || commonName;
        const capital = (Array.isArray(c.capital) && c.capital.length > 0) ? c.capital.join(', ') : (c.capital || 'N/A');
        const population = popValue ? Number(popValue).toLocaleString() : 'N/A';
        const region = `${c.region || 'N/A'} (${c.subregion || ''})`;
        
        let currencyStr = 'N/A';
        if (c.currencies) {
            currencyStr = Object.values(c.currencies).map(curr => {
                if (typeof curr === 'string') return curr;
                return `${curr.name || ''} (${curr.symbol || ''})`;
            }).filter(Boolean).join(', ') || 'N/A';
        }

        const flagSvg = (c.cca2) 
            ? `https://flagcdn.com/w160/${c.cca2.toLowerCase()}.png` 
            : (c.flags?.svg || c.flags?.png || '');

        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #00bcd4; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #fff;">${commonName} ${c.flag || ''}</div>
                        <div style="font-size: 0.82rem; color: #888;">${officialName}</div>
                    </div>
                    ${flagSvg ? `<img src="${flagSvg}" style="width: 70px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #333;">` : ''}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.85rem; color: #ccc; border-top: 1px solid #2a2a2a; padding-top: 10px;">
                    <div><strong>🏛️ Capital:</strong> ${capital}</div>
                    <div><strong>👥 Population:</strong> ${population}</div>
                    <div><strong>🌍 Region:</strong> ${region}</div>
                    <div><strong>💰 Currency:</strong> ${currencyStr}</div>
                </div>
            </div>
        `;
        handleVaiiDataOutput(`${commonName}. Capital is ${capital}. Population is ${population}.`, html);
    };

    fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json')
        .then(res => {
            if (!res.ok) throw new Error("CDN error");
            return res.json();
        })
        .then(countries => {
            const found = countries.find(c => {
                const cCommon = (c.name?.common || '').toLowerCase();
                const cOfficial = (c.name?.official || '').toLowerCase();
                const cca2 = (c.cca2 || '').toLowerCase();
                const cca3 = (c.cca3 || '').toLowerCase();
                const altSpellings = (c.altSpellings || []).map(a => a.toLowerCase());

                return cCommon === cleanTarget || 
                       cOfficial === cleanTarget || 
                       cca2 === cleanTarget || 
                       cca3 === cleanTarget ||
                       altSpellings.includes(cleanTarget) ||
                       cCommon.includes(cleanTarget);
            });

            if (!found) throw new Error("Country not found in dataset");

            if (found.cca2) {
                fetch(`https://api.worldbank.org/v2/country/${found.cca2}/indicator/SP.POP.TOTL?format=json&mrnev=1`)
                    .then(r => r.json())
                    .then(wbData => {
                        const pop = wbData?.[1]?.[0]?.value || found.population || null;
                        renderCard(found, pop);
                    })
                    .catch(() => renderCard(found, found.population || null));
            } else {
                renderCard(found, found.population || null);
            }
        })
        .catch(err => {
            console.error("Country Dataset Error:", err);
            handleVaiiDataOutput(`Country "${countryName}" not found.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Country "${countryName}" not found in database. Check your spelling and try again.</div>`);
        });
}

function fetchDrinkRecipe(drinkName) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Finding cocktail recipe...</div>`;
    const url = (!drinkName || drinkName === "random") 
        ? 'https://www.thecocktaildb.com/api/json/v1/1/random.php'
        : `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(drinkName)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.drinks || data.drinks.length === 0) {
                return handleVaiiDataOutput(`No cocktail found for "${drinkName}".`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No cocktail recipes found for "${drinkName}".</div>`);
            }
            const drink = data.drinks[0];
            let ingredients = [];
            for (let i = 1; i <= 15; i++) {
                const ing = drink[`strIngredient${i}`];
                const meas = drink[`strMeasure${i}`];
                if (ing) ingredients.push(`${meas ? meas.trim() + ' ' : ''}${ing.trim()}`);
            }

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #e91e63; text-align: left; display: flex; gap: 15px;">
                    ${drink.strDrinkThumb ? `<img src="${drink.strDrinkThumb}" style="width: 90px; height: 90px; border-radius: 8px; object-fit: cover; border: 1px solid #333;">` : ''}
                    <div style="flex: 1;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: #fff;">🍸 ${drink.strDrink}</div>
                        <div style="color: #e91e63; font-size: 0.8rem; font-weight: bold; margin-bottom: 6px;">${drink.strAlcoholic} • ${drink.strGlass}</div>
                        <div style="font-size: 0.82rem; color: #aaa; margin-bottom: 6px;"><strong>Ingredients:</strong> ${ingredients.join(', ')}</div>
                        <div style="font-size: 0.82rem; color: #ddd; line-height: 1.4;">${drink.strInstructions}</div>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`${drink.strDrink}. ${drink.strInstructions}`, html);
        })
        .catch(() => handleVaiiDataOutput("Cocktail recipe search failed.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Cocktail database network error.</div>`));
}

function fetchClientIPLookup() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying network parameters...</div>`;
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error("IP API failed");
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #673ab7; text-align: left;">
                    <div style="font-size: 0.75rem; color: #673ab7; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🌐 Public IP Telemetry</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #fff; margin-bottom: 8px;">${data.ip}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.85rem; color: #ccc; border-top: 1px solid #2a2a2a; padding-top: 10px;">
                        <div><strong>🏢 ISP:</strong> ${data.org || data.asn || 'N/A'}</div>
                        <div><strong>📍 Location:</strong> ${data.city}, ${data.region}</div>
                        <div><strong>🏳️ Country:</strong> ${data.country_name} (${data.country_code})</div>
                        <div><strong>📮 Postal:</strong> ${data.postal || 'N/A'}</div>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`Your public IP address is ${data.ip}, located in ${data.city}, ${data.region}.`, html);
        })
        .catch(() => handleVaiiDataOutput("Could not retrieve IP parameters.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Could not retrieve IP parameters.</div>`));
}

function fetchSongTrack(songQuery) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Searching music library for "${songQuery}"...</div>`;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(songQuery)}&entity=song&limit=1`)
        .then(res => res.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                return handleVaiiDataOutput("No song track found for " + songQuery, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No songs found for "${songQuery}".</div>`);
            }
            const track = data.results[0];
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #1db954; text-align: left;">
                    <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 12px;">
                        <img src="${track.artworkUrl100}" style="width: 75px; height: 75px; border-radius: 8px; object-fit: cover; border: 1px solid #333;">
                        <div>
                            <div style="font-size: 1.15rem; font-weight: bold; color: #fff;">🎵 ${track.trackName}</div>
                            <div style="color: #1db954; font-size: 0.9rem; font-weight: 500;">${track.artistName}</div>
                            <div style="color: #888; font-size: 0.78rem; margin-top: 2px;">${track.collectionName || 'Single'} (${new Date(track.releaseDate).getFullYear()})</div>
                        </div>
                    </div>
                    ${track.previewUrl ? `
                        <div style="margin-top: 8px;">
                            <span style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">30s Audio Preview:</span>
                            <audio controls style="width: 100%; height: 36px; border-radius: 6px;" src="${track.previewUrl}"></audio>
                        </div>
                    ` : ''}
                    <a href="${track.trackViewUrl}" target="_blank" style="display: block; margin-top: 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;">Listen full track on Apple Music ↗</a>
                </div>
            `;
            handleVaiiDataOutput(`Found ${track.trackName} by ${track.artistName}.`, html);
        })
        .catch(() => handleVaiiDataOutput("Music lookup failed. Network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Music search failed. Network error.</div>`));
}

function fetchAniListMedia(title, mediaType = "ANIME") {
    const isAnime = (mediaType === "ANIME");
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying AniList ${isAnime ? 'anime' : 'manga'} data...</div>`;

    const query = `
        query ($search: String, $type: MediaType) {
            Media (search: $search, type: $type, sort: POPULARITY_DESC) {
                id
                title {
                    romaji
                    english
                }
                coverImage {
                    large
                }
                averageScore
                episodes
                chapters
                status
                genres
                description(asHtml: false)
                staff(perPage: 1) {
                    nodes {
                        name {
                            full
                        }
                    }
                }
            }
        }
    `;

    const variables = {
        search: title,
        type: mediaType
    };

    fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
    })
    .then(res => res.json())
    .then(resData => {
        const media = resData.data?.Media;
        if (!media) {
            return handleVaiiDataOutput(`No ${isAnime ? 'anime' : 'manga'} found for ${title}`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No ${isAnime ? 'anime' : 'manga'} entry found for "${title}".</div>`);
        }

        const displayTitle = media.title.english || media.title.romaji;
        const genres = (media.genres || []).join(", ");
        const score = media.averageScore ? (media.averageScore / 10).toFixed(1) : 'N/A';
        const countInfo = isAnime 
            ? `${media.episodes || '?'} eps` 
            : `${media.chapters ? media.chapters + ' chapters' : 'Ongoing'}`;
        const authorInfo = (!isAnime && media.staff?.nodes?.[0]?.name?.full)
            ? `<div style="color: #bc223b; font-size: 0.82rem; font-weight: 500; margin-bottom: 4px;">✍️ By ${media.staff.nodes[0].name.full}</div>`
            : '';

        let cleanDesc = (media.description || 'No description provided.')
            .replace(/<[^>]*>/g, '')
            .replace(/\n\n/g, ' ')
            .trim();

        const borderColor = isAnime ? "#2e51a2" : "#bc223b";
        const icon = isAnime ? "⛩️" : "📚";

        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid ${borderColor}; text-align: left; display: flex; gap: 15px;">
                ${media.coverImage?.large ? `<img src="${media.coverImage.large}" style="width: 95px; border-radius: 8px; object-fit: cover; border: 1px solid #333;">` : ''}
                <div>
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff; margin-bottom: 3px;">${icon} ${displayTitle}</div>
                    <div style="color: #ffc107; font-size: 0.85rem; margin-bottom: 4px;">⭐ Score: ${score} / 10 | ${countInfo} (${media.status ? media.status.replace(/_/g, ' ') : 'Unknown'})</div>
                    ${authorInfo}
                    <div style="color: #aaa; font-size: 0.78rem; margin-bottom: 8px;">Genres: ${genres || 'N/A'}</div>
                    <div style="color: #ccc; font-size: 0.86rem; line-height: 1.4; max-height: 110px; overflow-y: auto;">${cleanDesc}</div>
                </div>
            </div>
        `;
        handleVaiiDataOutput(`${displayTitle}, score is ${score}. ${cleanDesc}`, html);
    })
    .catch(err => {
        console.error("AniList API Error:", err);
        handleVaiiDataOutput(`${isAnime ? 'Anime' : 'Manga'} lookup failed. Network error.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">${isAnime ? 'Anime' : 'Manga'} lookup failed. Network error. Please try again.</div>`);
    });
}

function fetchPokemonEntry(pokeName) {
    const cleanName = pokeName.toLowerCase().trim().replace(/\s+/g, '-');
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching Pokédex telemetry...</div>`;
    fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(cleanName)}`)
        .then(res => {
            if (!res.ok) throw new Error("Pokemon not found");
            return res.json();
        })
        .then(p => {
            const types = p.types.map(t => `<span style="background: #333; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; text-transform: capitalize; color: #ffcb05; font-weight: bold;">${t.type.name}</span>`).join(' ');
            const sprite = p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default;
            const stats = p.stats.map(s => `<div style="font-size: 0.78rem; color: #bbb;"><strong style="text-transform: capitalize;">${s.stat.name.replace('-', ' ')}:</strong> ${s.base_stat}</div>`).join('');
            
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ffcb05; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <div style="font-size: 1.3rem; font-weight: bold; text-transform: capitalize; color: #fff;">⚡ #${p.id} ${p.name}</div>
                            <div style="display: flex; gap: 6px; margin-top: 6px;">${types}</div>
                        </div>
                        ${sprite ? `<img src="${sprite}" style="width: 85px; height: 85px; object-fit: contain;">` : ''}
                    </div>
                    <div style="border-top: 1px solid #2a2a2a; padding-top: 10px; margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                        <div style="font-size: 0.78rem; color: #bbb;"><strong>Height:</strong> ${(p.height / 10).toFixed(1)} m</div>
                        <div style="font-size: 0.78rem; color: #bbb;"><strong>Weight:</strong> ${(p.weight / 10).toFixed(1)} kg</div>
                        ${stats}
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`Pokemon #${p.id} ${p.name}. Type: ${p.types.map(t => t.type.name).join(', ')}.`, html);
        })
        .catch(() => handleVaiiDataOutput(`Pokemon "${pokeName}" not found.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Pokémon "${pokeName}" not found in Pokédex index.</div>`));
}

function fetchOpenLibraryBook(bookTitle) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying Open Library archives...</div>`;
    fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}&limit=1`)
        .then(res => res.json())
        .then(data => {
            if (!data.docs || data.docs.length === 0) {
                return handleVaiiDataOutput("No book found for " + bookTitle, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No book found for "${bookTitle}".</div>`);
            }
            const book = data.docs[0];
            const author = (book.author_name || ['Unknown Author']).join(', ');
            const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null;
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #e1ad01; text-align: left; display: flex; gap: 15px;">
                    ${coverUrl ? `<img src="${coverUrl}" style="width: 85px; border-radius: 6px; object-fit: cover; border: 1px solid #333;">` : ''}
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #fff;">📖 ${book.title}</div>
                        <div style="color: #e1ad01; font-size: 0.9rem; margin-bottom: 6px;">✍️ By ${author}</div>
                        <div style="color: #aaa; font-size: 0.82rem; line-height: 1.4;">
                            📅 First Published: ${book.first_publish_year || 'Unknown'}<br>
                            📄 Pages: ${book.number_of_pages_median || 'N/A'}<br>
                            ⭐ Editions: ${book.edition_count || 1}
                        </div>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`Found ${book.title} by ${author}, first published in ${book.first_publish_year || 'unknown year'}.`, html);
        })
        .catch(() => handleVaiiDataOutput("Book archive lookup failed.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Open Library search failed. Network error.</div>`));
}

function fetchTriviaQuestion() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Generating trivia question...</div>`;
    fetch(`https://opentdb.com/api.php?amount=1&type=multiple`)
        .then(res => res.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                return handleVaiiDataOutput("Could not load a trivia question.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">Could not load trivia question. Try again!</div>`);
            }
            const q = data.results[0];
            const questionText = decodeHTMLEntities(q.question);
            const correctAnswer = decodeHTMLEntities(q.correct_answer);
            const incorrectAnswers = q.incorrect_answers.map(a => decodeHTMLEntities(a));
            
            const allChoices = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);

            let buttonsHtml = allChoices.map((choice) => {
                return `<button class="trivia-choice-btn" data-correct="${choice === correctAnswer}" style="background: #2a2a2a; border: 1px solid #444; color: #fff; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; text-align: left; transition: background 0.15s ease; width: 100%;">${choice}</button>`;
            }).join('');

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff007f; text-align: left;">
                    <div style="font-size: 0.75rem; color: #ff007f; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🎯 Trivia [${q.category}] • ${q.difficulty.toUpperCase()}</div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #fff; margin-bottom: 14px; line-height: 1.4;">${questionText}</div>
                    <div id="trivia-choices-box" style="display: flex; flex-direction: column; gap: 8px;">
                        ${buttonsHtml}
                    </div>
                    <div id="trivia-result-box" style="margin-top: 12px; font-weight: bold; font-size: 0.95rem; display: none;"></div>
                </div>
            `;

            handleVaiiDataOutput(`Trivia: ${questionText}`, html, () => {
                document.querySelectorAll('.trivia-choice-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const isCorrect = e.currentTarget.getAttribute('data-correct') === 'true';
                        const resBox = document.getElementById('trivia-result-box');
                        document.querySelectorAll('.trivia-choice-btn').forEach(b => {
                            b.disabled = true;
                            if (b.getAttribute('data-correct') === 'true') {
                                b.style.background = '#28a745';
                                b.style.borderColor = '#28a745';
                            } else {
                                b.style.opacity = '0.5';
                            }
                        });

                        if (isCorrect) {
                            e.currentTarget.style.background = '#28a745';
                            resBox.style.color = '#28a745';
                            resBox.innerText = `🎉 Correct! The answer was "${correctAnswer}".`;
                            speakText(`Correct! The answer was ${correctAnswer}`);
                        } else {
                            e.currentTarget.style.background = '#dc3545';
                            resBox.style.color = '#dc3545';
                            resBox.innerText = `❌ Incorrect! The correct answer was "${correctAnswer}".`;
                            speakText(`Incorrect! The correct answer was ${correctAnswer}`);
                        }
                        resBox.style.display = 'block';
                    });
                });
            });
        })
        .catch(() => handleVaiiDataOutput("Trivia service unavailable.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Open Trivia service unavailable. Please retry.</div>`));
}

function fetchGameDeals() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Tracking top free games & discounts...</div>`;
    
    fetch(`https://www.cheapshark.com/api/1.0/deals?sortBy=Savings&pageSize=5`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(deals => {
            if (!Array.isArray(deals) || deals.length === 0) {
                return handleVaiiDataOutput("No active game deals found.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No active game deals found right now.</div>`);
            }

            let dealsHtml = "";
            deals.slice(0, 3).forEach(deal => {
                const isFree = parseFloat(deal.salePrice) === 0;
                const priceLabel = isFree 
                    ? `<span style="color: #00e676; font-weight: bold;">FREE</span>` 
                    : `<span style="color: #28a745; font-weight: bold;">$${deal.salePrice}</span>`;
                
                dealsHtml += `
                    <div style="background: #252525; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; gap: 12px; align-items: center;">
                        <img src="${deal.thumb}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #333;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 0.95rem; color: #fff;">${deal.title}</div>
                            <div style="font-size: 0.8rem; color: #aaa; margin-top: 2px;">
                                ${priceLabel} <span style="text-decoration: line-through; color: #777; margin-left: 4px;">$${deal.normalPrice}</span> • <span style="color: #ff9800;">${Math.round(deal.savings)}% OFF</span>
                            </div>
                            <a href="https://www.cheapshark.com/redirect?dealID=${deal.dealID}" target="_blank" style="display: inline-block; margin-top: 4px; color: #4da3ff; font-size: 0.78rem; font-weight: bold; text-decoration: none;">View Game Deal ↗</a>
                        </div>
                    </div>
                `;
            });

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #00e676; text-align: left;">
                    <div style="font-size: 0.8rem; color: #00e676; text-transform: uppercase; font-weight: bold; margin-bottom: 10px;">🎮 Top PC Gaming Freebies & Deals</div>
                    ${dealsHtml}
                </div>
            `;
            handleVaiiDataOutput("Here are the top gaming freebies and discounts.", html);
        })
        .catch(err => {
            console.error("CheapShark deals error:", err);
            handleVaiiDataOutput("Game deals lookup failed.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Gaming deals feed network error. Please try again.</div>`);
        });
}

function fetchDadJoke() {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching joke...</div>`;
    fetch('https://icanhazdadjoke.com/', {
        headers: { 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (!data || !data.joke) {
            return handleVaiiDataOutput("Why did the chicken cross the road? To get to the other side!", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">Why did the chicken cross the road? To get to the other side!</div>`);
        }
        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: left;">
                <div style="font-size: 0.75rem; color: #ff9800; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">😂 Dad Joke</div>
                <div style="font-size: 1.15rem; font-weight: 500; color: #fff; line-height: 1.45;">"${data.joke}"</div>
            </div>
        `;
        handleVaiiDataOutput(data.joke, html);
    })
    .catch(() => handleVaiiDataOutput("Joke lookup failed.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Joke service error.</div>`));
}

function executeVisionAnalysis(promptText) {
    output.innerHTML = `
        <div class="generation-status">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">VAII vision engine is processing image parameters...</span>
        </div>
    `;

    const payload = {
        contents: [{
            parts: [
                { text: promptText },
                { inlineData: { mimeType: activeImageMimeType || "image/jpeg", data: activeImageBase64 } }
            ]
        }]
    };

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${getActiveGeminiKey()}`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            output.innerHTML = `
                <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">
                    <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">⚠️ Google API Error</div>
                    <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">${data.error.message}</div>
                </div>
            `;
            return;
        }
        const descriptionResult = data.candidates[0].content.parts[0].text;
        const finalHtml = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.5px;">👁️ Image Analysis Output</div>
                <div style="color: #eee; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;">${descriptionResult}</div>
            </div>
        `;
        handleVaiiDataOutput(descriptionResult, finalHtml);
        clearActiveImage();
    }).catch(err => {
        handleVaiiDataOutput("Network intercept error connecting to Google vision matrices.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Network intercept error connecting to Google vision matrices.</div>`);
        console.error(err);
    });
}

function runMarketExecution(ticker) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Fetching price updates for "${ticker.toUpperCase()}"...</div>`;
    const cleanTicker = ticker.trim().toLowerCase();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", solana: "solana" };

    if (cryptoMap[cleanTicker]) {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[cleanTicker]}&vs_currencies=usd&include_24hr_change=true`)
            .then(res => res.json())
            .then(data => {
                const coinData = data[cryptoMap[cleanTicker]];
                const price = coinData.usd;
                const change = coinData.usd_24h_change.toFixed(2);
                const htmlOutput = `
                    <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                        <strong>🪙 ${cryptoMap[cleanTicker].toUpperCase()} (${ticker.toUpperCase()})</strong><br>
                        💰 Price: $${price.toLocaleString()} USD<br>
                        ${change >= 0 ? "📈" : "📉"} 24h Change: ${change}%
                    </div>
                `;
                handleVaiiDataOutput(`The price of ${cryptoMap[cleanTicker]} is ${price.toLocaleString()} dollars.`, htmlOutput);
            }).catch(() => { handleVaiiDataOutput("Error pulling crypto ticker data.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Error pulling crypto ticker data.</div>`); });
    } else {
        const htmlOutput = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #6f42c1; text-align: left;">
                <strong>📈 Stock Ticker: ${ticker.toUpperCase()}</strong><br>
                <span style="color: #aaa; font-size: 0.9rem;">To view deep market assets, open the link directly:</span>
                <a href="https://finance.yahoo.com/quote/${ticker.toUpperCase()}" target="_blank">Open Yahoo Finance ↗</a>
            </div>
        `;
        handleVaiiDataOutput(`I found the stock ticker ${ticker.toUpperCase()}.`, htmlOutput);
    }
}

function executeImageGeneration(imagePrompt) {
    if (ttsBtn) ttsBtn.style.display = 'flex';
    routingWarning.style.display = "none"; 
    output.innerHTML = `
        <div style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">🎨 Generating artwork for "${imagePrompt}"...</div>
        <div class="generation-status" id="image-loader">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">Assembling pixels...</span>
        </div>
    `;
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1080&height=1080&nologo=true&seed=${seed}`;
    const img = new Image();
    img.src = imageUrl;
    img.style.width = "100%";
    img.style.borderRadius = "8px";
    img.style.marginTop = "10px";
    img.style.display = "none";
    img.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
    img.onload = function() {
        document.getElementById("image-loader")?.remove();
        img.style.display = "block";
    };
    output.appendChild(img);
}

function launchTargetUrl(url) {
    routingWarning.style.display = "block"; 
    const htmlOutput = `
        <div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 4px; font-size: 0.9rem; line-height: 1.4;">Navigating to external web link...</div>
        <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left; margin-bottom: 15px;">
            🔗 <strong>Address:</strong> <span style="color: #4da3ff; word-break: break-all;">${url}</span>
        </div>
        <a href="${url}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #007bff; border-radius: 6px; padding: 10px 14px; color: white; text-decoration: none; font-weight: bold; font-size: 0.95rem;">
            <span>Launch Link</span>
            <span>Open Site ↗</span>
        </a>
    `;
    handleVaiiDataOutput("Opening link.", htmlOutput);
    window.open(url, '_blank');
}

// ==========================================
// 8. MASTER ROUTING PIPELINE (VAII NATIVE)
// ==========================================
function runInfoExecution(query) {
    const cleanQuery = query.toLowerCase().trim();
    const cryptoMap = { btc: "bitcoin", eth: "ethereum", solana: "solana" };
    const greetingsList = ["hello", "hi", "hey", "sup", "yo", "greetings"];
    let greetingHTML = "";

    if (greetingsList.includes(cleanQuery)) {
        greetingHTML = `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #17a2b8; text-align: left; margin-bottom: 15px;">
                👋 <strong>Assistant:</strong><br><span>Hello! How can I help you today? System initialized.</span>
            </div>
        `;
    }

    if (cleanQuery.includes("calendar") || cleanQuery.includes("calender") || cleanQuery.includes("schedule") || cleanQuery === "agenda" || cleanQuery.includes("email") || cleanQuery.includes("gmail") || cleanQuery.includes("inbox")) {
        const htmlLayout = greetingHTML + `
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">
                ⚠️ <strong>Workspace Elements Disabled:</strong><br><br>
                <span style="color: #aaa; font-size: 0.9rem;">Private calendar and email protocols remain inactive to preserve a standard authorization route.</span>
            </div>
        `;
        handleVaiiDataOutput("Private calendar and email protocols remain inactive.", htmlLayout);
        return; 
    }

    if (cleanQuery.startsWith("note:")) {
        let text = query.substring(5).trim();
        if (text) {
            let notes = JSON.parse(localStorage.getItem('vaii_notes') || '[]');
            notes.push(text);
            localStorage.setItem('vaii_notes', JSON.stringify(notes));
            handleVaiiDataOutput("Note securely saved to local storage.", `<div style="background: #1a1a1a; padding: 14px; border-left: 3px solid #28a745; text-align: left; border-radius: 8px;">✅ Note securely saved to local storage. Type <code>show notes</code> to view.</div>`);
        }
        return;
    }
    if (cleanQuery === "show notes" || cleanQuery === "my notes") return renderNotesManager();

    // 1. PRIORITY LOCATION/WEATHER/MAP MATCHERS
    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value.toLowerCase() === cleanQuery);
    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        renderUnifiedLocationCard(matchedOption.getAttribute('data-lat'), matchedOption.getAttribute('data-lon'), matchedOption.getAttribute('data-tz'), matchedOption.value, greetingHTML);
        return;
    }

    const isExplicitLocationIntent = cleanQuery.startsWith("map of ") || cleanQuery.startsWith("show map ") || cleanQuery.startsWith("time in ") || cleanQuery.startsWith("weather in ") || cleanQuery.startsWith("weather ") || cleanQuery.startsWith("clock ") || cleanQuery.startsWith("sunset in ") || cleanQuery.startsWith("sunset ") || cleanQuery.startsWith("sunrise in ") || cleanQuery.startsWith("sunrise ") || cleanQuery.startsWith("solar ");

    if (isExplicitLocationIntent) {
        let parsedLocation = query.replace(/map of |show map |time in |weather in |weather |clock |sunset in |sunset |sunrise in |sunrise |solar /i, "").trim();
        resolveAndRenderLocation(parsedLocation, greetingHTML);
        return;
    }

    if (query.includes(",")) {
        let basePart = query.split(',')[0].trim();
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(basePart)}&count=5&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                if (geoData.results && geoData.results.length > 0) {
                    const secondary = query.split(',')[1].toLowerCase().trim();
                    const matched = geoData.results.find(l => 
                        (l.admin1 && l.admin1.toLowerCase().includes(secondary)) || 
                        (l.country && l.country.toLowerCase().includes(secondary))
                    ) || geoData.results[0];

                    let formattedName = `${matched.name}`;
                    if (matched.admin1 && matched.admin1 !== matched.name) formattedName += `, ${matched.admin1}`;
                    if (matched.country) formattedName += ` (${matched.country})`;

                    renderUnifiedLocationCard(matched.latitude, matched.longitude, matched.timezone || 'auto', formattedName, greetingHTML);
                } else {
                    proceedWithWikiPipeline();
                }
            })
            .catch(() => {
                proceedWithWikiPipeline();
            });
        return;
    }

    // 2. STRICT CURRENCY CONVERSION
    const forexPattern1 = /^(?:convert\s+)?([0-9.]+)?\s*([a-zA-Z]{3}|[$€£¥])\s+(?:to|in|into)\s+([a-zA-Z]{3}|[$€£¥])$/i;
    const forexPattern2 = /^(?:convert\s+)?([$€£¥])\s*([0-9.]+)\s+(?:to|in|into)\s+([a-zA-Z]{3}|[$€£¥])$/i;

    let fxMatch = cleanQuery.match(forexPattern1);
    if (fxMatch) {
        let fromToken = fxMatch[2].toUpperCase();
        let toToken = fxMatch[3].toUpperCase();
        let fromCode = CURRENCY_SYMBOL_MAP[fromToken] || fromToken;
        let toCode = CURRENCY_SYMBOL_MAP[toToken] || toToken;

        if (VALID_ISO_CURRENCIES.has(fromCode) && VALID_ISO_CURRENCIES.has(toCode)) {
            let amount = fxMatch[1] || "1";
            return fetchForexConversion(amount, fromCode, toCode);
        }
    }

    let fxMatchSymbol = cleanQuery.match(forexPattern2);
    if (fxMatchSymbol) {
        let fromCode = CURRENCY_SYMBOL_MAP[fxMatchSymbol[1]] || 'USD';
        let amount = fxMatchSymbol[2] || "1";
        let toToken = fxMatchSymbol[3].toUpperCase();
        let toCode = CURRENCY_SYMBOL_MAP[toToken] || toToken;

        if (VALID_ISO_CURRENCIES.has(fromCode) && VALID_ISO_CURRENCIES.has(toCode)) {
            return fetchForexConversion(amount, fromCode, toCode);
        }
    }

    // 3. QR CODE GENERATOR
    if (cleanQuery.startsWith("qr ") || cleanQuery.startsWith("qrcode ")) {
        return generateQRCode(query.replace(/^(qr|qrcode)\s+/i, '').trim());
    }

    // 4. ISS TELEMETRY
    if (cleanQuery === "iss" || cleanQuery === "orbit" || cleanQuery === "where is the iss" || cleanQuery === "space station") {
        return fetchISSTelemetry();
    }

    // 5. DUCKS (INSTANT)
    if (cleanQuery === "duck" || cleanQuery === "ducks" || cleanQuery === "random duck") {
        return fetchRandomDuck();
    }

    // 6. POSTAL CODE GEOCODER
    if (cleanQuery.startsWith("zip ") || cleanQuery.startsWith("postal ")) {
        return fetchPostalCodeInfo(cleanQuery.replace(/^(zip|postal)\s+/i, '').trim());
    }

    // 7. COLLEGE & UNIVERSITY SEARCH
    if (cleanQuery.startsWith("college ") || cleanQuery.startsWith("university ")) {
        return fetchUniversityDirectory(cleanQuery.replace(/^(college|university)\s+/i, '').trim());
    }

    // 8. NASA APOD
    if (cleanQuery === "space" || cleanQuery === "nasa" || cleanQuery === "apod" || cleanQuery === "astronomy") {
        return fetchNasaAPOD();
    }

    // 9. ADVICE SLIP
    if (cleanQuery === "advice" || cleanQuery === "give me advice" || cleanQuery === "quote") {
        return fetchAdviceSlip();
    }

    // 10. AGIFY NAME DEMOGRAPHICS
    if (cleanQuery.startsWith("age ")) {
        return fetchAgifyPrediction(cleanQuery.replace(/^age\s+/i, '').trim());
    }

    // 11. DICTIONARY DEFINITIONS & PHONETICS
    if (cleanQuery.startsWith("define ")) {
        return fetchDictionaryDefinition(cleanQuery.replace(/^define\s+/i, '').trim());
    }

    // 12. PET PICTURES
    if (cleanQuery === "dog" || cleanQuery === "random dog" || cleanQuery === "dogs") {
        return fetchCuteAnimal("dog");
    }
    if (cleanQuery === "cat" || cleanQuery === "random cat" || cleanQuery === "cats") {
        return fetchCuteAnimal("cat");
    }

    // 13. COUNTRY & FLAGS
    if (cleanQuery.startsWith("country ") || cleanQuery.startsWith("flag of ")) {
        return fetchCountryInfo(cleanQuery.replace(/^(country|flag of)\s+/i, '').trim());
    }

    // 14. COCKTAILS & DRINKS
    if (cleanQuery.startsWith("drink ") || cleanQuery === "random drink" || cleanQuery === "cocktail") {
        return fetchDrinkRecipe(cleanQuery.replace(/^drink\s+/i, '').trim());
    }

    // 15. PUBLIC IP TELEMETRY
    if (cleanQuery === "my ip" || cleanQuery === "ip" || cleanQuery === "ip lookup" || cleanQuery === "what is my ip") {
        return fetchClientIPLookup();
    }

    // 16. TRIVIA QUIZ
    if (cleanQuery === "trivia" || cleanQuery === "quiz" || cleanQuery.startsWith("trivia ") || cleanQuery.startsWith("quiz ")) {
        return fetchTriviaQuestion();
    }

    // 17. GAME DEALS
    if (cleanQuery === "free games" || cleanQuery === "deals" || cleanQuery === "giveaways" || cleanQuery.startsWith("free game")) {
        return fetchGameDeals();
    }

    // 18. JOKES
    if (cleanQuery === "joke" || cleanQuery === "tell me a joke" || cleanQuery === "make me laugh" || cleanQuery.startsWith("joke ")) {
        return fetchDadJoke();
    }

    // 19. ITUNES MUSIC PREVIEWS
    if (cleanQuery.startsWith("song ") || cleanQuery.startsWith("music ") || cleanQuery.startsWith("track ")) {
        return fetchSongTrack(cleanQuery.replace(/^(song|music|track)\s+/i, '').trim());
    }

    // 20. ANILIST ANIME & MANGA
    if (cleanQuery.startsWith("anime ")) {
        return fetchAniListMedia(cleanQuery.replace(/^anime\s+/i, '').trim(), "ANIME");
    }
    if (cleanQuery.startsWith("manga ")) {
        return fetchAniListMedia(cleanQuery.replace(/^manga\s+/i, '').trim(), "MANGA");
    }

    // 21. POKEDEX
    if (cleanQuery.startsWith("pokemon ") || cleanQuery.startsWith("pokedex ")) {
        return fetchPokemonEntry(cleanQuery.replace(/^(pokemon|pokedex)\s+/i, '').trim());
    }

    // 22. OPEN LIBRARY BOOKS
    if (cleanQuery.startsWith("book ") || cleanQuery.startsWith("novel ")) {
        return fetchOpenLibraryBook(cleanQuery.replace(/^(book|novel)\s+/i, '').trim());
    }

    // 23. GNEWS LIVE NEWS
    if (cleanQuery.startsWith("news about ")) return fetchNewsAPI(query.substring(11).trim());
    if (cleanQuery === "top news" || cleanQuery === "news") return fetchNewsAPI("");

    // 24. OMDB MOVIES
    if (cleanQuery.startsWith("movie ") || cleanQuery.startsWith("film ")) {
        return fetchOMDBMedia(cleanQuery.replace(/^(movie|film)\s+/i, '').trim());
    }

    // 25. FOOD CONCIERGE
    let isFoodIntent = Object.keys(LOCAL_FOOD_DB).some(cat => cleanQuery.includes(cat)) || 
                       cleanQuery.startsWith("order ") || cleanQuery.startsWith("find ");

    if (isFoodIntent) {
        let foodItem = query.replace(/order me a /i, "")
            .replace(/order a /i, "")
            .replace(/order some /i, "")
            .replace(/order /i, "")
            .replace(/find /i, "")
            .trim();
        executeLocalFoodSearch(foodItem);
        return;
    }

    // 26. APP LAUNCHER
    if (query.toLowerCase().startsWith("open ")) {
        let rawTarget = query.substring(5).trim().toLowerCase().replace(/['"]+/g, '');
        if (!rawTarget) { output.innerText = "Please specify what you want to open."; return; }
        output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Resolving address for "${rawTarget}"...</div>`;
        
        const randomizedRoutes = {
            "gemini": ["https://gemini.google.com"],
            "google gemini": ["https://gemini.google.com"],
            "youtube music": ["https://music.youtube.com"],
            "minecraft": ["https://minecraft.net"],
            "wikipedia": ["https://wikipedia.org"],
            "m&t": ["https://mandtbank.com"],
            "m&t bank": ["https://mandtbank.com"]
        };

        if (randomizedRoutes[rawTarget]) {
            launchTargetUrl(randomizedRoutes[rawTarget][0]);
            return;
        }

        let sanitizedDomain = rawTarget.replace(/&/g, 'and').replace(/[^a-z0-9.-]/g, '');
        if (!sanitizedDomain) sanitizedDomain = "google";
        
        if (sanitizedDomain.includes('.')) {
            launchTargetUrl(`https://${sanitizedDomain}`);
        } else {
            launchTargetUrl(`https://${sanitizedDomain}.com`);
        }
        return;
    }

    // 27. DIRECT URL NAVIGATION
    if (/\.[a-z]{2,6}/i.test(query) || query.startsWith('http://') || query.startsWith('https://')) {
        let cleanUrl = query.startsWith('http') ? query : 'https://' + query;
        launchTargetUrl(cleanUrl);
        return;
    }

    // 28. CRYPTO & MARKET QUOTES
    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        runMarketExecution(cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery);
        return;
    }

    // 29. ARITHMETIC, UNIT CONVERSIONS & LANGUAGE TRANSLATION
    if (/^[0-9+\-*/().\s]+$/.test(query) || cleanQuery.includes(" to ")) {
        try {
            if (!cleanQuery.includes(" to ")) {
                const result = Function(`"use strict"; return (${query})`)();
                const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔢 <strong>Calculation:</strong><br><span style="font-size: 1.3rem; font-weight: bold;">${query} = ${result}</span></div>`;
                handleVaiiDataOutput("The answer is " + result, htmlOutput);
                return;
            }
        } catch(e) {}

        if (cleanQuery.includes(" to ")) {
            const parts = query.split(/ to /i);
            const source = parts[0].trim();
            const targetLanguage = parts[1].trim();
            const unitMatch = source.match(/^([0-9.]+)\s*([a-zA-Z°]+)$/);
            
            if (unitMatch) {
                const num = parseFloat(unitMatch[1]);
                const fromUnit = unitMatch[2].toLowerCase();
                const toUnit = targetLanguage.toLowerCase();
                let conversionResult = null;
                if (fromUnit === "lbs" && toUnit === "kg") conversionResult = `${(num * 0.45359237).toFixed(2)} kg`;
                if (fromUnit === "kg" && toUnit === "lbs") conversionResult = `${(num / 0.45359237).toFixed(2)} lbs`;
                if (fromUnit === "miles" && toUnit === "km") conversionResult = `${(num * 1.60934).toFixed(2)} km`;
                if (fromUnit === "km" && toUnit === "miles") conversionResult = `${(num / 1.60934).toFixed(2)} miles`;
                if (fromUnit === "f" && toUnit === "c") conversionResult = `${((num - 32) * 5 / 9).toFixed(1)}°C`;
                if (fromUnit === "c" && toUnit === "f") conversionResult = `${((num * 9 / 5) + 32).toFixed(1)}°F`;
                
                if (conversionResult) {
                    const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;">🔄 <strong>Conversion:</strong><br>📤 Result: <strong style="color: #28a745; font-size: 1.3rem; display:block; margin-top:4px;">${conversionResult}</strong></div>`;
                    handleVaiiDataOutput("That converts to " + conversionResult, htmlOutput);
                    return;
                }
            }

            output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Translating phrase...</div>`;

            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|${encodeURIComponent(targetLanguage.substring(0,2))}`)
                .then(res => res.json())
                .then(data => {
                    const transText = data.responseData.translatedText;
                    const htmlOutput = `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #4da3ff; text-align: left;">🗣️ <strong>Translation:</strong><br>📤 Result: <strong style="color: #4da3ff; font-size: 1.1rem; display:block; margin-top:4px;">"${transText}"</strong></div>`;
                    handleVaiiDataOutput("The translation is " + transText, htmlOutput);
                }).catch(() => { handleVaiiDataOutput("Translation engine network failure.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Translation engine network failure.</div>`); });
            return;
        }
    }

    routingWarning.style.display = "none";
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Searching knowledge base for "${query}"...</div>`;
    proceedWithWikiPipeline();

    function proceedWithWikiPipeline() {
        if (!query.includes(" ")) {
            fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(query.toLowerCase())}`)
                .then(res => res.json())
                .then(dictData => {
                    const key = Object.keys(dictData)[0];
                    const rawDefinition = cleanWiktionaryDefinition(dictData[key][0].definitions[0].definition);
                    let wikiData = { wiktionary: { title: query, text: rawDefinition, pos: dictData[key][0].partOfSpeech || "noun" } };
                    if (greetingHTML) wikiData.greeting = greetingHTML;
                    runUnifiedWikiPipeline(query, wikiData);
                }).catch(() => {
                    runUnifiedWikiPipeline(query, { greeting: greetingHTML });
                });
        } else {
            runUnifiedWikiPipeline(query, { greeting: greetingHTML });
        }
    }
}

function runUnifiedWikiPipeline(query, wikiData) {
    const youtubeFetch = GOOGLE_API_KEY
        ? fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`)
            .then(res => res.json())
            .then(searchData => {
                if (searchData.items?.length > 0) {
                    return fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${searchData.items[0].id.channelId}&key=${GOOGLE_API_KEY}`)
                        .then(res => res.json())
                        .then(channelData => {
                            if (channelData.items?.length > 0) {
                                const item = channelData.items[0];
                                wikiData.youtube = { 
                                    title: item.snippet.title, 
                                    text: item.snippet.description, 
                                    subs: parseInt(item.statistics.subscriberCount).toLocaleString(), 
                                    views: parseInt(item.statistics.viewCount).toLocaleString(), 
                                    customUrl: item.snippet.customUrl || "" 
                                };
                            }
                        });
                }
            }).catch(() => null)
        : Promise.resolve();

    const wikipediaFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`)
        .then(res => res.json())
        .then(wikiSearch => {
            if (wikiSearch.query?.search?.length > 0) {
                let targetTitle = wikiSearch.query.search[0].title;
                if (targetTitle.toLowerCase().endsWith("(disambiguation)") && wikiSearch.query.search.length > 1) {
                    targetTitle = wikiSearch.query.search[1].title;
                }

                return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetTitle.replace(/ /g, '_'))}`)
                    .then(res => res.json())
                    .then(summaryData => { 
                        if (summaryData.type !== "disambiguation" && !summaryData.extract?.toLowerCase().includes("may refer to:")) {
                            wikiData.wikipedia = { 
                                title: summaryData.title || targetTitle, 
                                text: summaryData.extract 
                            };
                        } else if (wikiSearch.query.search.length > 1) {
                            const fallbackTitle = wikiSearch.query.search[1].title;
                            return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fallbackTitle.replace(/ /g, '_'))}`)
                                .then(r => r.json())
                                .then(fallbackSummary => {
                                    if (fallbackSummary.extract && !fallbackSummary.extract.toLowerCase().includes("may refer to:")) {
                                        wikiData.wikipedia = {
                                            title: fallbackSummary.title || fallbackTitle,
                                            text: fallbackSummary.extract
                                        };
                                    }
                                });
                        }
                    });
            }
        }).catch(() => null);

    Promise.all([youtubeFetch, wikipediaFetch]).then(() => { 
        compileFinalSourceIndexBox(query, wikiData); 
    });
}

function compileFinalSourceIndexBox(query, wikiData) {
    let blocksHtml = [];

    if (wikiData.wiktionary && wikiData.wiktionary.text) {
        blocksHtml.push(`<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #28a745; text-align: left;"><strong>${wikiData.wiktionary.title}</strong> (${wikiData.wiktionary.pos}): ${wikiData.wiktionary.text}</div>`);
    }
    if (wikiData.youtube && wikiData.youtube.title) {
        blocksHtml.push(`<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff0000; text-align: left;"><strong>📺 ${wikiData.youtube.title}</strong><br><span style="font-size: 0.85rem; color: #aaa;">🔴 Subs: ${wikiData.youtube.subs} | Views: ${wikiData.youtube.views}</span><br><br><em>${wikiData.youtube.text}</em></div>`);
    }
    if (wikiData.wikipedia && wikiData.wikipedia.text) {
        blocksHtml.push(`<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #007bff; text-align: left;"><strong>${wikiData.wikipedia.title}:</strong> ${wikiData.wikipedia.text}</div>`);
    }

    let totalHTML = wikiData.greeting || "";
    let spokenText = "";
    if (wikiData.greeting) spokenText += "Hello! How can I help you today? ";

    if (blocksHtml.length === 0) {
        handleVaiiDataOutput(spokenText + "No matches found for " + query + ".", totalHTML + `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No matches found for "${query}".</div>`);
        return;
    }
    
    spokenText += `Here is the information I found for ${query}. `;
    if (wikiData.wiktionary && wikiData.wiktionary.text) spokenText += wikiData.wiktionary.text;
    else if (wikiData.wikipedia && wikiData.wikipedia.text) spokenText += wikiData.wikipedia.text;
    else if (wikiData.youtube && wikiData.youtube.text) spokenText += wikiData.youtube.text;

    totalHTML += `<div class="news-header-msg" style="color: #888; font-style: italic; margin-bottom: 12px; font-size: 0.9rem; line-height: 1.4;">I have provided the most relevant text of each information source related to "${query}".</div>`;
    totalHTML += blocksHtml.join(`<div style="color: #888; font-style: italic; font-size: 0.85rem; margin: 15px 0 8px 0; text-align: left;">This might also be relevant:</div>`);

    totalHTML += `<div class="source-box" style="border-top: 1px solid #333; padding-top: 12px; margin-top: 15px;"><span style="display: block; font-size: 0.75rem; color: #777; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Sources Index</span><div class="source-list" style="display: flex; flex-direction: column; gap: 6px;">`;

    if (wikiData.wiktionary && wikiData.wiktionary.text) {
        totalHTML += `<a href="https://en.wiktionary.org/wiki/${encodeURIComponent(query)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wiktionary</span><span>Open Source →</span></a>`;
    }
    if (wikiData.youtube && wikiData.youtube.title) {
        const channelPath = wikiData.youtube.customUrl ? wikiData.youtube.customUrl : `@channel`;
        totalHTML += `<a href="https://www.youtube.com/${channelPath}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #ff4444; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">🔴 YouTube Channel</span><span>Live Metrics →</span></a>`;
    }
    if (wikiData.wikipedia && wikiData.wikipedia.text) {
        totalHTML += `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.wikipedia.title)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span><span>Open Source →</span></a>`;
    }
    totalHTML += `</div></div>`;
    
    handleVaiiDataOutput(spokenText, totalHTML);
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
document.querySelectorAll('input[name="vaii-mode"]').forEach(r => r.addEventListener('change', updateWelcomeMessageText));

function updateApiKeyNoteVisibility() {
    if (!prefsApiKeyInput || !apiKeyNote) return;
    if (prefsApiKeyInput.value.trim() === "") {
        apiKeyNote.style.display = "block";
    } else {
        apiKeyNote.style.display = "none";
    }
}

prefsToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = prefsDrawer.style.display === "block";
    closeAllDrawers();
    if (!isVisible) {
        prefsDrawer.style.display = "block";
        if (prefsInstructionsInput) prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        if (prefsApiKeyInput) prefsApiKeyInput.value = localStorage.getItem('vaii_custom_api_key') || '';
        updateApiKeyNoteVisibility();
    }
});

prefsApiKeyInput?.addEventListener('input', updateApiKeyNoteVisibility);

prefsCloseBtn?.addEventListener('click', () => {
    if (prefsDrawer) prefsDrawer.style.display = "none";
});

prefsSaveBtn?.addEventListener('click', () => {
    if (prefsInstructionsInput) localStorage.setItem('vaii_gemini_instructions', prefsInstructionsInput.value.trim());
    if (prefsApiKeyInput) localStorage.setItem('vaii_custom_api_key', prefsApiKeyInput.value.trim());
    prefsDrawer.style.display = "none";
    initializeFreshChatSession();
});

helpToggle?.addEventListener('click', () => {
    const isVisible = helpGuide.style.display === "block";
    closeAllDrawers();
    helpGuide.style.display = isVisible ? "none" : "block";
});

changelogToggle?.addEventListener('click', () => {
    const isVisible = changelogDrawer.style.display === "block";
    closeAllDrawers();
    changelogDrawer.style.display = isVisible ? "none" : "block";
});

historyToggle?.addEventListener('click', () => {
    const isVisible = historyDrawer.style.display === "block";
    closeAllDrawers();
    if (!isVisible) {
        historyDrawer.style.display = "block";
        renderHistoryListItems();
    }
});

newChatBtn?.addEventListener('click', () => {
    initializeFreshChatSession();
    if (historyDrawer) historyDrawer.style.display = "none";
});

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    micBtn?.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('listening');
        hubInput.placeholder = "Listening...";
    });
    
    recognition.onresult = (e) => {
        micBtn.classList.remove('listening');
        hubInput.value = e.results[0][0].transcript;
        hubInput.placeholder = "Type a command...";
        autoSpeak = true;
        executeActionBtn.click();
    };
    
    recognition.onerror = () => {
        micBtn.classList.remove('listening');
        hubInput.placeholder = "Type a command...";
    };
} else {
    if (micBtn) micBtn.style.display = 'none';
}

ttsBtn?.addEventListener('click', () => {
    const mode = document.querySelector('input[name="vaii-mode"]:checked')?.value || "native";
    if (mode === "gemini") {
        if (chatHistory.length > 0) {
            const lastMsg = chatHistory[chatHistory.length - 1];
            if (lastMsg.role === "model") speakText(lastMsg.parts[0].text.replace(/[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim());
        }
    } else {
        const spokenData = output.getAttribute('data-spoken');
        if (spokenData) {
            speakText(spokenData);
        } else {
            const currentOutput = output.innerHTML;
            if (currentOutput && currentOutput.trim() !== "") {
                let txt = stripHtml(currentOutput).replace(/[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/Assistant:|👤 You|✨ Gemini Ecosystem/gi, '').trim();
                speakText(txt);
            }
        }
    }
});

cameraTriggerBtn?.addEventListener('click', () => {
    imageFileInput?.click();
});

imageFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        const [mimeData, base64Data] = dataUrl.split(',');
        
        activeImageMimeType = mimeData.split(':')[1].split(';')[0];
        activeImageBase64 = base64Data;

        imagePreviewThumbnail.src = dataUrl;
        imagePreviewFilename.innerText = file.name;
        imagePreviewContainer.style.display = "flex";
        cameraTriggerBtn.classList.add('active');
    };
    reader.readAsDataURL(file);
});

imageClearBtn?.addEventListener('click', () => {
    clearActiveImage();
});

hubInput?.addEventListener('input', () => {
    const query = hubInput.value; 
    const trimmedQuery = query.trim();
    if (routingWarning) routingWarning.style.display = trimmedQuery.toLowerCase().startsWith('open ') ? "block" : "none";

    let customSuggestions = [];
    let cleanInput = trimmedQuery.toLowerCase();
    
    if (/^(o|or|ord|orde|order|f|fi|fin|find)/i.test(cleanInput)) {
        let searchTarget = cleanInput.replace(/^(order|find)\s+/i, '').trim();
        if (searchTarget.length > 0) {
            customSuggestions = ALL_FOOD_SUGGESTIONS.filter(s => s.toLowerCase().includes(searchTarget)).slice(0, 8);
        } else {
            customSuggestions = ALL_FOOD_SUGGESTIONS.slice(0, 8);
        }
    }

    if ("convert".startsWith(cleanInput)) {
        customSuggestions.push("convert 100 USD to EUR", "convert 50 GBP to JPY", "convert 1000 CAD to USD");
    }

    if ("qr".startsWith(cleanInput)) {
        customSuggestions.push("qr https://vaii-two.vercel.app", "qr wifi-network-password");
    }

    if ("iss".startsWith(cleanInput) || "orbit".startsWith(cleanInput)) {
        customSuggestions.push("iss", "orbit");
    }

    if ("sunset".startsWith(cleanInput) || "sunrise".startsWith(cleanInput) || "solar".startsWith(cleanInput)) {
        customSuggestions.push("sunset Tokyo", "sunrise New York", "solar Paris");
    }

    if ("zip".startsWith(cleanInput) || "postal".startsWith(cleanInput)) {
        customSuggestions.push("zip 90210", "zip 32801", "zip 10001");
    }

    if ("duck".startsWith(cleanInput)) {
        customSuggestions.push("duck", "random duck");
    }

    if ("college".startsWith(cleanInput) || "university".startsWith(cleanInput)) {
        customSuggestions.push("university Harvard", "university Oxford", "college MIT");
    }

    if ("space".startsWith(cleanInput) || "nasa".startsWith(cleanInput)) {
        customSuggestions.push("space", "nasa");
    }

    if ("advice".startsWith(cleanInput)) {
        customSuggestions.push("advice");
    }

    if ("age".startsWith(cleanInput)) {
        customSuggestions.push("age Logan", "age Alex", "age Emily", "age Liam");
    }

    if ("define".startsWith(cleanInput)) {
        customSuggestions.push("define serendipity", "define ephemeral", "define paradigm");
    }

    if ("dog".startsWith(cleanInput) || "cat".startsWith(cleanInput)) {
        customSuggestions.push("dog", "cat");
    }

    if ("country".startsWith(cleanInput)) {
        customSuggestions.push("country Japan", "country Brazil", "country Canada", "country Germany");
    }

    if ("drink".startsWith(cleanInput)) {
        customSuggestions.push("drink Margarita", "drink Mojito", "random drink");
    }

    if ("my ip".startsWith(cleanInput) || "ip".startsWith(cleanInput)) {
        customSuggestions.push("my ip", "ip lookup");
    }

    if ("trivia".startsWith(cleanInput) || "quiz".startsWith(cleanInput)) {
        customSuggestions.push("trivia", "quiz");
    }

    if ("free games".startsWith(cleanInput) || "deals".startsWith(cleanInput) || "giveaways".startsWith(cleanInput)) {
        customSuggestions.push("free games", "deals", "giveaways");
    }

    if ("joke".startsWith(cleanInput) || "make me laugh".startsWith(cleanInput)) {
        customSuggestions.push("joke", "tell me a joke", "make me laugh");
    }

    if ("song".startsWith(cleanInput) || cleanInput.startsWith("song")) {
        if (cleanInput === "song" || cleanInput === "song ") {
            customSuggestions.push("song Bohemian Rhapsody", "song Blinding Lights", "song Starboy", "song Shape of You");
        }
    }

    if ("anime".startsWith(cleanInput) || cleanInput.startsWith("anime")) {
        if (cleanInput === "anime" || cleanInput === "anime ") {
            customSuggestions.push("anime Attack on Titan", "anime Jujutsu Kaisen", "anime Naruto", "anime One Piece");
        }
    }

    if ("manga".startsWith(cleanInput) || cleanInput.startsWith("manga")) {
        if (cleanInput === "manga" || cleanInput === "manga ") {
            customSuggestions.push("manga Berserk", "manga Chainsaw Man", "manga One Piece", "manga Tokyo Ghoul");
        }
    }

    if ("pokemon".startsWith(cleanInput) || cleanInput.startsWith("pokemon")) {
        if (cleanInput === "pokemon" || cleanInput === "pokemon ") {
            customSuggestions.push("pokemon Pikachu", "pokemon Charizard", "pokemon Gengar", "pokemon Mewtwo");
        }
    }

    if ("book".startsWith(cleanInput) || cleanInput.startsWith("book")) {
        if (cleanInput === "book" || cleanInput === "book ") {
            customSuggestions.push("book The Hobbit", "book 1984", "book Harry Potter", "book The Great Gatsby");
        }
    }

    if ("news".startsWith(cleanInput) || cleanInput.startsWith("news")) {
        const newsPresets = ["news", "top news", "news about technology", "news about gaming", "news about science", "news about space", "news about artificial intelligence"];
        newsPresets.forEach(p => {
            if (p.startsWith(cleanInput) || p.includes(cleanInput)) customSuggestions.push(p);
        });
    }

    if ("movie".startsWith(cleanInput) || cleanInput.startsWith("movie")) {
        if (cleanInput === "movie" || cleanInput === "movie ") {
            customSuggestions.push("movie Superman", "movie Batman", "movie Inception", "movie Interstellar");
        }
    }

    if (searchAbortController) searchAbortController.abort();
    if (trimmedQuery.length < 2 || trimmedQuery.toLowerCase().startsWith('open ') || /\.[a-z]{2,6}/i.test(trimmedQuery)) {
        updateDatalist([], [], [], customSuggestions); 
        clearTimeout(debounceTimer); 
        return; 
    }

    let searchUrlQuery = trimmedQuery.replace(/map of |show map |weather in |time in |sunset in |sunset |sunrise in |sunrise |solar /i, "").trim();
    searchUrlQuery = searchUrlQuery.replace(/order me a |order a |order some |order | near me|find /i, "").trim();
    let baseGeoSearch = searchUrlQuery.split(',')[0].trim();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchAbortController = new AbortController();
        const signal = searchAbortController.signal;

        const geoFetch = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(baseGeoSearch)}&count=5&language=en&format=json`, { signal })
            .then(res => res.json()).then(data => data.results || []).catch(() => []);
        const wikiFetch = fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`, { signal })
            .then(res => res.json()).then(data => data.query?.search?.map(item => item.title) || []).catch(() => []);
        const wikitubiaFetch = fetch(`https://youtube.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchUrlQuery)}&utf8=&format=json&origin=*`, { signal })
            .then(res => res.json()).then(data => data.query?.search?.map(item => item.title) || []).catch(() => []);

        let omdbSuggestionsFetch = Promise.resolve([]);
        if (cleanInput.startsWith("movie ")) {
            let mTerm = trimmedQuery.substring(6).trim();
            if (mTerm.length >= 2) {
                omdbSuggestionsFetch = fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(mTerm)}&apikey=${OMDB_API_KEY}`, { signal })
                    .then(res => res.json())
                    .then(data => data.Search ? data.Search.slice(0, 5).map(m => `movie ${m.Title}`) : [])
                    .catch(() => []);
            }
        }

        let itunesSuggestionsFetch = Promise.resolve([]);
        if (cleanInput.startsWith("song ")) {
            let sTerm = trimmedQuery.substring(5).trim();
            if (sTerm.length >= 2) {
                itunesSuggestionsFetch = fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(sTerm)}&entity=song&limit=4`, { signal })
                    .then(res => res.json())
                    .then(data => data.results ? data.results.map(r => `song ${r.trackName} - ${r.artistName}`) : [])
                    .catch(() => []);
            }
        }

        let gnewsSuggestionsFetch = Promise.resolve([]);
        if (cleanInput.startsWith("news about ")) {
            let nTerm = trimmedQuery.substring(11).trim();
            if (nTerm.length >= 2) {
                const liveNewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(nTerm)}&lang=en&apikey=${GNEWS_API_KEY}`;
                gnewsSuggestionsFetch = fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(liveNewsUrl)}`, { signal })
                    .then(res => res.json())
                    .then(data => data.articles ? data.articles.slice(0, 3).map(a => `news about ${a.title.substring(0, 32)}...`) : [])
                    .catch(() => []);
            }
        }

        Promise.all([geoFetch, wikiFetch, wikitubiaFetch, omdbSuggestionsFetch, itunesSuggestionsFetch, gnewsSuggestionsFetch]).then(([cities, wikiTitles, wikitubiaTitles, omdbTitles, itunesTitles, gnewsTitles]) => {
            let combinedCustom = [...customSuggestions, ...omdbTitles, ...itunesTitles, ...gnewsTitles];
            updateDatalist(cities, wikiTitles, wikitubiaTitles, combinedCustom);
        }).catch(() => {});
    }, 300);
});

// SAFE PROTECTED EXECUTE HANDLER
executeActionBtn?.addEventListener('click', () => {
    const query = (hubInput?.value || "").trim();
    const modeEl = document.querySelector('input[name="vaii-mode"]:checked');
    const mode = modeEl ? modeEl.value : "native";
    
    if (!query && !activeImageBase64) return;
    
    if (hubInput) hubInput.value = "";
    if (routingWarning) routingWarning.style.display = "none";
    
    if (activeImageBase64) {
        executeVisionAnalysis(query || "Describe this image content in clear detail.");
        return;
    }

    if (mode === "gemini") {
        executeGeminiDirectChat(query);
    } else {
        if (query.toLowerCase().startsWith("draw ")) {
            executeImageGeneration(query.substring(5).trim());
        } else {
            runInfoExecution(query);
        }
    }
});

hubInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeActionBtn?.click();
});

googleSigninBtn?.addEventListener('click', () => {
    authError.style.display = "none";
    signInWithPopup(auth, googleProvider)
        .catch(err => showAuthError(err));
});

authToggle?.addEventListener('click', () => {
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    authError.style.display = "none";
    authTitle.innerText = isLoginMode ? "✨ Create Account" : "🔒 Account Sign In";
    authSubmitBtn.innerText = isLoginMode ? "Register User" : "Log In";
    authToggle.innerText = isLoginMode ? "Already have an account? Sign In" : "Need an account? Register instead";
});

authSubmitBtn?.addEventListener('click', () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    authError.style.display = "none";
    if (!email || !password) return showAuthError("Please fill out all credentials.");
    
    if (isLoginMode) signInWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err));
    else createUserWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err));
});

logoutActionBtn?.addEventListener('click', () => signOut(auth).catch(err => console.error(err)));

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = "none";
        mainApp.style.display = "block";
        initializeFreshChatSession();
        clearActiveImage();
        renderHistoryListItems();
        if (prefsInstructionsInput) prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        if (prefsApiKeyInput) prefsApiKeyInput.value = localStorage.getItem('vaii_custom_api_key') || '';
        updateDatalist([], [], [], []);
    } else {
        authContainer.style.display = "block";
        mainApp.style.display = "none";
    }
});

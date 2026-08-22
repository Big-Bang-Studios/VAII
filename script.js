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
        if (d) {
            d.style.display = "none";
        }
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
// 4. NEW UTILITY INTEGRATIONS (FOREX, QR, ISS)
// ==========================================
function fetchForexConversion(amount, fromCurr, toCurr) {
    const from = fromCurr.toUpperCase().trim();
    const to = toCurr.toUpperCase().trim();
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
                    handleVaiiDataOutput(`Could not convert from ${from} to ${to}.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Currency conversion failed. Verify ISO-3 codes (e.g. USD, EUR, GBP, JPY).</div>`);
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

// ==========================================
// 5. NATIVE MODULES (MAPS, WEATHER, VISION, FOOD)
// ==========================================
function executeLocalFoodSearch(queryText) {
    routingWarning.style.display = "none";
    
    let originalQuery = queryText.trim();
    let cleanQuery = originalQuery.toLowerCase();
    let explicitLocation = "";
    
    const locInMatch = originalQuery.match(/\s+in\s+(.+)$/i);
    const locNearMatch = originalQuery.match(/\s+near\s+(.+)$/i);
    
    if (locInMatch) {
        explicitLocation = locInMatch[1].trim();
        cleanQuery = originalQuery.substring(0, locInMatch.index).toLowerCase().trim();
    } else if (locNearMatch) {
        explicitLocation = locNearMatch[1].trim();
        cleanQuery = originalQuery.substring(0, locNearMatch.index).toLowerCase().trim();
    }

    let dbMatch = null;
    let searchItemName = cleanQuery;
    let searchBrandName = "";

    let category = Object.keys(LOCAL_FOOD_DB).find(key => cleanQuery.includes(key));
    if (category) {
        const options = LOCAL_FOOD_DB[category];
        dbMatch = options[Math.floor(Math.random() * options.length)];
        searchBrandName = dbMatch.name;
        searchItemName = dbMatch.item;
    } else {
        for (let cat in LOCAL_FOOD_DB) {
            let brand = LOCAL_FOOD_DB[cat].find(b => {
                let normName = b.name.toLowerCase().replace(/['\s]/g, '');
                let normQuery = cleanQuery.replace(/['\s]/g, '');
                return normQuery.includes(normName) || normName.includes(normQuery);
            });
            if (brand) {
                dbMatch = brand;
                searchBrandName = dbMatch.name;
                searchItemName = dbMatch.item;
                break;
            }
        }
    }

    if (!searchBrandName) {
        searchBrandName = cleanQuery; 
    }

    let placesSearchQuery = searchBrandName;
    if (explicitLocation) {
        placesSearchQuery += ` in ${explicitLocation}`;
    }

    output.innerHTML = `
        <div class="generation-status">
            <div class="loader-spinner"></div>
            <span style="color: #eee; font-size: 0.9rem;">Processing order request for "${searchItemName}"...</span>
        </div>
    `;

    const renderFallbackCard = (brandName, suggestionText, fallbackLoc) => {
        const locString = fallbackLoc ? ` ${fallbackLoc}` : "";
        const cleanFallbackString = (brandName + locString).replace(/[^a-zA-Z0-9 ,]/g, '');
        const encFallback = encodeURIComponent(cleanFallbackString);
        
        const ddLink = `https://www.doordash.com/search/store/${encFallback}/`;
        const goLink = `https://www.google.com/search?q=Order+delivery+from+${encFallback}`;

        const htmlOutput = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #007bff; text-align: left; margin-bottom: 15px;">
                <div style="font-size: 0.8rem; color: #007bff; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🍔 VAII Database Suggestion</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 8px;">${brandName}</div>
                <div style="color: #ccc; font-size: 0.95rem; margin-bottom: 15px;">💡 Suggested: <strong>${suggestionText || queryText}</strong> ${fallbackLoc ? 'near ' + fallbackLoc : ''}</div>
                
                <div style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Auto-Routing Delivery Links</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="${ddLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #FF3008; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>Route to DoorDash</span><span>➔</span>
                    </a>
                    <a href="${goLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #4285F4; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>Google Local Order</span><span>➔</span>
                    </a>
                </div>
            </div>
        `;
        handleVaiiDataOutput(`I suggest ordering ${suggestionText || queryText} from ${brandName}.`, htmlOutput);
    };

    const processPlacesSearch = (lat, lon) => {
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            return renderFallbackCard(searchBrandName, searchItemName, explicitLocation);
        }

        const request = { query: placesSearchQuery };
        if (lat && lon) {
            request.location = new google.maps.LatLng(lat, lon);
            request.radius = '16000';
        }

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                const bestPlace = results[0];
                
                const placeName = bestPlace.name;
                const rating = bestPlace.rating || "N/A";
                const address = bestPlace.formatted_address || "";
                
                const cleanAddressSearch = (placeName + " " + address).replace(/[^a-zA-Z0-9 ,]/g, '');
                const encQuery = encodeURIComponent(cleanAddressSearch);
                
                const googleOrderLink = `https://www.google.com/search?q=Order+delivery+from+${encQuery}`;
                const doorDashLink = `https://www.doordash.com/search/store/${encQuery}/`;
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + " " + address)}`;

                let suggestionHTML = dbMatch ? `<div style="color: #ccc; font-size: 0.95rem; margin-bottom: 4px;">💡 Suggested: <strong>${searchItemName}</strong></div>` : "";

                const htmlOutput = `
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: left; margin-bottom: 15px;">
                        <div style="font-size: 0.8rem; color: #ff9800; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🍔 GPS Confirmed Match</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 8px;">${placeName}</div>
                        ${suggestionHTML}
                        <div style="color: #ccc; font-size: 0.95rem; margin-bottom: 4px;">⭐ Rating: ${rating} / 5.0</div>
                        <a href="${mapLink}" target="_blank" style="color: #ff9800; text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 15px;">📍 ${address} ↗</a>
                        
                        <div style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Auto-Routing Delivery Links</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <a href="${doorDashLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #FF3008; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>Route to DoorDash</span><span>➔</span>
                            </a>
                            <a href="${googleOrderLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #4285F4; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>Google Local Order</span><span>➔</span>
                            </a>
                        </div>
                    </div>
                `;
                handleVaiiDataOutput(`I found a match. ${placeName} has a rating of ${rating} stars.`, htmlOutput);
            } else {
                return renderFallbackCard(searchBrandName, searchItemName, explicitLocation);
            }
        });
    };

    if (explicitLocation) {
        processPlacesSearch(null, null);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => { processPlacesSearch(position.coords.latitude, position.coords.longitude); },
            () => { processPlacesSearch(null, null); }
        );
    } else {
        processPlacesSearch(null, null);
    }
}

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
    output.innerHTML = greetingHTML + `<div class="generation-status"><div class="loader-spinner"></div> Loading weather for "${displayName}"...</div>`;
    
    const tzParam = (zone && zone !== 'auto') ? `&timezone=${encodeURIComponent(zone)}` : '&timezone=auto';
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true${tzParam}`)
        .then(res => res.json())
        .then(weatherData => {
            if (!weatherData.current_weather) {
                throw new Error("Missing weather metrics");
            }
            const tempCelsius = weatherData.current_weather.temperature;
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            const windSpeed = weatherData.current_weather.windspeed;
            
            const effectiveTz = weatherData.timezone || zone || "UTC";
            let timeString = "N/A";
            let dateString = "N/A";
            try {
                timeString = new Date().toLocaleTimeString("en-US", { timeZone: effectiveTz, hour: '2-digit', minute: '2-digit' });
                dateString = new Date().toLocaleDateString("en-US", { timeZone: effectiveTz, weekday: 'long', month: 'short', day: 'numeric' });
            } catch(e) {
                timeString = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
                dateString = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
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
                    <span style="color: #888; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 6px;">Interactive Mapping</span>
                    <div id="vaii-merged-map-canvas" style="width:100%; height:250px; border-radius:8px; background:#252525; border: 1px solid #333;"></div>
                </div>
            `;
            
            handleVaiiDataOutput(`Here is the location data for ${displayName}. It is currently ${tempFahrenheit} degrees Fahrenheit.`, htmlOutput, () => {
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

    let searchUrlQuery = trimmedQuery.replace(/map of |show map |weather in |time in /i, "").trim();
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

executeActionBtn?.addEventListener('click', () => {
    const query = hubInput.value.trim();
    const mode = document.querySelector('input[name="vaii-mode"]:checked').value;
    
    if (!query && !activeImageBase64) return;
    
    hubInput.value = "";
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

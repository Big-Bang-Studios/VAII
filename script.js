import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, onAuthStateChanged, signOut 
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
    return (customKey && customKey.trim() !== '') ? customKey.trim() : GEMINI_VISION_KEY;
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
Object.keys(LOCAL_FOOD_DB).forEach(cat => ALL_FOOD_SUGGESTIONS.push(`Order ${cat}`));
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
    "Open Gemini", "193 lbs to kg", "Open YouTube", "BTC", "Time in Tokyo", 
    "Hello to Spanish", "Open Minecraft", "(12 * 4) / 2", "Map of Orlando", 
    "Song Bohemian Rhapsody", "Pokemon Charizard", "Anime Attack on Titan", "Manga Berserk", "Book The Hobbit",
    "Davenport, Florida", "Florida, United States", "Draw a neon cyberpunk switch console artwork"
];

window.initVaiiMap = function() {
    console.log("Maps system ready.");
};

// ==========================================
// 3. UTILS & RENDERERS
// ==========================================
function closeAllDrawers() {
    [helpGuide, changelogDrawer, historyDrawer, prefsDrawer].forEach(d => { if(d) d.style.display = "none"; });
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
        currentSession = { id: currentSessionId, title: customGeneratedTitle || fallbackTitle, history: chatHistory };
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
        option.setAttribute('data-tz', location.timezone);
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
    
    let html = `<div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ffc107; text-align: left;">
        <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">📝 My Notes</div>
        <div style="display: flex; flex-direction: column; gap: 8px;" id="notes-container"></div>
    </div>`;
    
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
                html += `<a href="${art.url}" target="_blank" style="display: block; background: #1a1a1a; padding: 12px; border-left: 3px solid #17a2b8; text-decoration: none; color: #fff; margin-bottom: 10px; border-radius: 8px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${art.title}</div>
                    <div style="font-size: 0.8rem; color: #888;">${art.source ? art.source.name : 'GNews'}</div>
                </a>`;
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
// MEDIA & UTILITY MODULES
// ==========================================
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

function fetchAnimeMAL(animeTitle) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying MyAnimeList anime data...</div>`;
    const endpoint = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeTitle)}&order_by=popularity&sort=asc&sfw=true&limit=1`;

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data.data || data.data.length === 0) {
                return fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeTitle)}&limit=1`)
                    .then(r => r.json())
                    .then(fallbackData => {
                        if (!fallbackData.data || fallbackData.data.length === 0) {
                            return handleVaiiDataOutput("No anime found for " + animeTitle, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No anime entry found for "${animeTitle}".</div>`);
                        }
                        renderAnimeCard(fallbackData.data[0]);
                    });
            }
            renderAnimeCard(data.data[0]);
        })
        .catch(err => {
            console.error("Jikan Anime Error:", err);
            handleVaiiDataOutput("Anime lookup failed. Rate limit or network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Anime lookup failed. API rate limit reached or network error. Please try again in a moment.</div>`);
        });

    function renderAnimeCard(anime) {
        const genres = (anime.genres || []).map(g => g.name).join(", ");
        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #2e51a2; text-align: left; display: flex; gap: 15px;">
                ${anime.images?.jpg?.image_url ? `<img src="${anime.images.jpg.image_url}" style="width: 95px; border-radius: 8px; object-fit: cover; border: 1px solid #333;">` : ''}
                <div>
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff; margin-bottom: 3px;">⛩️ ${anime.title}</div>
                    <div style="color: #ffc107; font-size: 0.85rem; margin-bottom: 6px;">⭐ MAL Score: ${anime.score || 'N/A'} | ${anime.episodes || '?'} eps (${anime.status})</div>
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 8px;">Genres: ${genres || 'N/A'}</div>
                    <div style="color: #ccc; font-size: 0.86rem; line-height: 1.4; max-height: 110px; overflow-y: auto;">${anime.synopsis || 'No synopsis provided.'}</div>
                </div>
            </div>
        `;
        handleVaiiDataOutput(`${anime.title}, rating is ${anime.score || 'unrated'}. ${anime.synopsis || ''}`, html);
    }
}

function fetchMangaMAL(mangaTitle) {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Querying MyAnimeList manga data...</div>`;
    const endpoint = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(mangaTitle)}&order_by=popularity&sort=asc&sfw=true&limit=1`;

    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data.data || data.data.length === 0) {
                return fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(mangaTitle)}&limit=1`)
                    .then(r => r.json())
                    .then(fallbackData => {
                        if (!fallbackData.data || fallbackData.data.length === 0) {
                            return handleVaiiDataOutput("No manga found for " + mangaTitle, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No manga entry found for "${mangaTitle}".</div>`);
                        }
                        renderMangaCard(fallbackData.data[0]);
                    });
            }
            renderMangaCard(data.data[0]);
        })
        .catch(err => {
            console.error("Jikan Manga Error:", err);
            handleVaiiDataOutput("Manga lookup failed. Rate limit or network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Manga lookup failed. API rate limit reached or network error. Please try again in a moment.</div>`);
        });

    function renderMangaCard(manga) {
        const genres = (manga.genres || []).map(g => g.name).join(", ");
        const authors = (manga.authors || []).map(a => a.name).join(", ");
        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #bc223b; text-align: left; display: flex; gap: 15px;">
                ${manga.images?.jpg?.image_url ? `<img src="${manga.images.jpg.image_url}" style="width: 95px; border-radius: 8px; object-fit: cover; border: 1px solid #333;">` : ''}
                <div>
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff; margin-bottom: 3px;">📚 ${manga.title}</div>
                    <div style="color: #ffc107; font-size: 0.85rem; margin-bottom: 4px;">⭐ MAL Score: ${manga.score || 'N/A'} | ${manga.chapters ? manga.chapters + ' chapters' : 'Ongoing'} (${manga.status})</div>
                    <div style="color: #bc223b; font-size: 0.82rem; font-weight: 500; margin-bottom: 4px;">✍️ By ${authors || 'Unknown'}</div>
                    <div style="color: #aaa; font-size: 0.78rem; margin-bottom: 8px;">Genres: ${genres || 'N/A'}</div>
                    <div style="color: #ccc; font-size: 0.86rem; line-height: 1.4; max-height: 110px; overflow-y: auto;">${manga.synopsis || 'No synopsis provided.'}</div>
                </div>
            </div>
        `;
        handleVaiiDataOutput(`${manga.title}, manga score is ${manga.score || 'unrated'}. ${manga.synopsis || ''}`, html);
    }
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
                        <div style="font-size: 1.2rem; font-weight: bold; color: #fff; margin-bottom: 4px;">📖 ${book.title}</div>
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

// ==========================================
// 4. CHAT ENGINE (GEMINI FALLBACK LOOP)
// ==========================================
async function executeGeminiDirectChat(userInput) {
    if (chatHistory.length === 0) {
        const localInstructions = localStorage.getItem('vaii_gemini_instructions') || '';
        let systemPrompt = "You are Gemini, an advanced conversational core running inside the VAII architecture frame. STRICT STRUCTURAL RULE: You do NOT possess built-in web services, maps, currency handlers, weather telemetry, or drawing capabilities. All of those proprietary features belong exclusively to a completely separate system engine option on this dashboard named 'VAII Native'. Your singular purpose here is providing deep, persistent multi-turn conversational reasoning and textual chat history records. Keep statements direct and clear.";
        
        if (localInstructions.trim()) {
            systemPrompt += `\n\n[USER SYSTEM INSTRUCTIONS / REQUIRED PERSONALITY PARAMETERS]:\n${localInstructions.trim()}`;
        }

        chatHistory.push({ role: "user", parts: [{ text: systemPrompt }] });
        chatHistory.push({ role: "model", parts: [{ text: "System connection established. Isolated chat parameters synced. I am fully aware of my persona guidelines and that I do not contain VAII Native utilities." }] });
    }

    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    renderFullChatLogBubble();

    const spinnerBubble = document.createElement('div');
    spinnerBubble.id = "gemini-active-typing-indicator";
    spinnerBubble.style = "text-align: left; padding: 10px; color: #aaa; font-style: italic; display: flex; align-items: center;";
    spinnerBubble.innerHTML = `<div class="loader-spinner"></div> Syncing conversational context vectors...`;
    output.appendChild(spinnerBubble);
    output.scrollTop = output.scrollHeight;

    const sanitizedContents = chatHistory.map(msg => ({
        role: msg.role || "user",
        parts: (msg.parts || []).map(p => ({ text: p.text || "" }))
    }));

    let successfulResponseText = null;
    let successfulModelLabel = "";
    let structuralErrorDetected = null;

    const currentApiKey = getActiveGeminiKey();

    for (let i = 0; i < BASELINE_FALLBACK_TREE.length; i++) {
        const modelObj = BASELINE_FALLBACK_TREE[i];
        const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelObj.id}:generateContent?key=${currentApiKey}`;
        
        try {
            const response = await fetch(visionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: sanitizedContents })
            });
            const data = await response.json();

            if (data.error) {
                if (response.status === 400 || data.error.status === "INVALID_ARGUMENT") {
                    structuralErrorDetected = data.error.message;
                    break; 
                }
                console.warn(`Model generation tier [${modelObj.name}] quota full. Cascading downstream...`);
                continue; 
            }

            if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
                continue;
            }

            successfulResponseText = data.candidates[0].content.parts[0].text;
            successfulModelLabel = modelObj.name;
            break; 
        } catch (err) {
            console.error(`Network exception on model asset [${modelObj.name}]:`, err);
            continue;
        }
    }

    const indicatorNode = document.getElementById("gemini-active-typing-indicator");
    if (indicatorNode) indicatorNode.remove();

    if (structuralErrorDetected) {
        const errorDiv = document.createElement('div');
        errorDiv.style = "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left; margin-bottom: 10px;";
        errorDiv.innerHTML = `
            <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">⚠️ History Thread Structure Fault</div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5;">
                ${structuralErrorDetected}<br><br>
                <span style="color: #aaa; font-size: 0.85rem;">VAII automatically dropped your last submission entry to keep this specific session from breaking permanently.</span>
            </div>
        `;
        output.appendChild(errorDiv);
        chatHistory.pop(); 
        return;
    }

    if (successfulResponseText !== null) {
        chatHistory.push({ 
            role: "model", 
            parts: [{ text: successfulResponseText }],
            activeModelName: successfulModelLabel 
        });

        renderFullChatLogBubble();
        saveCurrentSessionState();

        if (autoSpeak) {
            let cleanResponse = successfulResponseText.replace(/[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
            speakText(cleanResponse);
            autoSpeak = false;
        }

        if (chatHistory.length === 4) {
            triggerBackgroundTitleGeneration(chatHistory[2].parts[0].text, successfulResponseText, successfulModelLabel);
        }
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.style = "background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left; margin-bottom: 10px;";
        errorDiv.innerHTML = `
            <div style="font-size: 0.75rem; color: #ff4d4d; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">🚨 Critical Server Outage Alert</div>
            <div style="color: #eee; font-size: 0.95rem; line-height: 1.5; font-weight: 500;">
                Every single fallback layer inside the model matrix has completely exhausted its rate-limit quotas. Please wait for token limits to clear.
            </div>
        `;
        output.appendChild(errorDiv);
        chatHistory.pop(); 
    }
}

async function triggerBackgroundTitleGeneration(userMsg, modelResponse, runningModelId) {
    const titlePrompt = `Generate a short, highly descriptive 3 to 5 word summary title for this chat based on these two statements. Respond with ONLY the clean summary text directly, no intro text, no markdown styling markers, and no outer quotation characters.\n\nUser text: "${userMsg}"\nModel text: "${modelResponse}"`;
    const payloadContents = [{ role: "user", parts: [{ text: titlePrompt }] }];
    const activeModel = BASELINE_FALLBACK_TREE.find(m => m.name === runningModelId) || BASELINE_FALLBACK_TREE[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel.id}:generateContent?key=${getActiveGeminiKey()}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: payloadContents })
        });
        const data = await response.json();
        let cleanedTitle = data.candidates[0].content.parts[0].text.trim().replace(/['"]+/g, ''); 
        if (cleanedTitle && cleanedTitle.length > 2) {
            saveCurrentSessionState(cleanedTitle);
        }
    } catch (e) {
        console.error("Dynamic title loop exception:", e);
    }
}

// ==========================================
// 6. ROUTING LOGIC (VAII NATIVE)
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

    if (cleanQuery.startsWith("song ") || cleanQuery.startsWith("music ") || cleanQuery.startsWith("track ")) {
        return fetchSongTrack(cleanQuery.replace(/^(song|music|track)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("anime ")) {
        return fetchAnimeMAL(cleanQuery.replace(/^anime\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("manga ")) {
        return fetchMangaMAL(cleanQuery.replace(/^manga\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("pokemon ") || cleanQuery.startsWith("pokedex ")) {
        return fetchPokemonEntry(cleanQuery.replace(/^(pokemon|pokedex)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("book ") || cleanQuery.startsWith("novel ")) {
        return fetchOpenLibraryBook(cleanQuery.replace(/^(book|novel)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("news about ")) return fetchNewsAPI(query.substring(11).trim());
    if (cleanQuery === "top news" || cleanQuery === "news") return fetchNewsAPI("");

    if (cleanQuery.startsWith("movie ") || cleanQuery.startsWith("film ")) {
        return fetchOMDBMedia(cleanQuery.replace(/^(movie|film)\s+/i, '').trim());
    }

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

    const options = Array.from(datalist.options);
    const matchedOption = options.find(opt => opt.value.toLowerCase() === cleanQuery);
    if (matchedOption && matchedOption.getAttribute('data-lat')) {
        renderUnifiedLocationCard(matchedOption.getAttribute('data-lat'), matchedOption.getAttribute('data-lon'), matchedOption.getAttribute('data-tz'), matchedOption.value, greetingHTML);
        return;
    }

    const isExplicitLocationIntent = cleanQuery.startsWith("map of ") || cleanQuery.startsWith("show map ") || cleanQuery.startsWith("time in ") || cleanQuery.startsWith("weather in ") || cleanQuery.startsWith("weather ") || cleanQuery.startsWith("clock ");

    if (isExplicitLocationIntent) {
        let parsedLocation = query.replace(/map of /i, "").replace(/show map /i, "").replace(/time in /i, "").replace(/weather in /i, "").replace(/weather /i, "").replace(/clock /i, "").trim();
        
        output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Locating coordinates for "${parsedLocation}"...</div>`;

        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsedLocation)}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const loc = data.results[0];
                    renderUnifiedLocationCard(loc.latitude, loc.longitude, loc.timezone, `${loc.name}, ${loc.admin1 || ''} (${loc.country})`, greetingHTML);
                } else {
                    handleVaiiDataOutput("Could not extract metrics for " + parsedLocation, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Could not extract metrics for "${parsedLocation}".</div>`);
                }
            }).catch(() => { handleVaiiDataOutput("Location processing engine connection failure.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Location processing engine connection failure.</div>`); });
        return;
    }

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

    if (/\.[a-z]{2,6}/i.test(query) || query.startsWith('http://') || query.startsWith('https://')) {
        let cleanUrl = query.startsWith('http') ? query : 'https://' + query;
        launchTargetUrl(cleanUrl);
        return;
    }

    if (cryptoMap[cleanQuery] || cleanQuery.startsWith("price of ")) {
        runMarketExecution(cleanQuery.startsWith("price of ") ? cleanQuery.substring(9).trim() : cleanQuery);
        return;
    }

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

    if (query.includes(",")) {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`)
            .then(res => res.json())
            .then(geoData => {
                if (geoData.results && geoData.results.length > 0) {
                    const loc = geoData.results[0];
                    let formattedName = `${loc.name}`;
                    if (loc.admin1 && loc.admin1 !== loc.name) formattedName += `, ${loc.admin1}`;
                    if (loc.country) formattedName += ` (${loc.country})`;

                    renderUnifiedLocationCard(loc.latitude, loc.longitude, loc.timezone, formattedName, greetingHTML);
                } else {
                    proceedWithWikiPipeline();
                }
            })
            .catch(() => {
                proceedWithWikiPipeline();
            });
    } else {
        proceedWithWikiPipeline();
    }

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

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchAbortController = new AbortController();
        const signal = searchAbortController.signal;

        const geoFetch = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchUrlQuery)}&count=5&language=en&format=json`, { signal })
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

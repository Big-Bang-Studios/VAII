import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect, 
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

const WMO_WEATHER_CODES = {
    0: { desc: "Clear Sky", icon: "☀️" },
    1: { desc: "Mainly Clear", icon: "🌤️" },
    2: { desc: "Partly Cloudy", icon: "⛅" },
    3: { desc: "Overcast", icon: "☁️" },
    45: { desc: "Foggy", icon: "🌫️" },
    48: { desc: "Depositing Rime Fog", icon: "🌫️" },
    51: { desc: "Light Drizzle", icon: "🌦️" },
    53: { desc: "Moderate Drizzle", icon: "🌦️" },
    55: { desc: "Dense Drizzle", icon: "🌧️" },
    61: { desc: "Slight Rain", icon: "🌦️" },
    63: { desc: "Moderate Rain", icon: "🌧️" },
    65: { desc: "Heavy Rain", icon: "🌧️" },
    71: { desc: "Slight Snow", icon: "🌨️" },
    73: { desc: "Moderate Snow", icon: "🌨️" },
    75: { desc: "Heavy Snow", icon: "❄️" },
    80: { desc: "Slight Rain Showers", icon: "🌦️" },
    81: { desc: "Moderate Showers", icon: "🌧️" },
    82: { desc: "Violent Rain Showers", icon: "⛈️" },
    95: { desc: "Thunderstorm", icon: "⛈️" },
    96: { desc: "Thunderstorm with Hail", icon: "⛈️" }
};

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
    ALL_FOOD_SUGGESTIONS.push(`Reserve ${cat}`);
});

Object.values(LOCAL_FOOD_DB).flat().forEach(b => {
    ALL_FOOD_SUGGESTIONS.push(`Order from ${b.name}`);
    ALL_FOOD_SUGGESTIONS.push(`Reserve table at ${b.name}`);
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
let activeTimerInterval = null;
let termEnvironment = {
    "USER": "guest",
    "HOSTNAME": "vaii",
    "HOME": "/home/guest",
    "SHELL": "/bin/sh",
    "PATH": "/bin:/usr/bin",
    "TERM": "xterm-256color"
};
let termAliases = {};
const terminalStartTime = Date.now();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const welcomeVaiiText = `Welcome to VAII Native! Enter a search query, app routing command, calculation sequence, weather location, translation phrase, crypto ticker, map request, or art prompt to begin...`;
const welcomeGeminiText = `Welcome to the Gemini Ecosystem! This is a persistent conversational space. Start typing below to begin a continuous chat thread...`;

const defaultAssistantSuggestions = [
    "terminal",
    "/terminal",
    "Open Gemini", 
    "Play Blinding Lights",
    "Mars Rover",
    "Veritasium",
    "Timer 5m",
    "Stopwatch",
    "Repo facebook/react",
    "Convert 100 USD to EUR",
    "QR https://vaii-two.vercel.app",
    "Tickets Superman",
    "Stream Inception",
    "Reserve steak Orlando",
    "Order pizza",
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
// TERMINAL SANDBOX, VFS & EXTENDED UNIX ENGINE (PACKAGE MANAGER & SEPARATORS)
// ==========================================
const VFS_STORAGE_KEY = 'vaii_terminal_vfs';
const HISTORY_STORAGE_KEY = 'vaii_terminal_history';
const PKG_STORAGE_KEY = 'vaii_terminal_pkgs';

const SYSTEM_INIT_TIME = Date.now() - 86400000;

function getDefaultVFS() {
    return {
        "/": { type: "dir", children: ["home", "bin", "usr", "etc", "var", "tmp"], mtime: SYSTEM_INIT_TIME },
        "/home": { type: "dir", children: ["guest"], mtime: SYSTEM_INIT_TIME },
        "/home/guest": { type: "dir", children: ["readme.txt", "welcome.sh"], mtime: SYSTEM_INIT_TIME },
        "/home/guest/readme.txt": { type: "file", content: "Welcome to VAII Unix 3.0!\nInstall tools with: apt install python3 git\nTry: python3, git init, neofetch, pipes (|), &&, ||, ;", mtime: SYSTEM_INIT_TIME },
        "/home/guest/welcome.sh": { type: "file", content: "echo 'VAII Matrix Engine Online!'", mtime: SYSTEM_INIT_TIME },
        "/bin": { type: "dir", children: ["sh", "echo", "ls", "cat", "pwd", "apt", "pkg"], mtime: SYSTEM_INIT_TIME },
        "/usr": { type: "dir", children: ["bin"], mtime: SYSTEM_INIT_TIME },
        "/usr/bin": { type: "dir", children: [], mtime: SYSTEM_INIT_TIME },
        "/etc": { type: "dir", children: ["os-release", "hosts"], mtime: SYSTEM_INIT_TIME },
        "/etc/os-release": { type: "file", content: "NAME=\"VAII Linux-Subsystem\"\nVERSION=\"3.0.0 LTS\"\nID=vaii\nPRETTY_NAME=\"VAII Unix Sandbox 3.0\"", mtime: SYSTEM_INIT_TIME },
        "/etc/hosts": { type: "file", content: "127.0.0.1 localhost\n::1 localhost ip6-localhost", mtime: SYSTEM_INIT_TIME },
        "/var": { type: "dir", children: ["log"], mtime: SYSTEM_INIT_TIME },
        "/var/log": { type: "dir", children: ["syslog"], mtime: SYSTEM_INIT_TIME },
        "/var/log/syslog": { type: "file", content: "[SYSTEM_BOOT] VFS mounted successfully.\n[APT] Ready for packages.", mtime: SYSTEM_INIT_TIME },
        "/tmp": { type: "dir", children: [], mtime: SYSTEM_INIT_TIME }
    };
}

function getVFS() {
    try {
        const stored = JSON.parse(localStorage.getItem(VFS_STORAGE_KEY));
        if (stored && typeof stored === 'object' && stored["/"]) {
            Object.keys(stored).forEach(k => {
                if (!stored[k].mtime) stored[k].mtime = stored[k].ctime || SYSTEM_INIT_TIME;
            });
            return stored;
        }
        return getDefaultVFS();
    } catch (e) {
        return getDefaultVFS();
    }
}

function saveVFS(vfs) {
    localStorage.setItem(VFS_STORAGE_KEY, JSON.stringify(vfs));
}

function getInstalledPackages() {
    try {
        return JSON.parse(localStorage.getItem(PKG_STORAGE_KEY)) || ["coreutils", "apt", "bash"];
    } catch (e) {
        return ["coreutils", "apt", "bash"];
    }
}

function saveInstalledPackages(pkgs) {
    localStorage.setItem(PKG_STORAGE_KEY, JSON.stringify(pkgs));
}

function getTerminalHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveTerminalHistory(history) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(-100)));
}

let termCurrentPath = "/home/guest";
let termHistoryIndex = -1;

let heredocMode = false;
let heredocDelimiter = "EOF";
let heredocBuffer = [];
let heredocTargetFile = null;
let heredocAppend = false;

let pythonReplMode = false;
let pythonBuffer = [];

let nanoMode = false;
let nanoTargetFile = null;
let nanoBuffer = [];

function normalizePath(path) {
    if (!path) return "/";
    const parts = path.split('/').filter(Boolean);
    const resolved = [];
    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') {
            resolved.pop();
        } else {
            resolved.push(part);
        }
    }
    return '/' + resolved.join('/');
}

function resolvePath(target) {
    if (!target || target === ".") return termCurrentPath;
    if (target.startsWith("~")) target = "/home/guest" + target.slice(1);
    if (target.startsWith("/")) return normalizePath(target);
    const combined = (termCurrentPath === "/") ? `/${target}` : `${termCurrentPath}/${target}`;
    return normalizePath(combined);
}

function triggerBrowserDownload(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 1500);
}

function parseCommandPipeline(input) {
    const tokens = [];
    let current = "";
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (c === "'" && !inDouble) {
            inSingle = !inSingle;
            current += c;
        } else if (c === '"' && !inSingle) {
            inDouble = !inDouble;
            current += c;
        } else if (!inSingle && !inDouble) {
            if (c === ';') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: ';' });
                current = "";
            } else if (c === '&' && input[i + 1] === '&') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: '&&' });
                current = "";
                i++;
            } else if (c === '|' && input[i + 1] === '|') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: '||' });
                current = "";
                i++;
            } else if (c === '|') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: '|' });
                current = "";
            } else {
                current += c;
            }
        } else {
            current += c;
        }
    }
    if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
    return tokens;
}

function launchTerminalSandbox() {
    let termContainer = document.getElementById('vaii-terminal-overlay');
    if (!termContainer) {
        termContainer = document.createElement('div');
        termContainer.id = 'vaii-terminal-overlay';
        termContainer.style = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100dvh; 
            max-height: 100dvh;
            background: #0d1117; 
            color: #58a6ff; 
            font-family: 'Courier New', Courier, monospace;
            padding: 12px 14px; 
            box-sizing: border-box; 
            z-index: 99999; 
            display: flex;
            flex-direction: column; 
            overflow: hidden;
        `;

        termContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 8px; margin-bottom: 6px; flex-shrink: 0;">
                <span style="color: #7ee787; font-weight: bold; font-size: 0.9rem;">⚡ VAII Unix Terminal Sandbox [v3.0 Extended]</span>
                <span style="color: #8b949e; font-size: 0.75rem;">Type 'exit' or 'logout' to return</span>
            </div>
            
            <div id="terminal-logs" style="flex: 1 1 auto; min-height: 0; overflow-y: auto; white-space: pre-wrap; line-height: 1.4; color: #c9d1d9; font-size: 0.9rem; padding-bottom: 8px;"></div>
            
            <div style="display: flex; align-items: center; gap: 6px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 8px 10px; margin-top: auto; flex-shrink: 0;">
                <span id="terminal-prompt" style="color: #7ee787; font-weight: bold; font-size: 0.85rem; white-space: nowrap;">${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$</span>
                <input id="terminal-cli-input" type="text" autocomplete="off" spellcheck="false" placeholder="type a command..." style="
                    flex: 1; background: transparent; border: none; outline: none; color: #f0f6fc;
                    font-family: inherit; font-size: 0.9rem; padding: 0; margin: 0;
                ">
            </div>
        `;
        document.body.appendChild(termContainer);
    } else {
        termContainer.style.display = "flex";
    }

    const logs = document.getElementById('terminal-logs');
    const input = document.getElementById('terminal-cli-input');
    const prompt = document.getElementById('terminal-prompt');

    logs.innerHTML = `VAII Extended Unix Environment Initialized.\nPOSIX Subsystem Ready. Package Manager Synced.\nType <span style="color:#e3b341;">help</span> to inspect shell commands.\n\n`;
    input.value = "";
    input.focus();

    termContainer.onclick = () => input.focus();

    input.onkeydown = (e) => {
        let history = getTerminalHistory();
        if (e.key === 'Enter') {
            const rawLine = input.value;
            
            if (heredocMode) {
                logs.innerHTML += `\n<span style="color:#e3b341;">></span> ${rawLine}\n`;
                if (rawLine.trim() === heredocDelimiter) {
                    let vfs = getVFS();
                    const fullContent = heredocBuffer.join("\n");
                    const targetPath = resolvePath(heredocTargetFile);
                    const prevContent = (heredocAppend && vfs[targetPath]?.content) ? vfs[targetPath].content + "\n" : "";
                    vfs[targetPath] = { type: "file", content: prevContent + fullContent, mtime: Date.now() };
                    
                    const fileNameOnly = targetPath.split('/').filter(Boolean).pop();
                    const parentDir = normalizePath(targetPath.substring(0, targetPath.lastIndexOf('/')) || '/');
                    
                    if (vfs[parentDir] && !vfs[parentDir].children.includes(fileNameOnly)) {
                        vfs[parentDir].children.push(fileNameOnly);
                    }
                    saveVFS(vfs);

                    logs.innerHTML += `<span style="color:#7ee787;">[Saved '${heredocTargetFile}' (${(prevContent + fullContent).length} bytes)]</span>\n`;
                    heredocMode = false;
                    heredocBuffer = [];
                    heredocTargetFile = null;
                    heredocAppend = false;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                } else if (rawLine.trim() === "cancel" || rawLine.trim() === "exit") {
                    heredocMode = false;
                    heredocBuffer = [];
                    heredocTargetFile = null;
                    heredocAppend = false;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                    logs.innerHTML += `<span style="color:#f85149;">[Heredoc aborted]</span>\n`;
                } else {
                    heredocBuffer.push(rawLine);
                }
                input.value = "";
                logs.scrollTop = logs.scrollHeight;
                return;
            }

            if (pythonReplMode) {
                logs.innerHTML += `\n<span style="color:#3572A5;">>>></span> ${rawLine}\n`;
                if (rawLine.trim() === "exit()" || rawLine.trim() === "quit()") {
                    pythonReplMode = false;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                    logs.innerHTML += `[Python REPL session closed]\n`;
                } else {
                    executePythonCode(rawLine, logs);
                }
                input.value = "";
                logs.scrollTop = logs.scrollHeight;
                return;
            }

            if (nanoMode) {
                logs.innerHTML += `\n${rawLine}\n`;
                if (rawLine.trim() === ":wq" || rawLine.trim() === ":q") {
                    if (rawLine.trim() === ":wq") {
                        let vfs = getVFS();
                        const targetPath = resolvePath(nanoTargetFile);
                        vfs[targetPath] = { type: "file", content: nanoBuffer.join("\n"), mtime: Date.now() };
                        const fileNameOnly = targetPath.split('/').filter(Boolean).pop();
                        const parentDir = normalizePath(targetPath.substring(0, targetPath.lastIndexOf('/')) || '/');
                        if (vfs[parentDir] && !vfs[parentDir].children.includes(fileNameOnly)) {
                            vfs[parentDir].children.push(fileNameOnly);
                        }
                        saveVFS(vfs);
                        logs.innerHTML += `<span style="color:#7ee787;">[Wrote ${nanoBuffer.length} lines to '${nanoTargetFile}']</span>\n`;
                    } else {
                        logs.innerHTML += `<span style="color:#8b949e;">[Quit without saving]</span>\n`;
                    }
                    nanoMode = false;
                    nanoBuffer = [];
                    nanoTargetFile = null;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                } else {
                    nanoBuffer.push(rawLine);
                }
                input.value = "";
                logs.scrollTop = logs.scrollHeight;
                return;
            }

            const rawCmd = rawLine.trim();
            if (rawCmd) {
                history.push(rawCmd);
                saveTerminalHistory(history);
                termHistoryIndex = history.length;
            }
            logs.innerHTML += `\n<span style="color:#7ee787;">${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$</span> ${rawLine}\n`;

            runCommandPipeline(rawCmd, logs, termContainer, prompt);

            input.value = "";
            if (!heredocMode && !pythonReplMode && !nanoMode) {
                prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
            }
            logs.scrollTop = logs.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            if (!heredocMode && !pythonReplMode && !nanoMode && termHistoryIndex > 0) {
                termHistoryIndex--;
                input.value = history[termHistoryIndex] || "";
            }
        } else if (e.key === 'ArrowDown') {
            if (!heredocMode && !pythonReplMode && !nanoMode) {
                if (termHistoryIndex < history.length - 1) {
                    termHistoryIndex++;
                    input.value = history[termHistoryIndex] || "";
                } else {
                    termHistoryIndex = history.length;
                    input.value = "";
                }
            }
        }
    };
}

function runCommandPipeline(rawCmd, logs, termContainer, prompt) {
    const tokens = parseCommandPipeline(rawCmd);
    let lastSuccess = true;
    let pipeInput = "";

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'op') {
            if (token.val === '&&' && !lastSuccess) {
                i++;
                continue;
            }
            if (token.val === '||' && lastSuccess) {
                i++;
                continue;
            }
            if (token.val === '|') {
                continue;
            }
            if (token.val === ';') {
                pipeInput = "";
                continue;
            }
        } else if (token.type === 'cmd') {
            const isPiped = (tokens[i + 1] && tokens[i + 1].val === '|');
            const result = executeShellCommand(token.val, logs, termContainer, prompt, pipeInput, isPiped);
            lastSuccess = result.success;
            pipeInput = result.output || "";
        }
    }
}

function executePythonCode(codeStr, logs) {
    try {
        let clean = codeStr.trim();
        if (clean.startsWith("print(") && clean.endsWith(")")) {
            let inner = clean.slice(6, -1);
            let evaluated = window.eval(inner);
            logs.innerHTML += `${evaluated}\n`;
        } else if (clean.includes("=")) {
            window.eval(`window._py_vars = window._py_vars || {}; var ${clean}`);
        } else {
            let res = window.eval(clean);
            if (res !== undefined) logs.innerHTML += `<span style="color:#3572A5;">${res}</span>\n`;
        }
    } catch (e) {
        logs.innerHTML += `<span style="color:#f85149;">Traceback (most recent call last):\n  File "&lt;stdin&gt;", line 1, in &lt;module&gt;\n${e.name}: ${e.message}</span>\n`;
    }
}

function executeShellCommand(cmdStr, logs, container, prompt, stdIn = "", captureOutput = false) {
    if (!cmdStr) return { success: true, output: "" };

    let outputBuffer = "";
    const printLog = (str, rawHtml = false) => {
        if (captureOutput) {
            outputBuffer += str;
        } else {
            logs.innerHTML += rawHtml ? str : `${str}`;
        }
    };

    let expandedCmd = cmdStr;
    const firstWord = cmdStr.split(" ")[0];
    if (termAliases[firstWord]) {
        expandedCmd = cmdStr.replace(firstWord, termAliases[firstWord]);
    }

    const heredocMatch = expandedCmd.match(/^cat\s*<<\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*(>>|>)\s*([^\s]+)/i);
    if (heredocMatch) {
        heredocDelimiter = heredocMatch[1];
        heredocAppend = heredocMatch[2] === ">>";
        heredocTargetFile = heredocMatch[3];
        heredocBuffer = [];
        heredocMode = true;
        if (prompt) {
            prompt.innerText = ">";
            prompt.style.color = "#e3b341";
        }
        logs.innerHTML += `<span style="color:#8b949e;">[Heredoc input started. Enter '${heredocDelimiter}' on a new line to ${heredocAppend ? 'append to' : 'write to'} ${heredocTargetFile}, or 'cancel']</span>\n`;
        return { success: true, output: "" };
    }

    const echoRedirectMatch = expandedCmd.match(/^echo\s+([\s\S]+?)\s*(>>|>)\s*([^\s]+)$/i);
    if (echoRedirectMatch) {
        let content = echoRedirectMatch[1].trim();
        const isAppend = echoRedirectMatch[2] === ">>";
        const filename = echoRedirectMatch[3].trim();

        if ((content.startsWith("'") && content.endsWith("'")) || (content.startsWith('"') && content.endsWith('"'))) {
            content = content.slice(1, -1);
        }

        let vfs = getVFS();
        const filePath = resolvePath(filename);
        const pureName = filePath.split('/').filter(Boolean).pop();
        const parentDir = normalizePath(filePath.substring(0, filePath.lastIndexOf('/')) || '/');

        const existingContent = (isAppend && vfs[filePath]?.content) ? vfs[filePath].content + "\n" : "";
        vfs[filePath] = { type: "file", content: existingContent + content, mtime: Date.now() };

        if (vfs[parentDir] && !vfs[parentDir].children.includes(pureName)) {
            vfs[parentDir].children.push(pureName);
        }
        saveVFS(vfs);
        return { success: true, output: "" };
    }

    const parts = expandedCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let vfs = getVFS();
    let pkgs = getInstalledPackages();

    switch (cmd) {
        case "exit":
        case "logout":
            container.style.display = "none";
            if (hubInput) hubInput.focus();
            return { success: true, output: "" };

        case "help":
            printLog(`Extended Unix Shell Utilities & Package Engine:
  <span style="color:#58a6ff;">apt / pkg install &lt;pkg&gt;</span> Install packages (python3, git, node, neofetch, cowsay, nano, htop)
  <span style="color:#58a6ff;">python3 [file.py]</span>       Interactive REPL or run script
  <span style="color:#58a6ff;">git &lt;init/status/add/commit/log/clone&gt;</span> Version control engine
  <span style="color:#58a6ff;">nano &lt;file&gt;</span>             Simple text editor (:wq to save, :q to quit)
  <span style="color:#58a6ff;">ls [-l]</span>                 List directory entries
  <span style="color:#58a6ff;">tree [path]</span>             Directory tree hierarchy
  <span style="color:#58a6ff;">pwd / cd &lt;dir&gt;</span>          Directory navigation
  <span style="color:#58a6ff;">cat / head / tail</span>       File inspection
  <span style="color:#58a6ff;">grep / wc / diff</span>        Text manipulation & pipes
  <span style="color:#58a6ff;">curl / wget &lt;url&gt;</span>       HTTP fetch
  <span style="color:#58a6ff;">Separators</span>              cmd1 ; cmd2 | cmd1 && cmd2 | cmd1 || cmd2 | cmd1 | cmd2\n`, true);
            return { success: true, output: outputBuffer };

        case "apt":
        case "apt-get":
        case "pkg":
            if (args[0] === "install") {
                const targetPkg = (args[1] || "").toLowerCase();
                const availablePkgs = {
                    "python3": ["python3", "python", "py"],
                    "python": ["python3", "python", "py"],
                    "git": ["git"],
                    "node": ["node", "nodejs", "npm"],
                    "nodejs": ["node", "nodejs", "npm"],
                    "neofetch": ["neofetch"],
                    "cowsay": ["cowsay"],
                    "nano": ["nano"],
                    "htop": ["htop"],
                    "gcc": ["gcc", "g++"]
                };

                if (!targetPkg) {
                    printLog(`Usage: ${cmd} install <package_name>\nAvailable packages: python3, git, node, neofetch, cowsay, nano, htop, gcc\n`);
                    return { success: false, output: outputBuffer };
                }

                if (availablePkgs[targetPkg]) {
                    printLog(`<span style="color:#8b949e;">Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${targetPkg}\nUnpacking ${targetPkg} (3.11.0-vaii)... Done\nSetting up ${targetPkg} (3.11.0-vaii)... Done</span>\n<span style="color:#7ee787;">Successfully installed ${targetPkg}.</span>\n`, true);
                    
                    if (!pkgs.includes(targetPkg)) {
                        pkgs.push(targetPkg);
                        saveInstalledPackages(pkgs);
                    }

                    vfs["/usr/bin"].children.push(targetPkg);
                    vfs[`/usr/bin/${targetPkg}`] = { type: "file", content: `#!/bin/sh\n# ${targetPkg} binary package`, mtime: Date.now() };
                    saveVFS(vfs);
                    return { success: true, output: outputBuffer };
                } else {
                    printLog(`<span style="color:#f85149;">E: Unable to locate package ${targetPkg}</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
            } else if (args[0] === "list" || args[0] === "search") {
                printLog(`Installed packages: ${pkgs.join(", ")}\nAvailable for install: python3, git, node, neofetch, cowsay, nano, htop, gcc\n`);
                return { success: true, output: outputBuffer };
            } else {
                printLog(`Usage: ${cmd} install <pkg> | ${cmd} list\n`);
                return { success: true, output: outputBuffer };
            }

        case "python":
        case "python3":
        case "py":
            if (!pkgs.includes("python3") && !pkgs.includes("python")) {
                printLog(`<span style="color:#f85149;">python3: command not found. Install it with: <span style="color:#58a6ff;">apt install python3</span></span>\n`, true);
                return { success: false, output: outputBuffer };
            }
            if (args[0]) {
                const pyFile = resolvePath(args[0]);
                if (vfs[pyFile] && vfs[pyFile].type === "file") {
                    executePythonCode(vfs[pyFile].content, logs);
                    return { success: true, output: outputBuffer };
                } else {
                    printLog(`<span style="color:#f85149;">python3: can't open file '${args[0]}': [Errno 2] No such file</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
            } else {
                pythonReplMode = true;
                prompt.innerText = ">>>";
                prompt.style.color = "#3572A5";
                printLog(`Python 3.11.0 (vaii-subsystem, ${new Date().toLocaleDateString()})\nType "help", "copyright", "credits" or "license" for more information.\nType exit() or quit() to return to shell.\n`);
                return { success: true, output: outputBuffer };
            }

        case "node":
        case "nodejs":
            if (!pkgs.includes("node") && !pkgs.includes("nodejs")) {
                printLog(`<span style="color:#f85149;">node: command not found. Install it with: <span style="color:#58a6ff;">apt install node</span></span>\n`, true);
                return { success: false, output: outputBuffer };
            }
            if (args[0]) {
                const jsFile = resolvePath(args[0]);
                if (vfs[jsFile] && vfs[jsFile].type === "file") {
                    try {
                        let res = window.eval(vfs[jsFile].content);
                        if (res !== undefined) printLog(`${res}\n`);
                    } catch (err) {
                        printLog(`<span style="color:#f85149;">NodeError: ${err.message}</span>\n`, true);
                    }
                    return { success: true, output: outputBuffer };
                }
            }
            printLog(`Welcome to Node.js v20.10.0.\nUse 'js <expr>' or 'node <file.js>' to execute.\n`);
            return { success: true, output: outputBuffer };

        case "git":
            if (!pkgs.includes("git")) {
                printLog(`<span style="color:#f85149;">git: command not found. Install it with: <span style="color:#58a6ff;">apt install git</span></span>\n`, true);
                return { success: false, output: outputBuffer };
            }
            const gitSub = args[0]?.toLowerCase();
            const gitConfigPath = resolvePath(".git");

            if (gitSub === "init") {
                vfs[resolvePath(".git")] = { type: "dir", children: ["config", "HEAD"], mtime: Date.now() };
                vfs[resolvePath(".git/HEAD")] = { type: "file", content: "ref: refs/heads/main\n", mtime: Date.now() };
                vfs[resolvePath(".git/config")] = { type: "file", content: "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n", mtime: Date.now() };
                const curDir = vfs[termCurrentPath];
                if (curDir && !curDir.children.includes(".git")) curDir.children.push(".git");
                saveVFS(vfs);
                printLog(`<span style="color:#7ee787;">Initialized empty Git repository in ${termCurrentPath}/.git/</span>\n`, true);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "status") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository (or any of the parent directories): .git</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const staged = vfs[resolvePath(".git/staged")]?.content ? vfs[resolvePath(".git/staged")].content.split("\n") : [];
                printLog(`On branch main\n${staged.length > 0 ? `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\t<span style="color:#7ee787;">${staged.join("\n\t")}</span>\n` : "nothing to commit, working tree clean\n"}`, true);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "add") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const targetAdd = args[1] || ".";
                vfs[resolvePath(".git/staged")] = { type: "file", content: targetAdd, mtime: Date.now() };
                saveVFS(vfs);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "commit") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const mIdx = args.indexOf("-m");
                const commitMsg = (mIdx !== -1 && args[mIdx + 1]) ? args.slice(mIdx + 1).join(" ").replace(/^['"]|['"]$/g, '') : "Update files";
                const commitHash = Math.random().toString(16).substring(2, 9);
                const logEntry = `commit ${commitHash}\nAuthor: ${termEnvironment.USER} <guest@vaii.local>\nDate:   ${new Date().toUTCString()}\n\n    ${commitMsg}\n\n`;
                const oldLog = vfs[resolvePath(".git/log")]?.content || "";
                vfs[resolvePath(".git/log")] = { type: "file", content: logEntry + oldLog, mtime: Date.now() };
                delete vfs[resolvePath(".git/staged")];
                saveVFS(vfs);
                printLog(`[main ${commitHash}] ${commitMsg}\n 1 file changed, ${Math.floor(Math.random() * 20) + 1} insertions(+)\n`);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "log") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const logContent = vfs[resolvePath(".git/log")]?.content;
                printLog(logContent || "fatal: your current branch 'main' does not have any commits yet\n");
                return { success: true, output: outputBuffer };
            } else if (gitSub === "clone") {
                const repoUrl = args[1];
                if (!repoUrl) {
                    printLog(`Usage: git clone <repository_url>\n`);
                    return { success: false, output: outputBuffer };
                }
                const folderName = repoUrl.split("/").pop().replace(".git", "");
                printLog(`Cloning into '${folderName}'...\nremote: Enumerating objects: 128, done.\nremote: Total 128 (delta 32), reused 128\nReceiving objects: 100% (128/128), done.\n`);
                const newRepoPath = resolvePath(folderName);
                vfs[newRepoPath] = { type: "dir", children: [".git", "README.md"], mtime: Date.now() };
                vfs[`${newRepoPath}/README.md`] = { type: "file", content: `# ${folderName}\nCloned from ${repoUrl}`, mtime: Date.now() };
                vfs[`${newRepoPath}/.git`] = { type: "dir", children: ["HEAD"], mtime: Date.now() };
                const parent = vfs[termCurrentPath];
                if (parent && !parent.children.includes(folderName)) parent.children.push(folderName);
                saveVFS(vfs);
                return { success: true, output: outputBuffer };
            } else {
                printLog(`git: '${args.join(" ")}' is not a git command. See 'git --help'.\n`);
                return { success: true, output: outputBuffer };
            }

        case "nano":
            if (!args[0]) {
                printLog(`Usage: nano <filename>\n`);
                return { success: false, output: outputBuffer };
            }
            nanoMode = true;
            nanoTargetFile = args[0];
            const existingNanoPath = resolvePath(nanoTargetFile);
            nanoBuffer = vfs[existingNanoPath]?.content ? vfs[existingNanoPath].content.split("\n") : [];
            prompt.innerText = `nano:${nanoTargetFile}>`;
            prompt.style.color = "#e3b341";
            printLog(`[ GNU nano 7.2 | Type lines to append. Type ':wq' to save & exit, ':q' to abort without saving ]\n`);
            if (nanoBuffer.length > 0) printLog(`--- Current Content ---\n${nanoBuffer.join("\n")}\n--- End Content ---\n`);
            return { success: true, output: outputBuffer };

        case "neofetch":
            printLog(`<span style="color:#58a6ff;">
       /\\         ${termEnvironment.USER}@${termEnvironment.HOSTNAME}
      /  \\        --------------------
     /\\   \\       OS: VAII Linux Subsystem x86_64
    /      \\      Host: Web Browser Virtual Sandbox
   /   ,,   \\     Kernel: 6.6.0-vaii-posix
  /   |  |  -\\    Uptime: ${Math.floor((Date.now() - terminalStartTime) / 1000)}s
 /_-''    ''-_\\   Shell: vaii-sh 3.0
                  Packages: ${pkgs.length} (pkg)
                  Memory: 512MiB / 2048MiB
</span>\n`, true);
            return { success: true, output: outputBuffer };

        case "cowsay":
            const cowMsg = stdIn || args.join(" ") || "Moo! VAII Terminal is awesome!";
            const border = "-".repeat(cowMsg.length + 2);
            printLog(` ${border}\n< ${cowMsg} >\n ${border}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n`);
            return { success: true, output: outputBuffer };

        case "htop":
            printLog(`  CPU[||||||||||               32.4%]   Tasks: 3, 1 thr; 1 running
  Mem[|||||||||||||||        142/2048MB]   Load average: 0.12 0.05 0.01
  Swp[                         0/1024MB]   Uptime: ${Math.floor((Date.now() - terminalStartTime) / 1000)}s

  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
    1 guest      20   0  120M  12M   4M S  0.0  0.6  0:00.08 init
   14 guest      20   0  140M  18M   6M S  0.1  0.9  0:00.14 vaii-sh
  210 guest      20   0  180M  32M   8M R 32.0  1.5  0:00.04 htop\n`);
            return { success: true, output: outputBuffer };

        case "clear":
            logs.innerHTML = "";
            return { success: true, output: "" };

        case "pwd":
            printLog(`${termCurrentPath}\n`);
            return { success: true, output: `${termCurrentPath}\n` };

        case "ls":
            const isLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
            const curDir = vfs[termCurrentPath];
            if (!curDir || curDir.type !== "dir") {
                printLog(`<span style="color:#f85149;">Error: Directory missing (${termCurrentPath}). Resetting to root.</span>\n`, true);
                termCurrentPath = "/";
                return { success: false, output: "" };
            }
            if (isLong) {
                let totalLines = `total ${curDir.children.length}\n`;
                curDir.children.forEach(name => {
                    const full = resolvePath(name);
                    const n = vfs[full];
                    const isDir = n?.type === "dir";
                    const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--";
                    const size = isDir ? 4096 : (n?.content?.length || 0);
                    const timestamp = n?.mtime || SYSTEM_INIT_TIME;
                    const dateStr = new Date(timestamp).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false 
                    });
                    totalLines += `${perms} 1 ${termEnvironment.USER} ${termEnvironment.USER} ${String(size).padStart(6, ' ')} ${dateStr} ${isDir ? `<span style="color:#58a6ff;font-weight:bold;">${name}/</span>` : name}\n`;
                });
                printLog(totalLines, true);
                return { success: true, output: totalLines };
            } else {
                const listing = curDir.children.map(name => {
                    const full = resolvePath(name);
                    return vfs[full]?.type === "dir" ? `<span style="color:#58a6ff; font-weight:bold;">${name}/</span>` : name;
                }).join("  ");
                printLog(`${listing || "(empty directory)"}\n`, true);
                return { success: true, output: curDir.children.join("\n") + "\n" };
            }

        case "tree":
            const treePath = args[0] ? resolvePath(args[0]) : termCurrentPath;
            if (!vfs[treePath] || vfs[treePath].type !== "dir") {
                printLog(`<span style="color:#f85149;">tree: [${args[0] || termCurrentPath}]: No such directory</span>\n`, true);
                return { success: false, output: "" };
            }
            const treeOut = `<span style="color:#58a6ff;font-weight:bold;">${treePath}</span>\n` + (renderTree(vfs, treePath) || "└── (empty)\n");
            printLog(treeOut, true);
            return { success: true, output: treeOut };

        case "cd":
            const targetDir = args[0] ? resolvePath(args[0]) : "/home/guest";
            if (vfs[targetDir] && vfs[targetDir].type === "dir") {
                termCurrentPath = targetDir;
                return { success: true, output: "" };
            } else {
                printLog(`<span style="color:#f85149;">cd: no such file or directory: ${args[0] || ""}</span>\n`, true);
                return { success: false, output: "" };
            }

        case "cat":
            const catTarget = args[0] ? resolvePath(args[0]) : null;
            const contentToDisplay = catTarget ? vfs[catTarget]?.content : stdIn;
            if (contentToDisplay !== undefined) {
                printLog(`${contentToDisplay}\n`);
                return { success: true, output: `${contentToDisplay}\n` };
            } else {
                printLog(`<span style="color:#f85149;">cat: ${args[0] || "stdin"}: No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "head":
            let headLines = 10;
            let hFile = args[0];
            if (args[0] === "-n" && args[1]) { headLines = parseInt(args[1], 10) || 10; hFile = args[2]; }
            const hText = hFile ? vfs[resolvePath(hFile)]?.content : stdIn;
            if (hText !== undefined) {
                const res = hText.split("\n").slice(0, headLines).join("\n");
                printLog(`${res}\n`);
                return { success: true, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">head: cannot open '${hFile || "stdin"}'</span>\n`, true);
            return { success: false, output: "" };

        case "tail":
            let tailLines = 10;
            let tFile = args[0];
            if (args[0] === "-n" && args[1]) { tailLines = parseInt(args[1], 10) || 10; tFile = args[2]; }
            const tText = tFile ? vfs[resolvePath(tFile)]?.content : stdIn;
            if (tText !== undefined) {
                const res = tText.split("\n").slice(-tailLines).join("\n");
                printLog(`${res}\n`);
                return { success: true, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">tail: cannot open '${tFile || "stdin"}'</span>\n`, true);
            return { success: false, output: "" };

        case "grep":
            const gPattern = args[0]?.replace(/^['"]|['"]$/g, '');
            const gFile = args[1] ? resolvePath(args[1]) : null;
            const gContent = gFile ? vfs[gFile]?.content : stdIn;
            if (gPattern && gContent !== undefined) {
                const matched = gContent.split("\n").filter(l => l.includes(gPattern));
                const res = matched.join("\n");
                printLog(`${res ? res + "\n" : ""}`);
                return { success: matched.length > 0, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">grep: pattern or input missing</span>\n`, true);
            return { success: false, output: "" };

        case "wc":
            const wcFile = args[args.length - 1];
            const wcText = (wcFile && vfs[resolvePath(wcFile)]) ? vfs[resolvePath(wcFile)].content : stdIn;
            if (wcText !== undefined) {
                const lines = wcText.split("\n").filter(Boolean).length;
                const words = wcText.trim() ? wcText.trim().split(/\s+/).length : 0;
                const chars = wcText.length;
                let res = `  ${lines}  ${words}  ${chars}`;
                if (args.includes("-l")) res = `${lines}`;
                else if (args.includes("-w")) res = `${words}`;
                else if (args.includes("-c")) res = `${chars}`;
                printLog(`${res} ${wcFile || ""}\n`);
                return { success: true, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">wc: file not found</span>\n`, true);
            return { success: false, output: "" };

        case "stat":
            if (!args[0]) {
                printLog(`Usage: stat <file/dir>\n`);
                return { success: false, output: outputBuffer };
            }
            const statPath = resolvePath(args[0]);
            if (vfs[statPath]) {
                const node = vfs[statPath];
                const res = `  File: ${args[0]}\n  Size: ${node.type === "file" ? node.content.length : 4096} bytes\n  Type: ${node.type === "file" ? "regular file" : "directory"}\nModify: ${new Date(node.mtime || SYSTEM_INIT_TIME).toISOString()}\n`;
                printLog(res);
                return { success: true, output: res };
            } else {
                printLog(`<span style="color:#f85149;">stat: cannot stat '${args[0]}': No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "download":
            if (!args[0]) {
                printLog(`Usage: download <filename>\n`);
                return { success: false, output: "" };
            }
            const dlPath = resolvePath(args[0]);
            if (vfs[dlPath] && vfs[dlPath].type === "file") {
                const pureName = args[0].split('/').filter(Boolean).pop();
                triggerBrowserDownload(pureName, vfs[dlPath].content);
                printLog(`<span style="color:#7ee787;">Downloaded '${pureName}' successfully.</span>\n`, true);
                return { success: true, output: "" };
            } else {
                printLog(`<span style="color:#f85149;">download: '${args[0]}': No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "touch":
            if (!args[0]) return { success: false, output: "" };
            const newFile = resolvePath(args[0]);
            if (!vfs[newFile]) {
                vfs[newFile] = { type: "file", content: "", mtime: Date.now() };
                const fileNameOnly = newFile.split('/').filter(Boolean).pop();
                const parentDir = normalizePath(newFile.substring(0, newFile.lastIndexOf('/')) || '/');
                if (vfs[parentDir] && !vfs[parentDir].children.includes(fileNameOnly)) {
                    vfs[parentDir].children.push(fileNameOnly);
                }
                saveVFS(vfs);
            } else {
                vfs[newFile].mtime = Date.now();
                saveVFS(vfs);
            }
            return { success: true, output: "" };

        case "mkdir":
            if (!args[0]) return { success: false, output: "" };
            const newDir = resolvePath(args[0]);
            if (!vfs[newDir]) {
                vfs[newDir] = { type: "dir", children: [], mtime: Date.now() };
                const dirNameOnly = newDir.split('/').filter(Boolean).pop();
                const parentDir = normalizePath(newDir.substring(0, newDir.lastIndexOf('/')) || '/');
                if (vfs[parentDir] && !vfs[parentDir].children.includes(dirNameOnly)) {
                    vfs[parentDir].children.push(dirNameOnly);
                }
                saveVFS(vfs);
            } else {
                vfs[newDir].mtime = Date.now();
                saveVFS(vfs);
            }
            return { success: true, output: "" };

        case "rm":
            if (!args[0]) return { success: false, output: "" };
            const rmTarget = resolvePath(args[0]);
            if (vfs[rmTarget]) {
                delete vfs[rmTarget];
                const targetNameOnly = rmTarget.split('/').filter(Boolean).pop();
                const parentDir = normalizePath(rmTarget.substring(0, rmTarget.lastIndexOf('/')) || '/');
                if (vfs[parentDir]) {
                    vfs[parentDir].children = vfs[parentDir].children.filter(c => c !== targetNameOnly);
                }
                saveVFS(vfs);
                return { success: true, output: "" };
            } else {
                printLog(`<span style="color:#f85149;">rm: cannot remove '${args[0]}': No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "echo":
            let fullEcho = args.join(" ");
            if ((fullEcho.startsWith("'") && fullEcho.endsWith("'")) || (fullEcho.startsWith('"') && fullEcho.endsWith('"'))) {
                fullEcho = fullEcho.slice(1, -1);
            }
            printLog(`${fullEcho}\n`);
            return { success: true, output: `${fullEcho}\n` };

        case "js":
            try {
                const evalCode = args.join(" ");
                const res = window.eval(evalCode);
                printLog(`<span style="color:#bc8cff;">${res !== undefined ? res : "undefined"}</span>\n`, true);
                return { success: true, output: `${res}\n` };
            } catch (err) {
                printLog(`<span style="color:#f85149;">EvalError: ${err.message}</span>\n`, true);
                return { success: false, output: "" };
            }

        case "whoami":
            printLog(`${termEnvironment.USER}\n`);
            return { success: true, output: `${termEnvironment.USER}\n` };

        case "uname":
            const unameStr = args.includes("-a") ? `Linux ${termEnvironment.HOSTNAME} 6.6.0-vaii-subsystem #1 SMP PREEMPT_DYNAMIC JavaScript/VFS x86_64 GNU/Linux\n` : `Linux\n`;
            printLog(unameStr);
            return { success: true, output: unameStr };

        case "resetfs":
            localStorage.removeItem(VFS_STORAGE_KEY);
            localStorage.removeItem(PKG_STORAGE_KEY);
            termCurrentPath = "/home/guest";
            printLog(`Virtual filesystem and package registries reset to factory defaults.\n`);
            return { success: true, output: "" };

        default:
            printLog(`<span style="color:#f85149;">command not found: ${cmd}</span>\n`, true);
            return { success: false, output: "" };
    }
}

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

function playTimerChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.12);
            osc.stop(ctx.currentTime + i * 0.12 + 0.35);
        });
    } catch(e) {
        console.warn("AudioContext error:", e);
    }
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
    if (!output) return;
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: bold; font-size: 1.1rem; color: #fff;">📝 My Notes & Tasks</span>
                <button id="clear-all-notes-btn" style="background: #dc3545; color: #fff; border: none; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; cursor: pointer;">Clear All</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;" id="notes-container"></div>
        </div>
    `;
    
    handleVaiiDataOutput("Here are your saved notes.", html, () => {
        const container = document.getElementById('notes-container');
        notes.forEach((note, index) => {
            const div = document.createElement('div');
            div.style = "display: flex; justify-content: space-between; align-items: center; background: #252525; padding: 8px 12px; border-radius: 6px;";
            div.innerHTML = `<span style="font-size: 0.9rem; color: #eee;">${note}</span> <button data-index="${index}" class="delete-note-btn" style="background:none; border:none; color:#dc3545; cursor:pointer; font-weight:bold; font-size:0.95rem; padding: 0 4px;" title="Delete note">✕</button>`;
            container.appendChild(div);
        });

        document.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let idx = parseInt(e.target.getAttribute('data-index'), 10);
                notes.splice(idx, 1);
                localStorage.setItem('vaii_notes', JSON.stringify(notes));
                renderNotesManager();
            });
        });

        document.getElementById('clear-all-notes-btn')?.addEventListener('click', () => {
            localStorage.removeItem('vaii_notes');
            renderNotesManager();
        });
    });
}

function resolveAndRenderLocation(locationQuery, greetingHTML = "") {
    const cleanLocation = locationQuery.trim();
    if (!cleanLocation) {
        if (output) output.innerText = "Please specify a location.";
        return;
    }

    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Locating and fetching telemetry for "${cleanLocation}"...</div>`;

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLocation)}&count=1&language=en&format=json`)
        .then(res => res.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                return handleVaiiDataOutput(`Could not find location "${cleanLocation}".`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">No location records found matching "${cleanLocation}".</div>`);
            }

            const match = data.results[0];
            let formattedName = match.name;
            if (match.admin1 && match.admin1 !== match.name) formattedName += `, ${match.admin1}`;
            if (match.country) formattedName += ` (${match.country})`;

            renderUnifiedLocationCard(match.latitude, match.longitude, match.timezone || 'auto', formattedName, greetingHTML);
        })
        .catch(err => {
            console.error("Geocoding failed:", err);
            handleVaiiDataOutput("Geocoding network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Failed to geocode location. Network error.</div>`);
        });
}

function renderUnifiedLocationCard(lat, lon, timezone, placeName, greetingHTML = "") {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Loading telemetry for ${placeName}...</div>`;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=${encodeURIComponent(timezone || 'auto')}&temperature_unit=fahrenheit&wind_speed_unit=mph`;

    fetch(weatherUrl)
        .then(res => res.json())
        .then(data => {
            const current = data.current || {};
            const daily = data.daily || {};
            const tz = data.timezone || timezone || "UTC";

            const temp = Math.round(current.temperature_2m ?? 0);
            const feelsLike = Math.round(current.apparent_temperature ?? temp);
            const humidity = current.relative_humidity_2m ?? "--";
            const windSpeed = Math.round(current.wind_speed_10m ?? 0);
            const wCode = current.weather_code ?? 0;
            const weatherInfo = WMO_WEATHER_CODES[wCode] || { desc: "Clear", icon: "☀️" };

            let localTimeStr = "--:--";
            try {
                localTimeStr = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).format(new Date());
            } catch (e) {
                localTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }

            const formatSolarTime = (isoString) => {
                if (!isoString) return "--:--";
                const parts = isoString.split('T')[1]?.split(':');
                if (!parts) return "--:--";
                let hours = parseInt(parts[0], 10);
                const minutes = parts[1];
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                return `${hours}:${minutes} ${ampm}`;
            };

            const sunriseTime = formatSolarTime(daily.sunrise?.[0]);
            const sunsetTime = formatSolarTime(daily.sunset?.[0]);

            const cardHTML = `
                ${greetingHTML}
                <div style="background: #1a1a1a; padding: 18px; border-radius: 12px; border-left: 4px solid #00bcd4; text-align: left; margin-bottom: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid #2a2a2a; padding-bottom: 10px;">
                        <div>
                            <div style="font-size: 0.72rem; color: #00bcd4; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">📍 Unified Location Telemetry</div>
                            <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-top: 2px;">${placeName}</div>
                            <div style="font-size: 0.78rem; color: #777;">Timezone: ${tz} (${parseFloat(lat).toFixed(2)}°, ${parseFloat(lon).toFixed(2)}°)</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: bold;">Local Time</div>
                            <div style="font-size: 1.25rem; font-weight: bold; color: #00e676;">🕒 ${localTimeStr}</div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 2.2rem; line-height: 1;">${weatherInfo.icon}</span>
                            <div>
                                <div style="font-size: 1.6rem; font-weight: bold; color: #fff; line-height: 1.1;">${temp}°F</div>
                                <div style="font-size: 0.85rem; color: #aaa;">${weatherInfo.desc}</div>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 0.82rem; color: #bbb; line-height: 1.4;">
                            <div>Feels like: <strong>${feelsLike}°F</strong></div>
                            <div>Humidity: <strong>${humidity}%</strong></div>
                            <div>Wind: <strong>${windSpeed} mph</strong></div>
                        </div>
                    </div>

                    <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 10px; margin-bottom: 12px;">
                        <div style="background: #252525; padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.4rem;">🌅</span>
                            <div>
                                <div style="font-size: 0.72rem; color: #aaa; text-transform: uppercase; font-weight: bold;">Sunrise</div>
                                <div style="font-size: 0.95rem; font-weight: bold; color: #ffeb3b;">${sunriseTime}</div>
                            </div>
                        </div>
                        <div style="background: #252525; padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.4rem;">🌇</span>
                            <div>
                                <div style="font-size: 0.72rem; color: #aaa; text-transform: uppercase; font-weight: bold;">Sunset</div>
                                <div style="font-size: 0.95rem; font-weight: bold; color: #ff9800;">${sunsetTime}</div>
                            </div>
                        </div>
                    </div>

                    <div style="font-size: 0.72rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">🗺️ Interactive Map</div>
                    <div id="vaii-location-map-canvas" style="width: 100%; height: 210px; border-radius: 8px; background: #252525; border: 1px solid #333; overflow: hidden;"></div>
                </div>
            `;

            const spokenSummary = `It is currently ${localTimeStr} in ${placeName}. The temperature is ${temp} degrees Fahrenheit with ${weatherInfo.desc}. Sunrise is at ${sunriseTime} and sunset is at ${sunsetTime}.`;

            handleVaiiDataOutput(spokenSummary, cardHTML, () => {
                const mapCanvas = document.getElementById('vaii-location-map-canvas');
                if (!mapCanvas) return;

                const pos = { lat: parseFloat(lat), lng: parseFloat(lon) };

                if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
                    const locMap = new google.maps.Map(mapCanvas, {
                        center: pos,
                        zoom: 12,
                        disableDefaultUI: false,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                        ]
                    });
                    new google.maps.Marker({
                        position: pos,
                        map: locMap,
                        title: placeName
                    });
                } else {
                    mapCanvas.innerHTML = `<iframe width="100%" height="100%" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${lat},${lon}&zoom=12" allowfullscreen></iframe>`;
                }
            });
        })
        .catch(err => {
            console.error("Telemetry fetch failed:", err);
            handleVaiiDataOutput("Telemetry retrieval failed.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">Could not load telemetry feed for ${placeName}.</div>`);
        });
}

function fetchLiveStreamPlayer(songQuery) {
    const cleanTrack = songQuery.trim();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Loading stream matrices for "${cleanTrack}"...</div>`;

    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTrack)}&entity=song&limit=1`)
        .then(res => res.json())
        .then(data => {
            const track = data.results?.[0];
            const title = track ? track.trackName : cleanTrack;
            const artist = track ? track.artistName : "Various Artists";
            const artwork = track?.artworkUrl100 || "";
            const encTrack = encodeURIComponent(`${title} ${artist}`);

            const ytMusicUrl = `https://music.youtube.com/search?q=${encTrack}`;
            const spotifySearchUrl = `https://open.spotify.com/search/${encTrack}`;

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #1db954; text-align: left;">
                    <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px;">
                        ${artwork ? `<img src="${artwork}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; border: 1px solid #333;">` : '<div style="font-size: 2.2rem;">🎵</div>'}
                        <div style="flex: 1;">
                            <div style="font-size: 0.72rem; color: #1db954; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">🎧 Live Music Streaming Hub</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: #fff;">${title}</div>
                            <div style="color: #aaa; font-size: 0.85rem;">${artist}</div>
                        </div>
                    </div>

                    ${track?.previewUrl ? `
                        <div style="margin-bottom: 12px; background: #252525; padding: 8px 10px; border-radius: 6px;">
                            <span style="font-size: 0.72rem; color: #888; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Instant 30s Audio Stream:</span>
                            <audio controls style="width: 100%; height: 34px;" src="${track.previewUrl}"></audio>
                        </div>
                    ` : ''}

                    <div style="font-size: 0.72rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Direct Player Launchers:</div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <a href="${spotifySearchUrl}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #1db954; border-radius: 6px; padding: 8px 12px; color: #000; text-decoration: none; font-weight: bold; font-size: 0.85rem;">
                            <span>🟢 Play full track on Spotify</span><span>➔</span>
                        </a>
                        <a href="${ytMusicUrl}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #ff0000; border-radius: 6px; padding: 8px 12px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.85rem;">
                            <span>▶️ Play on YouTube Music</span><span>➔</span>
                        </a>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`Streaming player loaded for ${title} by ${artist}.`, html);
        })
        .catch(() => {
            const encTrack = encodeURIComponent(cleanTrack);
            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #1db954; text-align: left;">
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff; margin-bottom: 10px;">🎵 Stream "${cleanTrack}"</div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <a href="https://open.spotify.com/search/${encTrack}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #1db954; border-radius: 6px; padding: 8px 12px; color: #000; text-decoration: none; font-weight: bold; font-size: 0.85rem;">
                            <span>🟢 Search Spotify</span><span>➔</span>
                        </a>
                        <a href="https://music.youtube.com/search?q=${encTrack}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #ff0000; border-radius: 6px; padding: 8px 12px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.85rem;">
                            <span>▶️ Search YouTube Music</span><span>➔</span>
                        </a>
                    </div>
                </div>
            `;
            handleVaiiDataOutput(`Loaded streaming options for ${cleanTrack}.`, html);
        });
}

function fetchMarsRoverTelemetry(roverName = "curiosity") {
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Downloading NASA Mars Rover telemetry...</div>`;
    
    const cleanRoverInput = (roverName || "").toLowerCase();
    const isPerseverance = cleanRoverInput.includes("perseverance") || cleanRoverInput.includes("percy");
    const isOpportunity = cleanRoverInput.includes("opportunity") || cleanRoverInput.includes("oppy");
    const isSpirit = cleanRoverInput.includes("spirit");
    
    let targetRover = "curiosity";
    if (isPerseverance) targetRover = "perseverance";
    else if (isOpportunity) targetRover = "opportunity";
    else if (isSpirit) targetRover = "spirit";

    const ROVER_SPECS = {
        curiosity: {
            name: "Curiosity (MSL)",
            landingDateStr: "2012-08-06T05:17:57Z",
            launchDateStr: "2011-11-26",
            landingDateDisplay: "August 6, 2012",
            landingSite: "Gale Crater",
            cameraName: "Mast Camera (Mastcam)",
            status: "OPERATIONAL",
            statusColor: "#00e676",
            surfacePhotos: [
                "https://mars.nasa.gov/msl-raw-images/msss/01000/mcam/1000ML0044631300305227E03_DXXX.jpg",
                "https://mars.nasa.gov/msl-raw-images/msss/01000/mcam/1000MR0044631290503689E01_DXXX.jpg"
            ]
        },
        perseverance: {
            name: "Perseverance (Mars 2020)",
            landingDateStr: "2021-02-18T20:55:00Z",
            launchDateStr: "2020-07-30",
            landingDateDisplay: "February 18, 2021",
            landingSite: "Jezero Crater",
            cameraName: "Mastcam-Z Color Camera",
            status: "OPERATIONAL",
            statusColor: "#00e676",
            surfacePhotos: [
                "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00003/ids/edr/browse/fcam/FLF_0003_0667087612_828ECM_N0010052AUT_04096_00_285J01_1200.jpg",
                "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00000/ids/edr/browse/fcam/FLF_0000_0666952864_899ECM_N0010052AUT_04096_00_285J01_1200.jpg"
            ]
        },
        opportunity: {
            name: "Opportunity (MER-B)",
            landingDateStr: "2004-01-25T05:05:00Z",
            launchDateStr: "2003-07-07",
            landingDateDisplay: "January 25, 2004",
            landingSite: "Meridiani Planum",
            cameraName: "Panoramic Camera (Pancam)",
            status: "COMPLETE",
            statusColor: "#aaa",
            surfacePhotos: [
                "https://mars.nasa.gov/mer/gallery/all/1/p/5111/1P582046467EFFB2FCP2415L7M1-BR.JPG"
            ]
        },
        spirit: {
            name: "Spirit (MER-A)",
            landingDateStr: "2004-01-04T04:35:00Z",
            launchDateStr: "2003-06-10",
            landingDateDisplay: "January 4, 2004",
            landingSite: "Gusev Crater",
            cameraName: "Panoramic Camera (Pancam)",
            status: "COMPLETE",
            statusColor: "#aaa",
            surfacePhotos: [
                "https://mars.nasa.gov/mer/gallery/all/2/p/2208/2P322476535EFFB157P2440L7M1-BR.JPG"
            ]
        }
    };

    const currentSpec = ROVER_SPECS[targetRover];

    const nowMs = Date.now();
    const landingMs = new Date(currentSpec.landingDateStr).getTime();
    const elapsedSeconds = Math.max(0, (nowMs - landingMs) / 1000);
    const calculatedSol = (currentSpec.status === "OPERATIONAL") 
        ? Math.floor(elapsedSeconds / 88775.244) 
        : (targetRover === "opportunity" ? 5111 : 2210);
    const currentEarthDate = new Date().toISOString().split("T")[0];

    const formatPhotoUrl = (url) => {
        if (!url) return currentSpec.surfacePhotos[0];
        return url.replace(/^http:\/\//i, "https://");
    };

    const renderCard = (photoUrl, cameraLabel, solNumber, earthDate) => {
        const safeImg = formatPhotoUrl(photoUrl);
        const fallbackImg = currentSpec.surfacePhotos[0];
        const cardId = "mars-photo-" + Math.floor(Math.random() * 100000);

        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff5722; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 0.72rem; color: #ff5722; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">🔴 NASA Mars Surface Telemetry</div>
                    <span style="background: #252525; border: 1px solid #333; color: ${currentSpec.statusColor}; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${currentSpec.status}</span>
                </div>
                <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 2px;">Rover: ${currentSpec.name}</div>
                <div style="font-size: 0.78rem; color: #aaa; margin-bottom: 4px;">📍 Landing Site: <strong>${currentSpec.landingSite}</strong></div>
                <div style="font-size: 0.78rem; color: #ff9800; margin-bottom: 10px;">📷 Camera: <strong>${cameraLabel || currentSpec.cameraName}</strong></div>

                <div style="width: 100%; height: 260px; background: #252525; border-radius: 8px; overflow: hidden; border: 1px solid #333; display: flex; align-items: center; justify-content: center;">
                    <img 
                        id="${cardId}"
                        src="${safeImg}" 
                        referrerpolicy="no-referrer"
                        style="width: 100%; height: 100%; object-fit: cover; display: block;" 
                        alt="Mars Surface Panorama"
                    >
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid #2a2a2a; padding-top: 10px; margin-top: 10px; font-size: 0.82rem; color: #ccc;">
                    <div><strong>📅 Earth Date:</strong> ${earthDate}</div>
                    <div><strong>☀️ Mission Sol:</strong> Sol ${solNumber}</div>
                    <div><strong>🚀 Launch:</strong> ${currentSpec.launchDateStr}</div>
                    <div><strong>🛬 Landing:</strong> ${currentSpec.landingDateDisplay}</div>
                </div>

                <a href="https://mars.nasa.gov" target="_blank" style="display: inline-block; margin-top: 10px; color: #ff9800; text-decoration: none; font-size: 0.8rem; font-weight: bold;">Explore NASA Mars Missions ↗</a>
            </div>
        `;

        handleVaiiDataOutput(`Mars Rover ${currentSpec.name} telemetry on Sol ${solNumber} at ${currentSpec.landingSite}.`, html, () => {
            const imgElement = document.getElementById(cardId);
            if (imgElement) {
                imgElement.addEventListener('error', () => {
                    if (imgElement.src !== fallbackImg) {
                        imgElement.src = fallbackImg;
                    }
                });
            }
        });
    };

    const primaryUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${targetRover}/latest_photos?api_key=DEMO_KEY`;

    fetch(primaryUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.latest_photos && data.latest_photos.length > 0) {
                const photo = data.latest_photos[0];
                const camLabel = photo.camera?.full_name || photo.camera?.name || currentSpec.cameraName;
                renderCard(photo.img_src, camLabel, photo.sol || calculatedSol, photo.earth_date || currentEarthDate);
            } else {
                throw new Error("Empty photos array");
            }
        })
        .catch(() => {
            const fallbackPhoto = currentSpec.surfacePhotos[Math.floor(Math.random() * currentSpec.surfacePhotos.length)];
            renderCard(fallbackPhoto, currentSpec.cameraName, calculatedSol, currentEarthDate);
        });
}

function renderTimerStopwatchCard(rawQuery) {
    if (activeTimerInterval) clearInterval(activeTimerInterval);
    const clean = rawQuery.toLowerCase().trim();
    const isStopwatch = clean.includes("stopwatch") || clean === "sw";

    let totalSeconds = 0;
    if (!isStopwatch) {
        const match = clean.match(/(?:timer\s+)?(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?\s*(?:(\d+)\s*s(?:ec(?:onds?)?)?)?/i);
        const hours = parseInt(match?.[1] || 0, 10);
        const mins = parseInt(match?.[2] || 0, 10);
        const secs = parseInt(match?.[3] || 0, 10);
        totalSeconds = (hours * 3600) + (mins * 60) + secs;
        if (totalSeconds === 0) totalSeconds = 300; 
    }

    const formatDisplay = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    let remaining = isStopwatch ? 0 : totalSeconds;
    const initialTime = totalSeconds;

    const html = `
        <div style="background: #1a1a1a; padding: 18px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: center;">
            <div style="font-size: 0.72rem; color: #ff9800; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; text-align: left; margin-bottom: 8px;">
                ⏱️ ${isStopwatch ? 'Interactive Stopwatch' : 'Active Countdown Timer'}
            </div>
            
            <div id="vaii-timer-display" style="font-size: 3.2rem; font-weight: 800; font-family: monospace; color: #fff; margin-top: 10px; margin-bottom: 10px;">
                ${formatDisplay(remaining)}
            </div>

            <div id="vaii-timer-status" style="font-size: 0.85rem; color: #aaa; margin-bottom: 14px;">
                ${isStopwatch ? 'Stopwatch running...' : `Timer set for ${formatDisplay(initialTime)}`}
            </div>

            <div style="display: flex; gap: 8px; justify-content: center;">
                <button id="vaii-timer-pause-btn" style="flex: 1; background: #333; color: #fff; border: 1px solid #555; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">Pause</button>
                <button id="vaii-timer-reset-btn" style="flex: 1; background: #dc3545; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">Reset</button>
            </div>
        </div>
    `;

    handleVaiiDataOutput(isStopwatch ? "Stopwatch started." : `Timer started for ${formatDisplay(initialTime)}.`, html, () => {
        const display = document.getElementById('vaii-timer-display');
        const status = document.getElementById('vaii-timer-status');
        const pauseBtn = document.getElementById('vaii-timer-pause-btn');
        const resetBtn = document.getElementById('vaii-timer-reset-btn');
        let isPaused = false;

        activeTimerInterval = setInterval(() => {
            if (isPaused) return;

            if (isStopwatch) {
                remaining++;
                if (display) display.innerText = formatDisplay(remaining);
            } else {
                if (remaining > 0) {
                    remaining--;
                    if (display) display.innerText = formatDisplay(remaining);
                } else {
                    clearInterval(activeTimerInterval);
                    if (display) {
                        display.innerText = "00:00";
                        display.style.color = "#ff4d4d";
                    }
                    if (status) {
                        status.innerText = "⏰ Time is up!";
                        status.style.color = "#ff4d4d";
                        status.style.fontWeight = "bold";
                    }
                    playTimerChime();
                    speakText("Time is up!");
                }
            }
        }, 1000);

        pauseBtn?.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseBtn.innerText = isPaused ? "Resume" : "Pause";
            pauseBtn.style.background = isPaused ? "#28a745" : "#333";
            if (status) status.innerText = isPaused ? "Paused" : (isStopwatch ? "Running..." : "Counting down...");
        });

        resetBtn?.addEventListener('click', () => {
            clearInterval(activeTimerInterval);
            remaining = isStopwatch ? 0 : initialTime;
            isPaused = true;
            pauseBtn.innerText = "Start";
            pauseBtn.style.background = "#28a745";
            if (display) {
                display.innerText = formatDisplay(remaining);
                display.style.color = "#fff";
            }
            if (status) status.innerText = "Reset to start.";
        });
    });
}

function fetchGitHubRepoInfo(repoQuery) {
    let clean = repoQuery.replace(/^(repo|github)\s+/i, '').trim();
    if (!clean.includes('/')) {
        return handleVaiiDataOutput("Please provide user/repo format.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ffc107; text-align: left;">Please specify a GitHub repository in <code>owner/repo</code> format (e.g. <code>repo facebook/react</code>).</div>`);
    }

    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Inspecting GitHub repository "${clean}"...</div>`;

    fetch(`https://api.github.com/repos/${clean}`)
        .then(res => {
            if (!res.ok) throw new Error("Repo not found");
            return res.json();
        })
        .then(repo => {
            const stars = Number(repo.stargazers_count).toLocaleString();
            const forks = Number(repo.forks_count).toLocaleString();
            const issues = Number(repo.open_issues_count).toLocaleString();
            const license = repo.license?.spdx_id || "None";

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #fff; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="font-size: 0.72rem; color: #aaa; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">🐙 GitHub Repository Inspector</div>
                        <span style="background: #252525; border: 1px solid #444; color: #4da3ff; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${repo.language || 'Code'}</span>
                    </div>
                    
                    <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 4px;">${repo.full_name}</div>
                    <div style="color: #ccc; font-size: 0.85rem; line-height: 1.4; margin-bottom: 12px;">${repo.description || 'No description provided.'}</div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #252525; padding: 10px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem;">
                        <div>⭐ <strong>Stars:</strong> ${stars}</div>
                        <div>🍴 <strong>Forks:</strong> ${forks}</div>
                        <div>⚠️ <strong>Issues:</strong> ${issues}</div>
                        <div>⚖️ <strong>License:</strong> ${license}</div>
                    </div>

                    <a href="${repo.html_url}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #333; border: 1px solid #555; color: #fff; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: bold;">
                        <span>View Repository on GitHub</span><span>➔</span>
                    </a>
                </div>
            `;
            handleVaiiDataOutput(`GitHub repository ${repo.full_name} has ${stars} stars and ${forks} forks.`, html);
        })
        .catch(() => {
            handleVaiiDataOutput(`Repository "${clean}" not found.`, `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">GitHub repository "${clean}" not found. Verify spelling and owner.</div>`);
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
            
            const movieTitleEnc = encodeURIComponent(data.Title);
            const fandangoLink = `https://www.fandango.com/search?q=${movieTitleEnc}`;
            const streamLink = `https://www.google.com/search?q=where+to+watch+${movieTitleEnc}+movie`;

            const html = `
                <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #e50914; text-align: left;">
                    <div style="display: flex; gap: 15px; margin-bottom: 12px;">
                        ${data.Poster !== "N/A" ? `<img src="${data.Poster}" style="width: 90px; border-radius: 6px; object-fit: cover;">` : ''}
                        <div>
                            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 4px;">🎬 ${data.Title} (${data.Year})</div>
                            <div style="color: #ffc107; font-size: 0.85rem; margin-bottom: 8px;">⭐ IMDB: ${data.imdbRating} | ${data.Genre}</div>
                            <div style="color: #ccc; font-size: 0.88rem; line-height: 1.4;">${data.Plot}</div>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #2a2a2a; padding-top: 10px; display: flex; gap: 8px;">
                        <a href="${fandangoLink}" target="_blank" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #f37321; color: #fff; text-decoration: none; padding: 8px; border-radius: 6px; font-size: 0.82rem; font-weight: bold;">🎟️ Fandango Tickets ↗</a>
                        <a href="${streamLink}" target="_blank" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #007bff; color: #fff; text-decoration: none; padding: 8px; border-radius: 6px; font-size: 0.82rem; font-weight: bold;">📺 Stream & Rent ↗</a>
                    </div>
                </div>
            `;
            handleVaiiDataOutput("I found " + data.Title + " from " + data.Year + ". " + data.Plot, html);
        }).catch(() => handleVaiiDataOutput("OMDB routing failed. Network error.", `<div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff4d4d; text-align: left;">OMDB routing failed. Network error.</div>`));
}

function executeLocalFoodSearch(queryText) {
    if (routingWarning) routingWarning.style.display = "none";
    
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

    cleanQuery = cleanQuery.replace(/^(reserve table at|reserve a table at|reserve table|reserve|reservation for|reservation|order me a|order a|order some|order|find)\s+/i, '').trim();

    let dbMatch = null;
    let searchItemName = cleanQuery;
    let searchBrandName = "";

    let category = Object.keys(LOCAL_FOOD_DB).find(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        return regex.test(cleanQuery);
    });

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
            <span style="color: #eee; font-size: 0.9rem;">Processing dining & reservation request for "${searchBrandName}"...</span>
        </div>
    `;

    const renderFallbackCard = (brandName, suggestionText, fallbackLoc) => {
        const locString = fallbackLoc ? ` ${fallbackLoc}` : "";
        const cleanFallbackString = (brandName + locString).replace(/[^a-zA-Z0-9 ,]/g, '');
        const encFallback = encodeURIComponent(cleanFallbackString);
        
        const ddLink = `https://www.doordash.com/search/store/${encFallback}/`;
        const goLink = `https://www.google.com/search?q=Order+delivery+from+${encFallback}`;
        const otLink = `https://www.opentable.com/s?term=${encFallback}`;

        const htmlOutput = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: left; margin-bottom: 15px;">
                <div style="font-size: 0.8rem; color: #ff9800; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🍽️ Dining & Food Concierge</div>
                <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 6px;">${brandName}</div>
                <div style="color: #ccc; font-size: 0.9rem; margin-bottom: 14px;">💡 Suggested: <strong>${suggestionText || queryText}</strong> ${fallbackLoc ? 'near ' + fallbackLoc : ''}</div>
                
                <div style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Delivery & Table Reservation Dispatch</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="${otLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #da3743; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>🍽️ Reserve Table on OpenTable</span><span>➔</span>
                    </a>
                    <a href="${ddLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #FF3008; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>🚗 Order Delivery on DoorDash</span><span>➔</span>
                    </a>
                    <a href="${goLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #4285F4; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                        <span>🌐 Google Local Order</span><span>➔</span>
                    </a>
                </div>
            </div>
        `;
        handleVaiiDataOutput(`Here are your options for ${brandName}.`, htmlOutput);
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
                const openTableLink = `https://www.opentable.com/s?term=${encodeURIComponent(placeName + " " + (explicitLocation || address))}`;
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + " " + address)}`;

                let suggestionHTML = dbMatch ? `<div style="color: #ccc; font-size: 0.95rem; margin-bottom: 4px;">💡 Suggested: <strong>${searchItemName}</strong></div>` : "";

                const htmlOutput = `
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #ff9800; text-align: left; margin-bottom: 15px;">
                        <div style="font-size: 0.8rem; color: #ff9800; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🍽️ GPS Verified Dining</div>
                        <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 6px;">${placeName}</div>
                        ${suggestionHTML}
                        <div style="color: #ccc; font-size: 0.95rem; margin-bottom: 4px;">⭐ Rating: ${rating} / 5.0</div>
                        <a href="${mapLink}" target="_blank" style="color: #ff9800; text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 14px;">📍 ${address} ↗</a>
                        
                        <div style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Delivery & Table Reservation Dispatch</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <a href="${openTableLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #da3743; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>🍽️ Reserve Table on OpenTable</span><span>➔</span>
                            </a>
                            <a href="${doorDashLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #FF3008; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>🚗 Order Delivery on DoorDash</span><span>➔</span>
                            </a>
                            <a href="${googleOrderLink}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #4285F4; border-radius: 6px; padding: 10px 14px; color: #fff; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                <span>🌐 Google Local Order</span><span>➔</span>
                            </a>
                        </div>
                    </div>
                `;
                handleVaiiDataOutput(`I found ${placeName}. Rating is ${rating} stars.`, htmlOutput);
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
        let officialUrl = webPage;
        if (!officialUrl || officialUrl.includes("wikipedia.org") || officialUrl === '#') {
            if (domain && domain.includes('.')) {
                officialUrl = `https://${domain}`;
            } else {
                officialUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' official website')}`;
            }
        }
        if (!officialUrl.startsWith('http://') && !officialUrl.startsWith('https://')) {
            officialUrl = `https://${officialUrl}`;
        }

        const html = `
            <div style="background: #1a1a1a; padding: 16px; border-radius: 12px; border-left: 4px solid #673ab7; text-align: left;">
                <div style="font-size: 0.75rem; color: #b388ff; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">🎓 Higher Education Directory</div>
                <div style="font-size: 1.25rem; font-weight: bold; color: #fff; margin-bottom: 4px;">${name}</div>
                <div style="font-size: 0.85rem; color: #aaa;">📍 ${country}${stateStr} • Domain: <code>${domain || 'N/A'}</code></div>
                <a href="${officialUrl}" target="_blank" style="display: inline-block; margin-top: 10px; background: #673ab7; color: #fff; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: bold;">Visit Campus Portal ↗</a>
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
            const realWeb = college.web_pages?.[0] || (college.domains?.[0] ? `https://${college.domains[0]}` : null);
            renderCollegeCard(
                college.name, 
                college.country, 
                college['state-province'], 
                realWeb, 
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
                    const inferredDomain = cleanCollege.toLowerCase().replace(/[^a-z]/g, '') + ".edu";
                    renderCollegeCard(
                        wikiData.title, 
                        "Worldwide", 
                        null, 
                        `https://${inferredDomain}`, 
                        inferredDomain
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
                ? `<iframe src="${data.url}" style="width: 100%; height: 220px; border-radius: 8px; border: 1px solid #333;" frameborder="0" allowfullscreen></iframe>`
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
    if (routingWarning) routingWarning.style.display = "none"; 
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
    if (routingWarning) routingWarning.style.display = "block"; 
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

    if (cleanQuery === "terminal" || cleanQuery === "/terminal" || cleanQuery === "shell" || cleanQuery === "sandbox") {
        launchTerminalSandbox();
        return;
    }

    if (cleanQuery.startsWith("/weather ")) {
        return resolveAndRenderLocation(query.substring(9).trim(), greetingHTML);
    }
    if (cleanQuery.startsWith("/play ")) {
        return fetchLiveStreamPlayer(query.substring(6).trim());
    }
    if (cleanQuery.startsWith("/movie ")) {
        return fetchOMDBMedia(query.substring(7).trim());
    }
    if (cleanQuery.startsWith("/draw ")) {
        return executeImageGeneration(query.substring(6).trim());
    }
    if (cleanQuery.startsWith("/repo ") || cleanQuery.startsWith("/github ")) {
        return fetchGitHubRepoInfo(query.replace(/^(\/repo|\/github)\s+/i, '').trim());
    }
    if (cleanQuery.startsWith("/qr ")) {
        return generateQRCode(query.substring(4).trim());
    }
    if (cleanQuery.startsWith("/timer ")) {
        return renderTimerStopwatchCard(query.substring(7).trim());
    }
    if (cleanQuery.startsWith("/note ")) {
        let text = query.substring(6).trim();
        if (text) {
            let notes = JSON.parse(localStorage.getItem('vaii_notes') || '[]');
            notes.unshift(text);
            localStorage.setItem('vaii_notes', JSON.stringify(notes));
            return renderNotesManager();
        }
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
            notes.unshift(text);
            localStorage.setItem('vaii_notes', JSON.stringify(notes));
            handleVaiiDataOutput("Note securely saved to local storage.", `<div style="background: #1a1a1a; padding: 14px; border-left: 3px solid #28a745; text-align: left; border-radius: 8px;">✅ Note securely saved to local storage. Type <code>show notes</code> to view.</div>`);
        }
        return;
    }
    if (cleanQuery === "show notes" || cleanQuery === "my notes") return renderNotesManager();

    const options = Array.from(datalist?.options || []);
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
                    proceedWithWikiPipeline(query);
                }
            })
            .catch(() => {
                proceedWithWikiPipeline(query);
            });
        return;
    }

    if (cleanQuery.startsWith("play ") || cleanQuery.startsWith("stream song ")) {
        return fetchLiveStreamPlayer(query.replace(/^(play|stream song)\s+/i, '').trim());
    }

    if (cleanQuery === "mars" || cleanQuery === "rover" || cleanQuery.startsWith("mars ") || cleanQuery.startsWith("rover ") || cleanQuery === "curiosity" || cleanQuery === "perseverance" || cleanQuery === "percy") {
        return fetchMarsRoverTelemetry(cleanQuery);
    }

    if (cleanQuery.startsWith("timer") || cleanQuery === "stopwatch" || cleanQuery === "sw") {
        return renderTimerStopwatchCard(query);
    }

    if (cleanQuery.startsWith("repo ") || cleanQuery.startsWith("github ")) {
        return fetchGitHubRepoInfo(query);
    }

    if (cleanQuery.startsWith("movie ") || cleanQuery.startsWith("film ") || cleanQuery.startsWith("tickets ") || cleanQuery.startsWith("ticket ") || cleanQuery.startsWith("stream ") || cleanQuery.startsWith("watch ")) {
        return fetchOMDBMedia(query.replace(/^(movie|film|tickets|ticket|stream|watch)\s+/i, '').trim());
    }

    const exactFoodCategoryMatch = Object.keys(LOCAL_FOOD_DB).some(cat => {
        const regex = new RegExp(`\\b${cat}\\b`, 'i');
        return regex.test(cleanQuery);
    });

    const isExplicitFoodCommand = cleanQuery.startsWith("order ") || cleanQuery.startsWith("find ") ||
                                  cleanQuery.startsWith("reserve ") || cleanQuery.startsWith("reservation ");

    if (exactFoodCategoryMatch || isExplicitFoodCommand) {
        executeLocalFoodSearch(query);
        return;
    }

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

    if (cleanQuery.startsWith("qr ") || cleanQuery.startsWith("qrcode ")) {
        return generateQRCode(query.replace(/^(qr|qrcode)\s+/i, '').trim());
    }

    if (cleanQuery === "iss" || cleanQuery === "orbit" || cleanQuery === "where is the iss" || cleanQuery === "space station") {
        return fetchISSTelemetry();
    }

    if (cleanQuery === "duck" || cleanQuery === "ducks" || cleanQuery === "random duck") {
        return fetchRandomDuck();
    }

    if (cleanQuery.startsWith("zip ") || cleanQuery.startsWith("postal ")) {
        return fetchPostalCodeInfo(cleanQuery.replace(/^(zip|postal)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("college ") || cleanQuery.startsWith("university ")) {
        return fetchUniversityDirectory(cleanQuery.replace(/^(college|university)\s+/i, '').trim());
    }

    if (cleanQuery === "space" || cleanQuery === "nasa" || cleanQuery === "apod" || cleanQuery === "astronomy") {
        return fetchNasaAPOD();
    }

    if (cleanQuery === "advice" || cleanQuery === "give me advice" || cleanQuery === "quote") {
        return fetchAdviceSlip();
    }

    if (cleanQuery.startsWith("age ")) {
        return fetchAgifyPrediction(cleanQuery.replace(/^age\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("define ")) {
        return fetchDictionaryDefinition(cleanQuery.replace(/^define\s+/i, '').trim());
    }

    if (cleanQuery === "dog" || cleanQuery === "random dog" || cleanQuery === "dogs") {
        return fetchCuteAnimal("dog");
    }
    if (cleanQuery === "cat" || cleanQuery === "random cat" || cleanQuery === "cats") {
        return fetchCuteAnimal("cat");
    }

    if (cleanQuery.startsWith("country ") || cleanQuery.startsWith("flag of ")) {
        return fetchCountryInfo(cleanQuery.replace(/^(country|flag of)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("drink ") || cleanQuery === "random drink" || cleanQuery === "cocktail") {
        return fetchDrinkRecipe(cleanQuery.replace(/^drink\s+/i, '').trim());
    }

    if (cleanQuery === "my ip" || cleanQuery === "ip" || cleanQuery === "ip lookup" || cleanQuery === "what is my ip") {
        return fetchClientIPLookup();
    }

    if (cleanQuery === "trivia" || cleanQuery === "quiz" || cleanQuery.startsWith("trivia ") || cleanQuery.startsWith("quiz ")) {
        return fetchTriviaQuestion();
    }

    if (cleanQuery === "free games" || cleanQuery === "deals" || cleanQuery === "giveaways" || cleanQuery.startsWith("free game")) {
        return fetchGameDeals();
    }

    if (cleanQuery === "joke" || cleanQuery === "tell me a joke" || cleanQuery === "make me laugh" || cleanQuery.startsWith("joke ")) {
        return fetchDadJoke();
    }

    if (cleanQuery.startsWith("song ") || cleanQuery.startsWith("music ") || cleanQuery.startsWith("track ")) {
        return fetchSongTrack(cleanQuery.replace(/^(song|music|track)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("anime ")) {
        return fetchAniListMedia(cleanQuery.replace(/^anime\s+/i, '').trim(), "ANIME");
    }
    if (cleanQuery.startsWith("manga ")) {
        return fetchAniListMedia(cleanQuery.replace(/^manga\s+/i, '').trim(), "MANGA");
    }

    if (cleanQuery.startsWith("pokemon ") || cleanQuery.startsWith("pokedex ")) {
        return fetchPokemonEntry(cleanQuery.replace(/^(pokemon|pokedex)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("book ") || cleanQuery.startsWith("novel ")) {
        return fetchOpenLibraryBook(cleanQuery.replace(/^(book|novel)\s+/i, '').trim());
    }

    if (cleanQuery.startsWith("news about ")) return fetchNewsAPI(query.substring(11).trim());
    if (cleanQuery === "top news" || cleanQuery === "news") return fetchNewsAPI("");

    if (query.toLowerCase().startsWith("open ")) {
        let rawTarget = query.substring(5).trim().toLowerCase().replace(/['"]+/g, '');
        if (!rawTarget) { if (output) output.innerText = "Please specify what you want to open."; return; }

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
            output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Resolving address for "${rawTarget}"...</div>`;
            launchTargetUrl(randomizedRoutes[rawTarget][0]);
            return;
        }

        let sanitizedDomain = rawTarget.replace(/&/g, 'and').replace(/[^a-z0-9.-]/g, '').replace(/^[.-]+|[.-]+$/g, '');

        if (!sanitizedDomain || sanitizedDomain.length < 2) {
            proceedWithWikiPipeline(query);
            return;
        }

        output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Resolving address for "${rawTarget}"...</div>`;

        if (/\.[a-z]{2,}/i.test(sanitizedDomain)) {
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

    if (routingWarning) routingWarning.style.display = "none";
    
    let cleanSearchQuery = query.replace(/^(yt|youtube)\s+/i, '').trim();
    output.innerHTML = `<div class="generation-status"><div class="loader-spinner"></div> Searching knowledge base for "${cleanSearchQuery}"...</div>`;
    proceedWithWikiPipeline(cleanSearchQuery);

    function proceedWithWikiPipeline(searchTerm) {
        if (!searchTerm.includes(" ")) {
            fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(searchTerm.toLowerCase())}`)
                .then(res => res.json())
                .then(dictData => {
                    const key = Object.keys(dictData)[0];
                    const rawDefinition = cleanWiktionaryDefinition(dictData[key][0].definitions[0].definition);
                    let wikiData = { wiktionary: { title: searchTerm, text: rawDefinition, pos: dictData[key][0].partOfSpeech || "noun" } };
                    if (greetingHTML) wikiData.greeting = greetingHTML;
                    runUnifiedWikiPipeline(searchTerm, wikiData);
                }).catch(() => {
                    runUnifiedWikiPipeline(searchTerm, { greeting: greetingHTML });
                });
        } else {
            runUnifiedWikiPipeline(searchTerm, { greeting: greetingHTML });
        }
    }
}

function runUnifiedWikiPipeline(query, wikiData) {
    const youtubeFetch = GOOGLE_API_KEY
        ? fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`)
            .then(res => res.json())
            .then(searchData => {
                if (searchData.items?.length > 0) {
                    const channelId = searchData.items[0].id.channelId;
                    return Promise.all([
                        fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${GOOGLE_API_KEY}`).then(r => r.json()),
                        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=1&key=${GOOGLE_API_KEY}`).then(r => r.json())
                    ]).then(([channelData, videoData]) => {
                        if (channelData.items?.length > 0) {
                            const item = channelData.items[0];
                            const latestVid = videoData.items?.[0];
                            wikiData.youtube = { 
                                title: item.snippet.title, 
                                text: item.snippet.description, 
                                subs: parseInt(item.statistics.subscriberCount, 10).toLocaleString(), 
                                views: parseInt(item.statistics.viewCount, 10).toLocaleString(), 
                                customUrl: item.snippet.customUrl || "",
                                videoId: latestVid?.id?.videoId || null,
                                videoTitle: latestVid?.snippet?.title || null
                            };
                        }
                    });
                } else {
                    return fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`)
                        .then(r => r.json())
                        .then(vidData => {
                            if (vidData.items?.length > 0) {
                                const v = vidData.items[0];
                                wikiData.youtube = {
                                    title: v.snippet.channelTitle,
                                    text: v.snippet.description,
                                    subs: null,
                                    views: null,
                                    customUrl: "",
                                    videoId: v.id.videoId,
                                    videoTitle: v.snippet.title
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
        let statsLabel = (wikiData.youtube.subs && wikiData.youtube.views) 
            ? `<span style="font-size: 0.85rem; color: #aaa;">🔴 Subs: ${wikiData.youtube.subs} | Views: ${wikiData.youtube.views}</span><br><br>`
            : '';

        let videoEmbedHtml = wikiData.youtube.videoId ? `
            <div style="margin-top: 12px; margin-bottom: 8px;">
                <div style="font-size: 0.78rem; color: #ff4444; font-weight: bold; margin-bottom: 4px;">▶️ Latest Video: ${wikiData.youtube.videoTitle || ''}</div>
                <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
                    <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube-nocookie.com/embed/${wikiData.youtube.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        ` : '';

        blocksHtml.push(`
            <div style="background: #1a1a1a; padding: 14px; border-radius: 8px; border-left: 3px solid #ff0000; text-align: left;">
                <strong>📺 ${wikiData.youtube.title}</strong><br>
                ${statsLabel}
                <em>${wikiData.youtube.text}</em>
                ${videoEmbedHtml}
            </div>
        `);
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
        const channelPath = wikiData.youtube.customUrl ? wikiData.youtube.customUrl : (wikiData.youtube.videoId ? `watch?v=${wikiData.youtube.videoId}` : `@channel`);
        const ytActionLabel = wikiData.youtube.customUrl ? 'View Channel →' : (wikiData.youtube.videoId ? 'Watch Video →' : 'View Channel →');
        totalHTML += `<a href="https://www.youtube.com/${channelPath}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #ff4444; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">🔴 YouTube Hub</span><span>${ytActionLabel}</span></a>`;
    }
    if (wikiData.wikipedia && wikiData.wikipedia.text) {
        totalHTML += `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.wikipedia.title)}" target="_blank" style="display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; padding: 6px 10px; color: #4da3ff; text-decoration: none; font-size: 0.82rem; font-weight: bold;"><span style="color: #aaa; font-weight: normal;">📰 Wikipedia</span><span>Open Source →</span></a>`;
    }
    totalHTML += `</div></div>`;
    
    handleVaiiDataOutput(spokenText, totalHTML);
}

// ==========================================
// 9. EVENT LISTENERS
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
    if (prefsDrawer) prefsDrawer.style.display = "none";
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
        if (hubInput) hubInput.placeholder = "Listening...";
    });
    
    recognition.onresult = (e) => {
        if (micBtn) micBtn.classList.remove('listening');
        if (hubInput) {
            hubInput.value = e.results[0][0].transcript;
            hubInput.placeholder = "Type a command...";
        }
        autoSpeak = true;
        executeActionBtn?.click();
    };
    
    recognition.onerror = () => {
        if (micBtn) micBtn.classList.remove('listening');
        if (hubInput) hubInput.placeholder = "Type a command...";
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
        const spokenData = output ? output.getAttribute('data-spoken') : null;
        if (spokenData) {
            speakText(spokenData);
        } else if (output) {
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

        if (imagePreviewThumbnail) imagePreviewThumbnail.src = dataUrl;
        if (imagePreviewFilename) imagePreviewFilename.innerText = file.name;
        if (imagePreviewContainer) imagePreviewContainer.style.display = "flex";
        if (cameraTriggerBtn) cameraTriggerBtn.classList.add('active');
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
    
    if (cleanInput.startsWith('/')) {
        const slashCommands = [
            "/terminal",
            "/weather Orlando, FL",
            "/play Blinding Lights",
            "/movie Inception",
            "/draw Cyberpunk cityscape",
            "/repo facebook/react",
            "/qr https://vaii-two.vercel.app",
            "/timer 5m",
            "/note Check server deployments"
        ];
        customSuggestions = slashCommands.filter(c => c.toLowerCase().startsWith(cleanInput));
        updateDatalist([], [], [], customSuggestions);
        return;
    }

    if ("terminal".startsWith(cleanInput) || "shell".startsWith(cleanInput) || "sandbox".startsWith(cleanInput)) {
        customSuggestions.push("terminal", "shell", "sandbox");
    }

    if (/^(o|or|ord|orde|order|f|fi|fin|find|r|re|res|rese|reser|reserv|reserve)/i.test(cleanInput)) {
        let searchTarget = cleanInput.replace(/^(order|find|reserve|reservation)\s+/i, '').trim();
        if (searchTarget.length > 0) {
            customSuggestions = ALL_FOOD_SUGGESTIONS.filter(s => s.toLowerCase().includes(searchTarget)).slice(0, 8);
        } else {
            customSuggestions = ALL_FOOD_SUGGESTIONS.slice(0, 8);
        }
    }

    if ("play".startsWith(cleanInput)) {
        customSuggestions.push("play Blinding Lights", "play Bohemian Rhapsody", "play Starboy");
    }

        if ("mars".startsWith(cleanInput) || "rover".startsWith(cleanInput) || "curiosity".startsWith(cleanInput)) {
        customSuggestions.push("mars", "rover", "curiosity", "perseverance");
    }

    if ("timer".startsWith(cleanInput) || "stopwatch".startsWith(cleanInput)) {
        customSuggestions.push("timer 5m", "timer 1m30s", "timer 30s", "stopwatch");
    }

    if ("repo".startsWith(cleanInput) || "github".startsWith(cleanInput)) {
        customSuggestions.push("repo facebook/react", "repo vercel/next.js", "github torvalds/linux");
    }

    if ("tickets".startsWith(cleanInput) || "showtimes".startsWith(cleanInput)) {
        customSuggestions.push("tickets Superman", "tickets Batman", "tickets Avengers");
    }

    if ("stream".startsWith(cleanInput) || "watch".startsWith(cleanInput)) {
        customSuggestions.push("stream Inception", "stream Interstellar", "watch The Matrix");
    }

    if ("reserve".startsWith(cleanInput) || "reservation".startsWith(cleanInput)) {
        customSuggestions.push("reserve steak Orlando", "reserve Italian Miami", "reserve sushi New York");
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

    let searchUrlQuery = trimmedQuery.replace(/map of |show map |weather in |time in |sunset in |sunset |sunrise in |sunrise |solar |reserve |reservation |tickets |ticket |stream |watch |play |yt |youtube |repo |github /i, "").trim();
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
        if (cleanInput.startsWith("movie ") || cleanInput.startsWith("tickets ") || cleanInput.startsWith("stream ")) {
            let mTerm = trimmedQuery.replace(/^(movie|tickets|stream)\s+/i, '').trim();
            if (mTerm.length >= 2) {
                omdbSuggestionsFetch = fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(mTerm)}&apikey=${OMDB_API_KEY}`, { signal })
                    .then(res => res.json())
                    .then(data => data.Search ? data.Search.slice(0, 5).map(m => `movie ${m.Title}`) : [])
                    .catch(() => []);
            }
        }

        let itunesSuggestionsFetch = Promise.resolve([]);
        if (cleanInput.startsWith("song ") || cleanInput.startsWith("play ")) {
            let sTerm = trimmedQuery.replace(/^(song|play)\s+/i, '').trim();
            if (sTerm.length >= 2) {
                itunesSuggestionsFetch = fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(sTerm)}&entity=song&limit=4`, { signal })
                    .then(res => res.json())
                    .then(data => data.results ? data.results.map(r => `play ${r.trackName} - ${r.artistName}`) : [])
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

// ==========================================
// 10. AUTH EVENT HANDLERS
// ==========================================
googleSigninBtn?.addEventListener('click', () => {
    if (authError) authError.style.display = "none";
    signInWithPopup(auth, googleProvider)
        .catch(err => {
            if (err.code === "auth/popup-blocked") {
                signInWithRedirect(auth, googleProvider);
            } else {
                showAuthError(err);
            }
        });
});

authToggle?.addEventListener('click', () => {
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    if (authError) authError.style.display = "none";
    if (authTitle) authTitle.innerText = isLoginMode ? "✨ Create Account" : "🔒 Account Sign In";
    if (authSubmitBtn) authSubmitBtn.innerText = isLoginMode ? "Register User" : "Log In";
    if (authToggle) authToggle.innerText = isLoginMode ? "Already have an account? Sign In" : "Need an account? Register instead";
});

authSubmitBtn?.addEventListener('click', () => {
    const email = authEmail ? authEmail.value.trim() : "";
    const password = authPassword ? authPassword.value : "";
    const isLoginMode = (authSubmitBtn.innerText === "Log In");
    if (authError) authError.style.display = "none";
    if (!email || !password) return showAuthError("Please fill out all credentials.");
    
    if (isLoginMode) {
        signInWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err));
    } else {
        createUserWithEmailAndPassword(auth, email, password).catch(err => showAuthError(err));
    }
});

logoutActionBtn?.addEventListener('click', () => signOut(auth).catch(err => console.error(err)));

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (authContainer) authContainer.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        initializeFreshChatSession();
        clearActiveImage();
        renderHistoryListItems();
        if (prefsInstructionsInput) prefsInstructionsInput.value = localStorage.getItem('vaii_gemini_instructions') || '';
        if (prefsApiKeyInput) prefsApiKeyInput.value = localStorage.getItem('vaii_custom_api_key') || '';
        updateDatalist([], [], [], []);
    } else {
        if (authContainer) authContainer.style.display = "block";
        if (mainApp) mainApp.style.display = "none";
    }
});

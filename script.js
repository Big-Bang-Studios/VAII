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

import { launchTerminalSandbox } from "./terminal.js";
import { LOCAL_FOOD_DB, ALL_FOOD_SUGGESTIONS } from "./foodData.js";

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


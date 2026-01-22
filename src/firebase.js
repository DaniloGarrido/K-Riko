import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const DEFAULT_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const getFirebaseConfig = () => {
    const stored = localStorage.getItem('firebase_config');
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

let app = null;
let db = null;
let auth = null;

const initFirebase = () => {
    const config = getFirebaseConfig();
    if (config && !app) {
        app = initializeApp(config);
        db = getDatabase(app);
        auth = getAuth(app);
    }
};

export const getDb = () => {
    if (!db) initFirebase();
    return db;
};

export const getFirebaseAuth = () => {
    if (!auth) initFirebase();
    return auth;
};

export const saveConfig = (configStr) => {
    try {
        const config = JSON.parse(configStr);
        localStorage.setItem('firebase_config', JSON.stringify(config));
        location.reload();
        return true;
    } catch (e) {
        return false;
    }
};

export const isConfigured = () => !!getFirebaseConfig();

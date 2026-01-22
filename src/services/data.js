import { ref as vueRef } from 'vue';
import { getDb, isConfigured } from '../firebase';
import { ref as dbRef, get, set, update, onValue } from "firebase/database";

const LOCAL_JSON_PATHS = {
    completos: 'data_menu/completos.json',
    empanadas: 'data_menu/empanadas.json',
    sandwich: 'data_menu/sandwich.json',
    bebestibles: 'data_menu/bebestibles.json'
};

const DEFAULT_SETTINGS = {
    completos: {
        columns: [
            { key: 'salchicha', label: 'Salchicha' },
            { key: 'mechada', label: 'Ass / Mechada' },
            { key: 'champinon', label: 'Champiñon' }
        ]
    },
    sandwich: {
        columns: [
            { key: 'churrasco', label: 'Churrasco' },
            { key: 'mechada', label: 'Mechada' }
        ]
    },
};

export const useMenuData = () => {
    const defaultCategories = ['completos', 'empanadas', 'sandwich', 'bebestibles'];

    // Helper to normalize data with defaults and migration
    const normalizeData = async (data = {}) => {
        // We fetch JSON for any missing category, even if some data exists in Firebase
        for (const cat of defaultCategories) {
            if (!data[cat] || data[cat].length === 0) {
                try {
                    const res = await fetch(LOCAL_JSON_PATHS[cat]);
                    if (res.ok) {
                        const json = await res.json();
                        // Extract the array from the JSON wrapper { "completos": [...] }
                        const items = json[cat] || [];
                        // Ensure each item has default visible prop
                        data[cat] = items.map(item => ({ ...item, visible: item.visible !== false }));
                    }
                } catch (e) {
                    console.warn(`Could not load local JSON for ${cat}`, e);
                    if (!data[cat]) data[cat] = [];
                }
            }
        }

        if (!data._settings) {
            data._settings = { ...DEFAULT_SETTINGS };
        }
        return data;
    };

    const fetchMenu = async () => {
        let data = {};
        if (isConfigured()) {
            const db = getDb();
            const snapshot = await get(dbRef(db));
            if (snapshot.exists()) {
                data = snapshot.val();
            }
        }
        return normalizeData(data);
    };

    const subscribeToMenu = (callback) => {
        if (!isConfigured()) {
            fetchMenu().then(callback);
            return () => { };
        }

        const db = getDb();
        const unsubscribe = onValue(dbRef(db), async (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : {};
            const normalized = await normalizeData(data);
            callback(normalized);
        });

        return unsubscribe;
    };

    const updateItem = async (category, index, itemData) => {
        if (!isConfigured()) return;
        const db = getDb();
        const updates = {};
        updates[`${category}/${index}`] = itemData;
        await update(dbRef(db), updates);
    };

    const saveMenu = async (fullData) => {
        if (!isConfigured()) throw new Error("Firebase no está configurado");
        const db = getDb();
        await set(dbRef(db), fullData);
    };

    return { fetchMenu, subscribeToMenu, saveMenu, updateItem };
};

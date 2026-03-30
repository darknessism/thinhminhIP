/**
 * Shared i18n module — used across all pages.
 * Each page defines its own `window.PAGE_TRANSLATIONS = { en:{}, ja:{}, vn:{} }`
 * then calls `I18n.init(window.PAGE_TRANSLATIONS)`.
 *
 * Language choice is persisted in localStorage so it survives page navigation.
 */
window.I18n = (() => {
    const STORAGE_KEY = 'tmip-lang';
    const SUPPORTED = ['en', 'ja', 'vn'];
    const DEFAULT = 'en';

    let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT;
    if (!SUPPORTED.includes(currentLang)) currentLang = DEFAULT;

    let translations = {};
    let changeListeners = [];

    /** Apply translations to all [data-i18n] elements in the DOM */
    function applyDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = translations[currentLang]?.[key];
            if (val !== undefined) el.innerHTML = val;
        });
        // Also apply to title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = translations[currentLang]?.[key];
            if (val !== undefined) el.setAttribute('title', val);
        });
        document.documentElement.lang = currentLang === 'vn' ? 'vi' : currentLang;
    }

    /** Update flag button styling */
    function updateFlags() {
        SUPPORTED.forEach(lang => {
            const btn = document.getElementById('btn-' + lang);
            if (!btn) return;
            if (lang === currentLang) {
                btn.classList.remove('opacity-40', 'border-transparent');
                btn.classList.add('lang-active');
            } else {
                btn.classList.add('opacity-40', 'border-transparent');
                btn.classList.remove('lang-active');
            }
        });
    }

    return {
        /** Get current language */
        getLang() { return currentLang; },

        /** Switch language — persists to localStorage, updates DOM, fires listeners */
        setLanguage(lang) {
            if (!SUPPORTED.includes(lang)) return;
            currentLang = lang;
            localStorage.setItem(STORAGE_KEY, lang);
            applyDOM();
            updateFlags();
            changeListeners.forEach(fn => fn(lang));
        },

        /** Get a single translation value */
        t(key) {
            return translations[currentLang]?.[key]
                || translations[DEFAULT]?.[key]
                || key;
        },

        /** Register a callback for language changes (useful for React) */
        onChange(fn) {
            changeListeners.push(fn);
            return () => { changeListeners = changeListeners.filter(f => f !== fn); };
        },

        /** Initialize with page-specific translations and apply */
        init(pageTrans) {
            translations = pageTrans;
            applyDOM();
            updateFlags();
        }
    };
})();

(() => {
    const storageKey = 'portfolio-theme';
    let preference = null;
    let toggle;

    try {
        const stored = localStorage.getItem(storageKey);
        if (stored === 'light' || stored === 'dark') preference = stored;
    } catch {}

    function applyTheme() {
        const theme = preference || 'light';
        document.documentElement.dataset.theme = theme;
        if (toggle) toggle.checked = theme === 'dark';
    }

    applyTheme();
    window.addEventListener('storage', (event) => {
        if (event.key !== storageKey && event.key !== null) return;
        preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
        applyTheme();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const navigation = document.getElementById('navContainer');
        if (!navigation) return;
        const label = document.createElement('label');
        label.className = 'theme-toggle';
        toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.setAttribute('role', 'switch');
        toggle.setAttribute('aria-label', 'Dark mode');
        const caption = document.createElement('span');
        caption.textContent = 'Dark mode';
        caption.setAttribute('aria-hidden', 'true');
        label.append(toggle, caption);
        navigation.append(label);
        applyTheme();
        toggle.addEventListener('change', () => {
            preference = toggle.checked ? 'dark' : 'light';
            applyTheme();
            try {
                localStorage.setItem(storageKey, preference);
            } catch {}
        });
    });
})();
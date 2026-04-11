class Hamburger {
    constructor(toggleId, containerId) {
        // Using IDs for both toggle and container
        this.navToggle = document.getElementById(toggleId);
        this.navContainer = document.getElementById(containerId);
        this.navItems = this.navContainer
            ? Array.from(this.navContainer.querySelectorAll('.nav-item'))
            : [];

        this.setCurrentNavItem();

        if (this.navToggle && this.navContainer) {
            this.navToggle.addEventListener('click', this.toggleMenu.bind(this));
        }
    }

    getPageKey(pathname) {
        const cleanPath = (pathname || '').split('?')[0].toLowerCase();
        const lastSegment = cleanPath.split('/').filter(Boolean).pop() || 'index.html';
        return lastSegment;
    }

    setCurrentNavItem() {
        if (!this.navItems.length) {
            return;
        }

        const currentKey = this.getPageKey(window.location.pathname);

        this.navItems.forEach((item) => {
            const href = item.getAttribute('href') || '';
            const itemUrl = new URL(href, window.location.href);
            const itemKey = this.getPageKey(itemUrl.pathname);

            if (itemKey === currentKey) {
                item.setAttribute('aria-current', 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }

    toggleMenu() {
        const expanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !expanded);
        this.navContainer.classList.toggle('open');
        this.navToggle.classList.toggle('open'); // Toggle the button's state as well
    }
}

// Instantiate Hamburger with specific IDs
new Hamburger('hamburgerTogle', 'navContainer');

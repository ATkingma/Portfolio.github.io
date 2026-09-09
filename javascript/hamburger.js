class Hamburger {
    constructor(toggleId, containerId) {
        // Using IDs for both toggle and container
        this.navToggle = document.getElementById(toggleId);
        this.navContainer = document.getElementById(containerId);
        this.navItems = this.navContainer
            ? Array.from(this.navContainer.querySelectorAll('.nav-item'))
            : [];

        this.setCurrentNavItem();
        window.addEventListener('hashchange', () => this.setCurrentNavItem());
        this.trackSections();

        if (this.navToggle && this.navContainer) {
            const navigation = this.navContainer.querySelector('nav');
            if (navigation) {
                navigation.id = navigation.id || 'main-navigation';
                this.navToggle.setAttribute('aria-controls', navigation.id);
            }
            this.navToggle.addEventListener('click', this.toggleMenu.bind(this));
            this.navContainer.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && this.navToggle.getAttribute('aria-expanded') === 'true') {
                    this.setMenuOpen(false);
                    this.navToggle.focus();
                }
            });
            this.navItems.forEach((item) => {
                item.addEventListener('click', () => {
                    this.setMenuOpen(false);
                    if (item.getAttribute('href').startsWith('#')) {
                        const target = document.getElementById(item.hash.slice(1));
                        if (target) {
                            target.setAttribute('tabindex', '-1');
                            target.focus({ preventScroll: true });
                        }
                    }
                });
            });
        }
    }

    getPageKey(pathname) {
        const cleanPath = (pathname || '').split('?')[0].toLowerCase();
        const lastSegment = cleanPath.split('/').filter(Boolean).pop() || 'index.html';
        return lastSegment;
    }

    trackSections() {
        const sections = this.navItems
            .filter((item) => item.getAttribute('href').startsWith('#'))
            .map((item) => ({ item, target: document.getElementById(item.hash.slice(1)) }))
            .filter(({ target }) => target);
        if (!sections.length) {
            return;
        }

        let scheduled = false;
        const update = () => {
            scheduled = false;
            const boundary = this.navContainer.getBoundingClientRect().bottom + 32;
            let active = sections[0].item;
            sections.forEach(({ item, target }) => {
                const bounds = target.getBoundingClientRect();
                if (target instanceof HTMLDetailsElement && (!target.open || bounds.bottom <= boundary)) {
                    return;
                }
                if (bounds.top <= boundary) {
                    active = item;
                }
            });
            if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                active = sections[sections.length - 1].item;
            }
            this.navItems.forEach((item) => {
                if (item === active) {
                    item.setAttribute('aria-current', 'location');
                } else {
                    item.removeAttribute('aria-current');
                }
            });
        };
        const schedule = () => {
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(update);
            }
        };
        const openTarget = (hash) => {
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            const details = target?.closest('details');
            if (details) {
                details.open = true;
            }
            schedule();
        };

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (link) {
                openTarget(link.hash);
            }
        });
        window.addEventListener('hashchange', () => openTarget(window.location.hash));
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        window.addEventListener('load', schedule);
        document.addEventListener('toggle', schedule, true);
        openTarget(window.location.hash);
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

            const matchesHash = !itemUrl.hash || itemUrl.hash === (window.location.hash || '#home');
            if (itemKey === currentKey && matchesHash) {
                item.setAttribute('aria-current', itemUrl.hash ? 'location' : 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }

    toggleMenu() {
        const expanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.setMenuOpen(!expanded);
    }

    setMenuOpen(open) {
        this.navToggle.setAttribute('aria-expanded', String(open));
        this.navContainer.classList.toggle('open', open);
        this.navToggle.classList.toggle('open', open);
    }
}

// Instantiate Hamburger with specific IDs
new Hamburger('hamburgerTogle', 'navContainer');

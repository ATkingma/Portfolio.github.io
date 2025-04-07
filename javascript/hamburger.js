class Hamburger {
    constructor(toggleId, containerId) {
        // Using IDs for both toggle and container
        this.navToggle = document.getElementById(toggleId);
        this.navContainer = document.getElementById(containerId);

        if (this.navToggle && this.navContainer) {
            this.navToggle.addEventListener('click', this.toggleMenu.bind(this));
        }
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

const copyButton = document.querySelector('.copy-email');
const emailLink = document.getElementById('contact-email');
const copyStatus = document.getElementById('copy-status');

copyButton.addEventListener('click', async () => {
    copyStatus.textContent = '';
    try {
        await navigator.clipboard.writeText(emailLink.textContent.trim());
        copyStatus.textContent = 'Email address copied.';
    } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(emailLink);
        selection.removeAllRanges();
        selection.addRange(range);
        copyStatus.textContent = 'Email address selected. Copy it using your device\'s copy command.';
    }
});

const tabList = document.querySelector('.experience-tabs');
const skillButtons = Array.from(document.querySelectorAll('button.skill-tag'));

function closeSkillTooltips() {
    skillButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
}

skillButtons.forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    const showTooltip = () => {
        closeSkillTooltips();
        button.setAttribute('aria-expanded', 'true');
    };
    button.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse') showTooltip();
    });
    button.addEventListener('pointerleave', () => {
        if (document.activeElement !== button) button.setAttribute('aria-expanded', 'false');
    });
    button.addEventListener('focus', showTooltip);
    button.addEventListener('click', showTooltip);
    button.addEventListener('blur', () => button.setAttribute('aria-expanded', 'false'));
    button.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSkillTooltips();
            event.stopPropagation();
        }
    });
});

document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('button.skill-tag')) closeSkillTooltips();
});

const tabs = Array.from(tabList.querySelectorAll('.tab-button'));
tabList.setAttribute('role', 'tablist');
tabList.setAttribute('aria-label', 'Experience');
tabs.forEach((tab, index) => {
    const panel = document.getElementById(index === 0 ? 'work-content' : 'education-content');
    tab.id = `${panel.id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
    tab.tabIndex = index === 0 ? 0 : -1;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('keydown', (event) => {
        let targetIndex;
        if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') targetIndex = 0;
        if (event.key === 'End') targetIndex = tabs.length - 1;
        if (targetIndex === undefined) return;
        event.preventDefault();
        tabs[targetIndex].focus();
        tabs[targetIndex].click();
    });
});
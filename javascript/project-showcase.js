/**
 * Project Showcase Page JavaScript
 * Provides functionality for collapsible code blocks and copy-to-clipboard
 */

/**
 * Toggle code block expansion/collapse
 * @param {HTMLElement} header - The code block header element that was clicked
 */
function toggleCode(header) {
  const codeContent = header.nextElementSibling;
  const toggle = header.querySelector('.code-toggle');
  
  if (codeContent.classList.contains('expanded')) {
    codeContent.classList.remove('expanded');
    toggle.style.transform = 'rotate(0deg)';
  } else {
    codeContent.classList.add('expanded');
    toggle.style.transform = 'rotate(90deg)';
  }
}

/**
 * Copy code block content to clipboard
 * @param {Event} event - Click event object
 * @param {HTMLElement} button - The copy button element
 */
function copyCode(event, button) {
  event.stopPropagation();
  const codeBlock = button.closest('.code-block').querySelector('code');
  const text = codeBlock.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = '#2ea44f';
    button.style.color = 'white';
    button.style.borderColor = '#2ea44f';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
      button.style.borderColor = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    button.textContent = 'Failed!';
    button.style.background = '#dc3545';
    button.style.color = 'white';
    button.style.borderColor = '#dc3545';
    
    setTimeout(() => {
      button.textContent = 'Copy';
      button.style.background = '';
      button.style.color = '';
      button.style.borderColor = '';
    }, 2000);
  });
}

/**
 * Initialize all code blocks on page load (optional)
 * Adds keyboard navigation support
 */
document.addEventListener('DOMContentLoaded', function() {
  const codeHeaders = document.querySelectorAll('.code-block-header');
  
  // Add keyboard navigation
  codeHeaders.forEach(header => {
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    
    header.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCode(header);
      }
    });
  });
});

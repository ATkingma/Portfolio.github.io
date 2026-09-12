class FooterElement extends HTMLElement {
    constructor() {
      super();
  

      const shadow = this.attachShadow({ mode: "open" });
  

      const footer = document.createElement("footer");
      footer.setAttribute("class", "footer");
  

      const currentYear = new Date().getFullYear();
      const content = `
        <div class="footer-line"></div>
          <div class="footer-content">
              <p>&copy; ${currentYear} Timme Kingma. All Rights Reserved.</p>
          </div>
        `;
      footer.innerHTML = content;
  

      const style = document.createElement("style");
      style.textContent = `
          .footer {
            color: var(--text-dim, rgba(255, 255, 255, 0.73));
            padding: 20px;
            text-align: center;
            font-family: inherit;
            font-size: 14px;
          }
    
          .footer-content nav {
            margin-top: 10px;
          }
    
          .footer-content a {
            color: var(--accent, #ffffff);
            text-decoration: none;
            margin: 0 10px;
          }
    
          .footer-content a:hover {
            text-decoration: underline;
          }
  
          .footer-line {
            width: 100%;
            height: 1px;
            background-color: var(--border-soft, #ffffff25);
            margin-top: 20px;
          }
        `;
  

      shadow.appendChild(style);
      shadow.appendChild(footer);
    }
  }
  

  customElements.define("footer-element", FooterElement);
  
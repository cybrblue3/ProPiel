class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .navbar {
          transition: all 0.3s ease;
        }
        .navbar.scrolled {
          background-color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .nav-link {
          position: relative;
        }
        .nav-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #3B82F6;
          transition: width 0.3s ease;
        }
        .nav-link:hover:after {
          width: 100%;
        }
      </style>
      <nav class="navbar fixed w-full z-50 py-4 px-6 md:px-12">
        <div class="flex justify-between items-center max-w-7xl mx-auto">
          <a href="/" class="flex items-center">
            <img src="http://static.photos/medical/200x200/10" alt="ProPiel Logo" class="h-12 mr-3">
            <span class="text-2xl font-bold text-blue-600">ProPiel</span>

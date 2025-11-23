'use strict';

/* ===== Enable Bootstrap Popover (on element  ====== */
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

/* ==== Enable Bootstrap Alert ====== */
//var alertList = document.querySelectorAll('.alert')
"use strict";

function initApp() {
  /* ===== Enable Bootstrap Popover (on element) ====== */
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
  if (popoverTriggerList && popoverTriggerList.length) {
    try {
      const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    } catch (e) {
      // bootstrap or popper might not be available; ignore
    }
  }

  /* ==== Enable Bootstrap Alert ====== */
  const alertList = document.querySelectorAll('.alert')
  if (alertList && alertList.length) {
    try {
      const alerts = [...alertList].map(element => new bootstrap.Alert(element))
    } catch (e) {
      // ignore
    }
  }

  /* ===== Responsive Sidepanel ====== */
  // if Vue manages the sidepanel, skip legacy handlers to avoid duplicate/conflicting logic
  if (!(window.__vueHandlesSidepanel)) {
    const sidePanelToggler = document.getElementById('sidepanel-toggler');
    const sidePanel = document.getElementById('app-sidepanel');
    const sidePanelDrop = document.getElementById('sidepanel-drop');
    const sidePanelClose = document.getElementById('sidepanel-close');

    function responsiveSidePanel() {
      if (!sidePanel) return
      let w = window.innerWidth;
      if (w >= 1200) {
        sidePanel.classList.remove('sidepanel-hidden');
        sidePanel.classList.add('sidepanel-visible');
      } else {
        sidePanel.classList.remove('sidepanel-visible');
        sidePanel.classList.add('sidepanel-hidden');
      }
    }

    // run initially and on resize
    responsiveSidePanel()
    window.addEventListener('resize', responsiveSidePanel)

    if (sidePanelToggler && sidePanel) {
      sidePanelToggler.addEventListener('click', () => {
        if (sidePanel.classList.contains('sidepanel-visible')) {
          sidePanel.classList.remove('sidepanel-visible');
          sidePanel.classList.add('sidepanel-hidden');
        } else {
          sidePanel.classList.remove('sidepanel-hidden');
          sidePanel.classList.add('sidepanel-visible');
        }
      })
    }

    if (sidePanelClose && sidePanelToggler) {
      sidePanelClose.addEventListener('click', (e) => {
        e.preventDefault();
        sidePanelToggler.click();
      })
    }

    if (sidePanelDrop && sidePanelToggler) {
      sidePanelDrop.addEventListener('click', (e) => {
        sidePanelToggler.click();
      })
    }
  }

  /* ====== Mobile search ======= */
  const searchMobileTrigger = document.querySelector('.search-mobile-trigger');
  const searchBox = document.querySelector('.app-search-box');

  if (searchMobileTrigger && searchBox) {
    searchMobileTrigger.addEventListener('click', () => {
      searchBox.classList.toggle('is-visible');
      const searchMobileTriggerIcon = document.querySelector('.search-mobile-trigger-icon');
      if (searchMobileTriggerIcon) {
        if (searchMobileTriggerIcon.classList.contains('fa-magnifying-glass')) {
          searchMobileTriggerIcon.classList.remove('fa-magnifying-glass');
          searchMobileTriggerIcon.classList.add('fa-xmark');
        } else {
          searchMobileTriggerIcon.classList.remove('fa-xmark');
          searchMobileTriggerIcon.classList.add('fa-magnifying-glass');
        }
      }
    })
  }
}

// Ensure init runs after everything loaded (this waits until Vue has mounted its DOM too)
if (document.readyState === 'complete') {
  // already loaded
  initApp()
} else {
  window.addEventListener('load', initApp)
}



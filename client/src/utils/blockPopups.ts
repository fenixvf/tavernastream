// Utility to prevent unwanted popup ads that open new tabs
// NOTE: This does NOT block ads inside the PlayerFlix iframe - those are allowed and necessary

let popupBlockerInstalled = false;
let popupAttempts = 0;
const MAX_POPUP_ATTEMPTS = 3;

export function installPopupBlocker() {
  if (popupBlockerInstalled) return;
  
  // Override window.open to prevent ONLY new window/tab popups from ads
  const originalOpen = window.open;
  window.open = function(...args) {
    const url = args[0] ? String(args[0]) : '';
    
    // Always allow same-origin opens (our own modals/windows)
    if (!url || url.startsWith('/') || url.startsWith(window.location.origin)) {
      return originalOpen.apply(this, args);
    }
    
    // Check if this is a user-initiated action (not an automated popup)
    // If the user clicks within 100ms, it's likely legitimate
    const timeSinceLastClick = Date.now() - (window as any)._lastUserClick || 0;
    if (timeSinceLastClick < 100) {
      // User clicked something, allow it (might be legitimate external link)
      return originalOpen.apply(this, args);
    }
    
    // Block automated popup attempts (ads trying to open new windows)
    popupAttempts++;
    console.log(`[Popup Blocker] Blocked automated popup #${popupAttempts}:`, url);
    
    // Show a subtle notification after multiple attempts
    if (popupAttempts >= MAX_POPUP_ATTEMPTS) {
      console.log('[Popup Blocker] Multiple popup attempts blocked');
    }
    
    return null;
  };
  
  // Track user clicks to distinguish them from automated popups
  document.addEventListener('click', () => {
    (window as any)._lastUserClick = Date.now();
  }, true);
  
  popupBlockerInstalled = true;
  console.log('[Popup Blocker] Installed - allows ads within iframes, blocks popup windows');
}

export function uninstallPopupBlocker() {
  // Reset would require storing original window.open
  popupBlockerInstalled = false;
}

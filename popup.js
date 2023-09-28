document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
  document.getElementById('generate').addEventListener('click', generatePassword);
  document.getElementById('showHistory').addEventListener('click', showHistory);
  document.getElementById('deleteHistory').addEventListener('click', deleteHistory);
});

function toggleTheme() {
  const themeIcon = document.getElementById('themeIcon');
  const currentTheme = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-light').trim();

  if (currentTheme === '#fff') {
    // Switch to dark theme
    document.documentElement.style.setProperty('--text-color-light', '#fff');
    document.documentElement.style.setProperty('--bg-color-light', '#333');
    document.body.setAttribute('data-theme', 'dark');
    themeIcon.src = "light-dark-mode.png";  // Set the source for light theme icon
  } else {
    // Switch to light theme
    document.documentElement.style.setProperty('--text-color-light', '#000');
    document.documentElement.style.setProperty('--bg-color-light', '#fff');
    document.body.setAttribute('data-theme', 'light');
    themeIcon.src = "light-dark-mode.png";  // Set the source for dark theme icon

  }
}

function generatePassword() {
  let charset = "";

  // Read selected options
  if (document.getElementById('includeLowercase').checked) {
    charset += "abcdefghijklmnopqrstuvwxyz";
  }
  if (document.getElementById('includeUppercase').checked) {
    charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  if (document.getElementById('includeNumbers').checked) {
    charset += "0123456789";
  }
  if (document.getElementById('includeSymbols').checked) {
    charset += "!@#$%^&*()-_=+";
  }

  if (charset.length === 0) {
    const alertText = 'Please select at least one type of character for the password.'
    // alert("Please select at least one type of character for the password.");
    // document.getElementById('password').innerText = alertText;
    document.getElementById('password').innerHTML = `<p style="color:red">${alertText}</p>`;
    return;
  }

  const length = parseInt(document.getElementById('length').value) || 12;
  let retVal = "";

  // Generate password
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    retVal += charset.charAt(randomIndex);
  }

  // Save the generated password to history
  chrome.storage.local.get({ passwordHistory: [] }, (result) => {
    const history = result.passwordHistory;
    history.unshift(retVal);      
    chrome.storage.local.set({ passwordHistory: history }, () => {
      console.log('Password saved to history.');
    });
  });
  
  // Display generated password
  document.getElementById('password').innerHTML = `<p>${retVal} 
                                <button id="copyButtonGeneratedPassword">
                                  <img src="copy_icon.png" alt="Copy" width="16" height="16">
                                </button>
                               </p>`;
  document.getElementById(`copyButtonGeneratedPassword`).addEventListener('click', () => copyPasswordToClipboard(retVal));
}



function showHistory() {
  // Fetch and display the saved password history
  chrome.storage.local.get({ passwordHistory: [] }, (result) => {
    const history = result.passwordHistory;
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '<h2>Password History</h2>';
    
    history.forEach((password, index) => {
      const passwordRow = document.createElement('div');
      passwordRow.innerHTML = `<p>${index + 1}. ${password} 
                                <button id="copyButton${index}">
                                  <img src="copy_icon.png" alt="Copy" width="16" height="16">
                                </button>
                                <button id="deleteSingleHistory${index}">Delete</button>
                               </p>`;
      historyDiv.appendChild(passwordRow);
      document.getElementById(`copyButton${index}`).addEventListener('click', () => copyPasswordToClipboard(password));
      document.getElementById(`deleteSingleHistory${index}`).addEventListener('click', () => deleteSingleHistory(index));
    });
  });
}

function deleteHistory() {
  // Delete all password history
  console.log('Password history deleted called');
  chrome.storage.local.set({ passwordHistory: [] }, () => {
    console.log('Password history deleted.');
    showHistory(); // Refresh the history display
  });
}

function deleteSingleHistory(index) {
  // Delete a single history item
  chrome.storage.local.get({ passwordHistory: [] }, (result) => {
    const history = result.passwordHistory;
    history.splice(index, 1); // Remove the item at the specified index
    chrome.storage.local.set({ passwordHistory: history }, () => {
      console.log('Single history item deleted.');
      showHistory(); // Refresh the history display
    });
  });
}

// Function to copy a password to the clipboard
async function copyPasswordToClipboard(password) {
  try {
    await navigator.clipboard.writeText(password);
    console.log('Password copied to clipboard.');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}
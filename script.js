/**
 * Secure File Access Portal
 * Handles login, session management, timing, and download functionality
 */

// Constants & Configuration
const HARDCODED_PASSWORD = "access2024"; // Change this in production!
const WAIT_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const FILE_URL = "https://example.com/files/generated_file.ext"; // Replace with actual file URL
const SESSION_LOCK_KEY = "fileDownloaderSession";
const STALE_LOCK_THRESHOLD_MS = (5 + 3) * 60 * 1000; // Wait time + 3 min buffer

// DOM References
const scenes = {
  login: document.getElementById("loginScene"),
  waiting: document.getElementById("waitingScene"),
  download: document.getElementById("downloadScene"),
  busy: document.getElementById("busyScene")
};

const elements = {
  form: document.querySelector("form"),
  passwordInput: document.getElementById("passwordInput"),
  loginButton: document.getElementById("loginButton"),
  loginError: document.getElementById("loginError"),
  timerDisplay: document.getElementById("timerDisplay"),
  timerProgress: document.querySelector(".progress-bar-inner"),
  downloadLink: document.getElementById("downloadLink"),
  downloadError: document.getElementById("downloadError")
};

// State
let currentScene = 'login';
let isProcessing = false;
let timerIntervalId = null;
let endTime = 0;

// Scene Management
function showScene(sceneId) {
  // Hide current scene with fade out
  const currentSceneElement = scenes[currentScene];
  if (currentSceneElement) {
    currentSceneElement.style.opacity = "0";
    setTimeout(() => {
      currentSceneElement.style.display = "none";
      
      // Show new scene with fade in
      const newScene = scenes[sceneId];
      if (newScene) {
        newScene.style.display = "block";
        // Trigger reflow for transition to work
        void newScene.offsetWidth;
        newScene.style.opacity = "1";
        currentScene = sceneId;
      }
    }, 300); // Match transition duration in CSS
  }
}

// Session Lock Handling
function setSessionLock(status) {
  try {
    localStorage.setItem(SESSION_LOCK_KEY, JSON.stringify({
      timestamp: Date.now(),
      status: status
    }));
    return true;
  } catch (error) {
    console.error("Could not set session lock:", error);
    return false;
  }
}

function clearSessionLock() {
  try {
    localStorage.removeItem(SESSION_LOCK_KEY);
    return true;
  } catch (error) {
    console.error("Could not clear session lock:", error);
    return false;
  }
}

function checkSessionLock() {
  try {
    const lockData = localStorage.getItem(SESSION_LOCK_KEY);
    if (!lockData) return null;
    
    return JSON.parse(lockData);
  } catch (error) {
    console.error("Error reading session lock:", error);
    return null;
  }
}

// Timer Functions
function startWaitingTimer() {
  isProcessing = true;
  
  // Calculate end time
  endTime = Date.now() + WAIT_DURATION_MS;
  
  // Reset and start animation
  elements.timerProgress.style.animation = 'none';
  void elements.timerProgress.offsetWidth; // Force reflow
  elements.timerProgress.style.animation = `fill ${WAIT_DURATION_MS / 1000}s linear forwards`;
  
  // Update timer immediately for first display
  updateTimerDisplay();
  
  // Set interval to update timer
  timerIntervalId = setInterval(() => {
    if (!updateTimerDisplay()) {
      clearInterval(timerIntervalId);
      prepareDownload();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const now = Date.now();
  const remainingMs = Math.max(0, endTime - now);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  elements.timerDisplay.textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Return false when timer completes
  return remainingMs > 0;
}

// Download Preparation
async function prepareDownload() {
  setSessionLock('ready');
  
  try {
    // Optional: Validate file exists
    const response = await fetch(FILE_URL, { method: 'HEAD' });
    
    if (response.ok) {
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'generated_file.ext'; // Default filename
      
      if (contentDisposition) {
        const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Set download link properties
      elements.downloadLink.href = FILE_URL;
      elements.downloadLink.download = filename;
      elements.downloadLink.setAttribute('aria-disabled', 'false');
      elements.downloadLink.classList.remove('button-disabled');
      
      // Hide any previous errors
      elements.downloadError.style.display = 'none';
    } else {
      throw new Error(`File validation failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Download preparation error:", error);
    
    // Show error message but still allow attempting download
    elements.downloadError.textContent = "Warning: The file may not be fully ready or accessible. You can still try downloading, but please contact support if issues persist.";
    elements.downloadError.style.display = 'block';
    
    // Make the button look different but still clickable
    elements.downloadLink.classList.add('button-warning');
  } finally {
    showScene('download');
    isProcessing = false;
  }
}

// Event Handlers
function handleLogin(event) {
  event.preventDefault();
  
  if (isProcessing) return;
  isProcessing = true;
  
  const password = elements.passwordInput.value.trim();
  elements.loginError.style.display = 'none';
  elements.loginButton.disabled = true;
  elements.loginButton.classList.add('button-disabled');
  
  // Simulate network delay for UX
  setTimeout(() => {
    if (password === HARDCODED_PASSWORD) {
      setSessionLock('waiting');
      showScene('waiting');
      startWaitingTimer();
    } else {
      elements.loginError.textContent = "Invalid password. Please try again.";
      elements.loginError.style.display = 'block';
      elements.passwordInput.value = '';
      elements.passwordInput.focus();
      elements.loginButton.disabled = false;
      elements.loginButton.classList.remove('button-disabled');
      isProcessing = false;
    }
  }, 500);
}

function handleDownload() {
  // Schedule clearing the lock after download starts
  setTimeout(() => {
    clearSessionLock();
  }, 1000);
}

// Initialization
function initializeApp() {
  // Add CSS transitions to scenes
  Object.values(scenes).forEach(scene => {
    if (scene) {
      scene.style.transition = 'opacity 300ms ease';
      scene.style.opacity = '0';
      scene.style.display = 'none';
    }
  });
  
  // Check session lock
  const lockData = checkSessionLock();
  
  if (lockData) {
    const lockAge = Date.now() - lockData.timestamp;
    
    // Check if lock is stale
    if (lockAge > STALE_LOCK_THRESHOLD_MS) {
      console.log("Detected and cleared stale lock");
      clearSessionLock();
      currentScene = 'login';
      scenes.login.style.display = 'block';
      scenes.login.style.opacity = '1';
    } else if (lockData.status === 'waiting') {
      // Active session in progress
      currentScene = 'busy';
      scenes.busy.style.display = 'block';
      scenes.busy.style.opacity = '1';
    } else if (lockData.status === 'ready') {
      // Previous session completed but user didn't close tab
      clearSessionLock(); // Assume previous user finished
      currentScene = 'login';
      scenes.login.style.display = 'block';
      scenes.login.style.opacity = '1';
    }
  } else {
    // No lock, show login
    currentScene = 'login';
    scenes.login.style.display = 'block';
    scenes.login.style.opacity = '1';
  }
  
  // Focus password input if on login scene
  if (currentScene === 'login') {
    elements.passwordInput.focus();
  }
  
  // Add event listeners
  elements.form.addEventListener('submit', handleLogin);
  elements.downloadLink.addEventListener('click', handleDownload);
  
  // Attempt to clear lock on page unload if download completed
  window.addEventListener('beforeunload', () => {
    if (!isProcessing) {
      clearSessionLock();
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Add CSS for transitions
document.head.insertAdjacentHTML('beforeend', `
  <style>
    section {
      transition: opacity 300ms ease;
    }
    .button-disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .button-warning {
      background-color: #ffcc00;
      border-color: #ffcc00;
      color: #000;
    }
  </style>
`);

// Hermes Frontend JavaScript

// View Mode Management
let currentViewMode = localStorage.getItem('hermes_view_mode') || 'normal';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initModeSelector();
    initProfileMenu();
    initScanButton();
    updateModeDisplay();
});

// Mode Selector
function initModeSelector() {
    const modeSelectorBtn = document.getElementById('modeSelectorBtn');
    const modeDropdown = document.getElementById('modeDropdown');
    const modeSelector = document.getElementById('modeSelector');
    const modeOptions = document.querySelectorAll('.mode-option');

    if (!modeSelectorBtn || !modeDropdown) return;

    // Toggle dropdown on click
    modeSelectorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = modeDropdown.style.display === 'block';
        modeDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Show dropdown on hover
    modeSelector.addEventListener('mouseenter', function() {
        modeDropdown.style.display = 'block';
    });

    modeSelector.addEventListener('mouseleave', function() {
        modeDropdown.style.display = 'none';
    });

    // Mode selection
    modeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            setViewMode(mode);
            modeDropdown.style.display = 'none';
            
            // Update active state
            modeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!modeSelector.contains(e.target)) {
            modeDropdown.style.display = 'none';
        }
    });

    // Set initial active mode
    modeOptions.forEach(option => {
        if (option.getAttribute('data-mode') === currentViewMode) {
            option.classList.add('active');
        }
    });
}

// Profile Menu
function initProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const profileDropdown = document.getElementById('profileDropdown');

    if (!profileMenu || !profileDropdown) return;

    profileMenu.addEventListener('mouseenter', function() {
        profileDropdown.style.display = 'block';
    });

    profileMenu.addEventListener('mouseleave', function() {
        profileDropdown.style.display = 'none';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!profileMenu.contains(e.target)) {
            profileDropdown.style.display = 'none';
        }
    });
}


// Scan Button
function initScanButton() {
    const scanBtn = document.getElementById('scanBtn');
    
    if (!scanBtn) return;

    scanBtn.addEventListener('click', async function() {
        this.style.animation = 'spin 1s linear infinite';
        
        try {
            const response = await fetch('http://localhost:8000/api/library/scan', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert(`Escaneig completat!\n${data.stats.series} sèries\n${data.stats.files} arxius`);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error scanning:', error);
            alert('Error durant l\'escaneig. Assegura\'t que el backend està en marxa.');
        } finally {
            this.style.animation = '';
        }
    });
}

// Set View Mode
function setViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem('hermes_view_mode', mode);
    updateModeDisplay();
    console.log('View mode set to:', mode);
}

// Update Mode Display
function updateModeDisplay() {
    const currentModeSpan = document.getElementById('currentMode');
    if (currentModeSpan) {
        const modeLabels = {
            'normal': 'Normal',
            'mixed': 'Mixt',
            'anime': 'Anime'
        };
        currentModeSpan.textContent = modeLabels[currentViewMode] || 'Normal';
    }
}

// Get Current View Mode
function getViewMode() {
    return currentViewMode;
}

// Export for use in other pages
window.HermesApp = {
    getViewMode: getViewMode,
    setViewMode: setViewMode
};

// Add spin animation for scan button
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
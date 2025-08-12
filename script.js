// Default labels for the controller parts
const defaultLabels = {
    leftStick: 'Left Analog Stick',
    rightStick: 'Right Analog Stick',
    dpad: 'D-Pad',
    aButton: 'A Button',
    bButton: 'B Button',
    xButton: 'X Button',
    yButton: 'Y Button',
    leftBumper: 'Left Bumper',
    rightBumper: 'Right Bumper',
    leftTrigger: 'Left Trigger',
    rightTrigger: 'Right Trigger',
    menuButton: 'Menu Button',
    viewButton: 'View Button',
    xboxButton: 'Xbox Button'
};

// Local storage key
const STORAGE_KEY = 'controller-labels';

// Load saved labels from localStorage or use defaults
function loadLabels() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultLabels;
    } catch (error) {
        console.error('Error loading labels from localStorage:', error);
        return defaultLabels;
    }
}

// Save labels to localStorage
function saveLabels(labels) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
    } catch (error) {
        console.error('Error saving labels to localStorage:', error);
    }
}

// Current labels state
let currentLabels = loadLabels();

// Initialize the application
function init() {
    // Load existing labels into inputs
    const labelContainers = document.querySelectorAll('.label-container');
    labelContainers.forEach(container => {
        const id = container.getAttribute('data-id');
        const input = container.querySelector('.label-input');
        if (currentLabels[id]) {
            input.value = currentLabels[id];
        }
    });

    // Position labels and draw connecting lines
    positionLabelsAndLines();

    // Add event listeners to all label inputs
    setupInputEventListeners();

    // Add event listener to reset button
    setupResetButton();

    // Add visual feedback animations
    setupVisualEffects();
}

// Position labels and draw connecting lines
function positionLabelsAndLines() {
    const container = document.querySelector('.controller-container');
    const margin = 5; // % margin inside container

    document.querySelectorAll('.label-container').forEach(label => {
        let targetX = parseFloat(label.getAttribute('data-target-x'));
        let targetY = parseFloat(label.getAttribute('data-target-y'));
        let labelX = parseFloat(label.getAttribute('data-label-x'));
        let labelY = parseFloat(label.getAttribute('data-label-y'));

        // Clamp label so textbox stays inside margins
        labelX = Math.min(100 - margin, Math.max(margin, labelX));
        labelY = Math.min(100 - margin, Math.max(margin, labelY));

        // Apply clamped position
        label.style.left = `${labelX}%`;
        label.style.top = `${labelY}%`;

        const input = label.querySelector('.label-input');
        const line = label.querySelector('.connector-line');
        const arrow = label.querySelector('.arrow');

        // Get textbox width in % of container
        const containerWidth = container.offsetWidth;
        const inputWidth = input.offsetWidth;
        const widthPct = (inputWidth / containerWidth) * 100;

        // Calculate delta between label edge and button
        const deltaX = targetX - (labelX + widthPct / 2);
        const deltaY = targetY - labelY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        // Set connector line from textbox edge to button
        line.style.width = `${distance}%`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.left = `${widthPct / 2}%`;
        line.style.top = '50%';

        // Position arrow at tip
        arrow.style.left = `${targetX - labelX}%`;
        arrow.style.top = `${targetY - labelY}%`;
        arrow.style.transform = 'translate(-50%, -50%)';
    });
}

// Set up event listeners for input fields
function setupInputEventListeners() {
    const inputs = document.querySelectorAll('.label-input');
    
    inputs.forEach(input => {
        const container = input.closest('.label-container');
        const id = container.getAttribute('data-id');
        
        // Save on input change (real-time saving)
        input.addEventListener('input', function() {
            currentLabels[id] = this.value;
            saveLabels(currentLabels);
        });

        // Handle keyboard shortcuts
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.blur(); // Remove focus to show the saved state
            } else if (e.key === 'Escape') {
                // Restore the saved value
                this.value = currentLabels[id] || '';
                this.blur();
            }
        });

        // Visual feedback on focus
        input.addEventListener('focus', function() {
            this.select(); // Select all text for easy editing
            container.style.zIndex = '30';
        });

        input.addEventListener('blur', function() {
            container.style.zIndex = '10';
        });
    });
}

// Set up reset button functionality
function setupResetButton() {
    const resetButton = document.getElementById('resetButton');
    
    resetButton.addEventListener('click', function() {
        // Show confirmation
        if (confirm('Are you sure you want to reset all labels to their default values? This action cannot be undone.')) {
            resetToDefaults();
        }
    });
}

// Reset all labels to default values
function resetToDefaults() {
    currentLabels = { ...defaultLabels };
    saveLabels(currentLabels);
    
    // Update all input fields
    const labelContainers = document.querySelectorAll('.label-container');
    labelContainers.forEach(container => {
        const id = container.getAttribute('data-id');
        const input = container.querySelector('.label-input');
        input.value = defaultLabels[id] || '';
        
        // Add a brief animation to show the change
        input.style.transform = 'scale(1.1)';
        input.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
        
        setTimeout(() => {
            input.style.transform = '';
            input.style.backgroundColor = '';
        }, 300);
    });
    
    // Show success feedback
    showNotification('Labels reset to default values!');
}

// Set up visual effects and animations
function setupVisualEffects() {
    const labelContainers = document.querySelectorAll('.label-container');
    
    labelContainers.forEach((container, index) => {
        // Stagger the fade-in animations
        container.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover effects
        container.addEventListener('mouseenter', function() {
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = arrow.style.transform + ' scale(1.2)';
                arrow.style.transition = 'transform 0.2s ease';
            }
        });
        
        container.addEventListener('mouseleave', function() {
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = arrow.style.transform.replace(' scale(1.2)', '');
            }
        });
    });
}

// Show notification message
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 3000);
}

// Add responsive image loading
function setupResponsiveImage() {
    const image = document.getElementById('controllerImage');
    
    image.addEventListener('load', function() {
        // Image loaded successfully
        console.log('Controller image loaded successfully');
    });
    
    image.addEventListener('error', function() {
        // Handle image loading error
        console.error('Failed to load controller image');
        showNotification('Unable to load controller image. Please check the image file.');
    });
}

// Handle window resize to maintain label positions
function setupResponsiveLayout() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate line positions on resize
            positionLabelsAndLines();
            console.log('Layout adjusted for new window size');
        }, 250);
    });
}

// Add keyboard shortcuts for power users
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + R to reset (when not in an input field)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (confirm('Reset all labels to default values?')) {
                resetToDefaults();
            }
        }
        
        // Escape to blur any focused input
        if (e.key === 'Escape' && e.target.tagName === 'INPUT') {
            e.target.blur();
        }
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    init();
    setupResponsiveImage();
    setupResponsiveLayout();
    setupKeyboardShortcuts();

    document.getElementById('downloadButton').addEventListener('click', function () {
        const controllerContainer = document.querySelector('.controller-container');

        html2canvas(controllerContainer, {
            backgroundColor: null, // keeps background transparent
            scale: 2 // higher resolution
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'controller-labels.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Screenshot failed:', err);
            showNotification('Failed to take screenshot.');
        });
    });
    
    console.log('Xbox Controller Labeler initialized successfully');
});

// Export functions for potential external use
window.ControllerLabeler = {
    resetToDefaults,
    loadLabels,
    saveLabels,
    getCurrentLabels: () => ({ ...currentLabels })
};
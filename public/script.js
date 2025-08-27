// Global variables
let currentData = null;
let buttonTimeouts = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    loadTodayData();
    
    // Update time every second
    setInterval(updateCurrentTime, 1000);
    
    // Update data every 30 seconds
    setInterval(loadTodayData, 30000);
});

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// Load today's data from server
async function loadTodayData() {
    try {
        const response = await fetch('/api/today');
        if (response.ok) {
            currentData = await response.json();
            updateDisplay();
            updateSummary();
        } else {
            console.error('Failed to load today\'s data');
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update time for a specific field
async function updateTime(field) {
    if (buttonTimeouts[field]) {
        return; // Button is in timeout
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/update/${field}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            currentData = result.entry;
            updateDisplay();
            updateSummary();
            
            // Set button timeout (5 seconds)
            setButtonTimeout(field, 5000);
            
            // Show success message
            showNotification(`${field.replace(/([A-Z])/g, ' $1').trim()} updated successfully!`, 'success');
        } else {
            const error = await response.json();
            showNotification(`Error: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Error updating time:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Set button timeout
function setButtonTimeout(field, duration) {
    const button = document.getElementById(`${field}Btn`);
    if (!button) return;
    
    // Disable button
    button.disabled = true;
    buttonTimeouts[field] = true;
    
    // Update button text to show countdown
    const originalText = button.innerHTML;
    let timeLeft = Math.ceil(duration / 1000);
    
    const countdown = setInterval(() => {
        timeLeft--;
        button.innerHTML = `<i class="fas fa-clock"></i><span>Wait ${timeLeft}s</span>`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            button.disabled = false;
            button.innerHTML = originalText;
            buttonTimeouts[field] = false;
        }
    }, 1000);
}

// Update the display with current data
function updateDisplay() {
    if (!currentData) return;
    
    // Update time displays
    document.getElementById('inTimeDisplay').textContent = 
        currentData.inTime || 'Not set';
    document.getElementById('startBreakDisplay').textContent = 
        currentData.startBreak || 'Not set';
    document.getElementById('endBreakDisplay').textContent = 
        currentData.endBreak || 'Not set';
    document.getElementById('outTimeDisplay').textContent = 
        currentData.outTime || 'Not set';
    
    // Update summary date
    document.getElementById('summaryDate').textContent = 
        currentData.date || '--';
}

// Update the summary section
function updateSummary() {
    if (!currentData) return;
    
    let totalHours = '--';
    let breakTime = '--';
    
    if (currentData.inTime && currentData.outTime) {
        const inTime = moment(currentData.inTime, 'HH:mm:ss');
        const outTime = moment(currentData.outTime, 'HH:mm:ss');
        
        if (currentData.startBreak && currentData.endBreak) {
            const startBreak = moment(currentData.startBreak, 'HH:mm:ss');
            const endBreak = moment(currentData.endBreak, 'HH:mm:ss');
            const breakDuration = moment.duration(endBreak.diff(startBreak));
            const workDuration = moment.duration(outTime.diff(inTime)).subtract(breakDuration);
            
            totalHours = workDuration.asHours().toFixed(2) + ' hrs';
            breakTime = breakDuration.asMinutes().toFixed(0) + ' min';
        } else {
            const workDuration = moment.duration(outTime.diff(inTime));
            totalHours = workDuration.asHours().toFixed(2) + ' hrs';
        }
    }
    
    document.getElementById('summaryHours').textContent = totalHours;
    document.getElementById('summaryBreak').textContent = breakTime;
}

// Show preview modal
async function showPreview() {
    try {
        showLoading(true);
        
        const response = await fetch('/api/preview');
        if (response.ok) {
            const data = await response.json();
            displayPreview(data);
            document.getElementById('previewModal').style.display = 'block';
        } else {
            showNotification('Failed to load preview data', 'error');
        }
    } catch (error) {
        console.error('Error loading preview:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display preview data in modal
function displayPreview(data) {
    const previewContent = document.getElementById('previewContent');
    
    if (!data.entries || data.entries.length === 0) {
        previewContent.innerHTML = '<p>No time entries found.</p>';
        return;
    }
    
    let tableHTML = `
        <table class="preview-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>In Time</th>
                    <th>Start Break</th>
                    <th>End Break</th>
                    <th>Out Time</th>
                    <th>Total Hours</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.entries.forEach(entry => {
        let totalHours = 'N/A';
        
        if (entry.inTime && entry.outTime) {
            const inTime = moment(entry.inTime, 'HH:mm:ss');
            const outTime = moment(entry.outTime, 'HH:mm:ss');
            
            if (entry.startBreak && entry.endBreak) {
                const startBreak = moment(entry.startBreak, 'HH:mm:ss');
                const endBreak = moment(entry.endBreak, 'HH:mm:ss');
                const breakDuration = moment.duration(endBreak.diff(startBreak));
                const workDuration = moment.duration(outTime.diff(inTime)).subtract(breakDuration);
                totalHours = workDuration.asHours().toFixed(2) + ' hrs';
            } else {
                const workDuration = moment.duration(outTime.diff(inTime));
                totalHours = workDuration.asHours().toFixed(2) + ' hrs';
            }
        }
        
        tableHTML += `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.inTime || 'Not set'}</td>
                <td>${entry.startBreak || 'Not set'}</td>
                <td>${entry.endBreak || 'Not set'}</td>
                <td>${entry.outTime || 'Not set'}</td>
                <td>${totalHours}</td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    previewContent.innerHTML = tableHTML;
}

// Close preview modal
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Download Excel file
async function downloadExcel() {
    try {
        showLoading(true);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = '/api/download';
        link.download = 'timesheet.xlsx';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Excel file downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading Excel:', error);
        showNotification('Error downloading file. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreview();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePreview();
    }
});
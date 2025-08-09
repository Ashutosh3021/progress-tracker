
    // Data storage
let masterTasks = []; // Global task list
let dailyProgress = {}; // Structure: { day: { taskId: completed } }
let chart;
let currentDay = 1;
// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('taskTracker_masterTasks', JSON.stringify(masterTasks));
        localStorage.setItem('taskTracker_dailyProgress', JSON.stringify(dailyProgress));
        localStorage.setItem('taskTracker_currentDay', currentDay.toString());
    } catch (error) {
        console.error('Error saving data:', error);
    }
}
// Load data from localStorage
function loadData() {
    try {
        const savedMasterTasks = localStorage.getItem('taskTracker_masterTasks');
        const savedDailyProgress = localStorage.getItem('taskTracker_dailyProgress');
        const savedCurrentDay = localStorage.getItem('taskTracker_currentDay');
        if (savedMasterTasks) {
            masterTasks = JSON.parse(savedMasterTasks);
        }
        if (savedDailyProgress) {
            dailyProgress = JSON.parse(savedDailyProgress);
        }
        if (savedCurrentDay) {
            currentDay = parseInt(savedCurrentDay);
            document.getElementById('currentDay').value = currentDay;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
// Initialize
function init() {
    populateDaySelector();
    initChart();
    loadData(); // Load saved data
    updateDisplay();
}
// Populate day selector
function populateDaySelector() {
    const selector = document.getElementById('currentDay');
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Day ${i}`;
        selector.appendChild(option);
    }
    selector.addEventListener('change', (e) => {
        currentDay = parseInt(e.target.value);
        saveData(); // Save when day changes
        updateDisplay();
    });
}
// Initialize chart
function initChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Daily Progress',
                data: [],
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#000000',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 1,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Days',
                        font: { size: 12, weight: '500' },
                        color: '#cccccc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#cccccc',
                        font: { size: 11 }
                    }
                },
                y: {
                    min: 0,
                    max: 20,
                    title: {
                        display: true,
                        text: 'Score',
                        font: { size: 12, weight: '500' },
                        color: '#cccccc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#cccccc',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}
// Add task to master list
function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskScore = parseInt(document.getElementById('taskScore').value);
    if (!taskName) {
        alert('Please enter a task name');
        return;
    }
    if (!taskScore || taskScore < 1 || taskScore > 20) {
        alert('Please enter a valid score between 1 and 20');
        return;
    }
    // Add task to master list
    const task = {
        id: Date.now(),
        name: taskName,
        score: taskScore
    };
    masterTasks.push(task);
    // Clear inputs
    document.getElementById('taskName').value = '';
    document.getElementById('taskScore').value = '';
    saveData(); // Save after adding task
    updateDisplay();
}
// Toggle daily task completion
function toggleDailyTask(taskId) {
    // Initialize day if needed
    if (!dailyProgress[currentDay]) {
        dailyProgress[currentDay] = {};
    }
    // Toggle completion
    dailyProgress[currentDay][taskId] = !dailyProgress[currentDay][taskId];
    saveData(); // Save after toggling task
    updateDisplay();
}
// Delete task from master list
function deleteTask(taskId) {
    if (!confirm('Delete this task? This will remove it from all days.')) return;
    masterTasks = masterTasks.filter(t => t.id !== taskId);
    // Remove from all daily progress
    Object.keys(dailyProgress).forEach(day => {
        delete dailyProgress[day][taskId];
    });
    saveData(); // Save after deleting task
    updateDisplay();
}
// Clear all tasks
function clearAllTasks() {
    if (!confirm('Clear all tasks and progress? This cannot be undone.')) return;
    
    masterTasks = [];
    dailyProgress = {};
    
    // Also clear from localStorage
    try {
        localStorage.removeItem('taskTracker_masterTasks');
        localStorage.removeItem('taskTracker_dailyProgress');
        localStorage.removeItem('taskTracker_currentDay');
    } catch (error) {
        console.error('Error clearing data:', error);
    }
    
    updateDisplay();
}
// Calculate daily score
function calculateDailyScore(day) {
    if (!dailyProgress[day]) return 0;
    
    return masterTasks
        .filter(task => dailyProgress[day][task.id])
        .reduce((sum, task) => sum + task.score, 0);
}
// Update all displays
function updateDisplay() {
    updateMasterTasksList();
    updateDailyTasksList();
    updateCurrentDayScore();
    updateChart();
    updateStats();
}
// Update master tasks list
function updateMasterTasksList() {
    const container = document.getElementById('globalTasksContainer');
    if (masterTasks.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tasks added yet</div>';
        return;
    }
    container.innerHTML = masterTasks.map(task => `
        <div class="task-item">
            <div class="task-content">
                <span class="task-name">${task.name}</span>
                <span class="task-score">+${task.score}</span>
            </div>
            <button class="delete-task" onclick="deleteTask(${task.id})">
                Delete
            </button>
        </div>
    `).join('');
}
// Update daily tasks list
function updateDailyTasksList() {
    const container = document.getElementById('dailyTasksContainer');
    if (masterTasks.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tasks available. Add tasks in the Master Task List above.</div>';
        return;
    }
    const dayProgress = dailyProgress[currentDay] || {};
    container.innerHTML = masterTasks.map(task => {
        const isCompleted = dayProgress[task.id] || false;
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" 
                       ${isCompleted ? 'checked' : ''}
                       onchange="toggleDailyTask(${task.id})">
                <div class="task-content">
                    <span class="task-name">${task.name}</span>
                    <span class="task-score">+${task.score}</span>
                </div>
            </div>
        `;
    }).join('');
}
// Update current day score
function updateCurrentDayScore() {
    const score = calculateDailyScore(currentDay);
    document.getElementById('currentDayScore').textContent = score;
}
// Update chart
function updateChart() {
    const chartData = [];
    
    for (let day = 1; day <= 100; day++) {
        const score = calculateDailyScore(day);
        if (score > 0 || dailyProgress[day]) {
            chartData.push({ x: day, y: score });
        }
    }
    chart.data.datasets[0].data = chartData;
    chart.update('none');
}
// Update statistics
function updateStats() {
    const trackedDays = Object.keys(dailyProgress).length;
    const scores = Object.keys(dailyProgress).map(day => calculateDailyScore(parseInt(day)));
    document.getElementById('totalDays').textContent = trackedDays;
    document.getElementById('totalTasks').textContent = masterTasks.length;
    if (scores.length > 0) {
        const avgScore = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
        const maxScore = Math.max(...scores);
        
        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('maxScore').textContent = maxScore;
    } else {
        document.getElementById('avgScore').textContent = '0';
        document.getElementById('maxScore').textContent = '0';
    }
}
// Initialize on page load
window.onload = init;
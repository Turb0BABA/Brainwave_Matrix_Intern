document.addEventListener('DOMContentLoaded', function() {
    // --- STATE ---
    let currentDate = new Date();
    let selectedDate = new Date();
    let tasksByDate = {};
    let editingTaskId = null;
    let calendarViewMode = 'month';
    let activePage = 'calendar-page';
    let selectedTaskIdForNotes = null;

    // --- SELECTORS ---
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const allPageLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const monthYearEl = document.getElementById('month-year');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const viewSwitcher = document.querySelector('.view-switcher');
    const viewSwitcherBtn = document.getElementById('view-switcher-btn');
    const currentViewText = document.getElementById('current-view-text');
    const viewOptions = document.querySelectorAll('.view-option');
    const calendarViews = document.querySelectorAll('.calendar-view');
    const todoPageList = document.getElementById('todo-list');
    const next7DaysList = document.getElementById('next-7-days-list');
    const fab = document.getElementById('fab-add-task');
    const taskModal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskTimeInput = document.getElementById('task-time');
    const notesPage = document.getElementById('notes-page');
    const notesTaskList = document.getElementById('notes-task-list');
    const notesDetailView = document.getElementById('notes-detail-view');

    // --- UTILITY FUNCTIONS ---
    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const generateUniqueId = () => 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();

    const getSeason = (date) => {
        const month = date.getMonth(); // 0 (Jan) to 11 (Dec)
        if (month >= 2 && month <= 4) return 'spring'; // Mar, Apr, May
        if (month >= 5 && month <= 7) return 'summer'; // Jun, Jul, Aug
        if (month >= 8 && month <= 10) return 'autumn'; // Sep, Oct, Nov
        return 'winter'; // Dec, Jan, Feb
    };

    const saveState = () => {
        try {
            localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
        } catch (error) {
            console.error("Could not save state to localStorage:", error);
        }
    };

    const loadState = () => {
        try {
            const storedTasks = localStorage.getItem('tasksByDate');
            tasksByDate = storedTasks ? JSON.parse(storedTasks) : {};
        } catch (error) {
            console.error("Could not parse state from localStorage:", error);
            tasksByDate = {};
        }
    };
    
    const findTaskById = (taskId) => {
        for (const dateKey in tasksByDate) {
            const task = tasksByDate[dateKey].find(t => t.id === taskId);
            if (task) return { task, dateKey };
        }
        return null;
    };

    // --- CENTRALIZED RENDER FUNCTION ---
    const renderAll = () => {
        switch (activePage) {
            case 'calendar-page': renderCalendarView(); break;
            case 'todo-page': renderTodoPage(); break;
            case 'next-7-days-page': renderNext7DaysPage(); break;
            case 'notes-page': renderNotesPage(); break;
        }
    };

    // --- MODAL LOGIC ---
    const openTaskModal = (mode = 'add', taskData = null) => {
        taskForm.reset();
        if (mode === 'edit' && taskData) {
            modalTitle.textContent = 'Edit Task';
            taskTitleInput.value = taskData.task.text;
            taskTimeInput.value = taskData.task.time || '';
            editingTaskId = taskData.task.id;
            const [year, month, day] = taskData.dateKey.split('-').map(Number);
            selectedDate = new Date(year, month - 1, day);
        } else {
            modalTitle.textContent = 'Add New Task';
            editingTaskId = null;
        }
        taskModal.classList.add('active');
    };
    const closeModal = () => taskModal.classList.remove('active');

    // --- RENDER CALENDAR VIEWS ---
    const renderCalendarView = () => {
        switch (calendarViewMode) {
            case 'month': renderMonthView(); break;
            case 'week': renderWeekView(); break;
            case 'day': renderDayView(); break;
        }
    };

    const renderMonthView = () => {
        const date = new Date(currentDate);
        date.setDate(1);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        monthYearEl.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
        
        const monthViewEl = document.getElementById('month-view');
        monthViewEl.innerHTML = `
            <div class="calendar-grid" id="weekdays"></div>
            <div class="calendar-grid" id="calendar-days"></div>
        `;
        document.getElementById('weekdays').innerHTML = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="weekday">${d}</div>`).join('');
        
        const monthDaysEl = document.getElementById('calendar-days');
        const firstDayIndex = date.getDay();
        const lastDayDate = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        for (let i = firstDayIndex; i > 0; i--) {
            monthDaysEl.innerHTML += `<div class="calendar-day other-month"></div>`;
        }

        for (let i = 1; i <= lastDayDate; i++) {
            let dayDate = new Date(year, month, i);
            let dateKey = formatDateKey(dayDate);
            let isToday = year === todayYear && month === todayMonth && i === todayDate;

            let tasksForDay = tasksByDate[dateKey] || [];
            let tasksHtml = '<ul class="day-tasks">';
            tasksForDay.slice(0, 2).forEach(task => {
                tasksHtml += `<li>${task.text}</li>`;
            });
            if (tasksForDay.length > 2) {
                tasksHtml += `<li class="more-tasks" data-count="${tasksForDay.length - 2}">+${tasksForDay.length - 2} more</li>`;
            }
            tasksHtml += '</ul>';

            monthDaysEl.innerHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateKey}">
                    <div class="day-number">${i}</div>
                    ${tasksHtml}
                </div>`;
        }
    };

    const renderDayView = () => {
        const dayViewEl = document.getElementById('day-view');
        const dayHeaderText = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        monthYearEl.textContent = dayHeaderText;
        let timeSlotsHtml = '';
        for (let i = 0; i < 24; i++) {
            const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
            const ampm = i < 12 ? 'AM' : 'PM';
            timeSlotsHtml += `<div class="time-slot-label">${displayHour} ${ampm}</div>`;
        }
        let gridHtml = '<div class="day-view-grid">';
        for (let i = 0; i < 24; i++) { gridHtml += `<div class="time-slot-line"></div>`; }
        gridHtml += '</div>';
        dayViewEl.innerHTML = `<div class="day-view-header"><div class="spacer"></div><div class="day-title">${selectedDate.toLocaleDateString('en-US', { weekday: 'short' })} ${selectedDate.getDate()}</div></div><div class="day-view-body"><div class="time-slots">${timeSlotsHtml}</div>${gridHtml}</div>`;
        const dateKey = formatDateKey(selectedDate);
        const tasks = tasksByDate[dateKey] || [];
        const gridEl = dayViewEl.querySelector('.day-view-grid');
        tasks.forEach(task => {
            if (task.time) {
                const [hour, minute] = task.time.split(':').map(Number);
                const topPosition = hour * 60 + minute;
                const duration = 60;
                const taskEl = document.createElement('div');
                taskEl.className = 'day-view-task';
                taskEl.textContent = task.text;
                taskEl.style.top = `${topPosition}px`;
                taskEl.style.height = `${duration}px`;
                gridEl.appendChild(taskEl);
            }
        });
    };
    
    const renderWeekView = () => {
        const weekViewEl = document.getElementById('week-view');
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        monthYearEl.textContent = `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        let headerHtml = '';
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            const isToday = day.getFullYear() === todayYear && day.getMonth() === todayMonth && day.getDate() === todayDate;
            headerHtml += `<div class="day-column-header ${isToday ? 'today' : ''}"><div>${day.toLocaleDateString('en-US', { weekday: 'short' })}</div><div class="day-number">${day.getDate()}</div></div>`;
        }
        let timeSlotsHtml = '';
        for (let i = 0; i < 24; i++) {
            const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
            const ampm = i < 12 ? 'AM' : 'PM';
            timeSlotsHtml += `<div class="time-slot-label">${displayHour} ${ampm}</div>`;
        }
        let gridHtml = '<div class="week-view-grid">';
        for (let i = 0; i < 24 * 7; i++) { gridHtml += `<div class="week-cell-line"></div>`; }
        gridHtml += '</div>';
        weekViewEl.innerHTML = `<div class="week-view-header"><div class="spacer"></div><div class="week-view-header-grid">${headerHtml}</div></div><div class="week-view-body"><div class="time-slots">${timeSlotsHtml}</div>${gridHtml}</div>`;
        const weekGridEl = weekViewEl.querySelector('.week-view-grid');
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            const dateKey = formatDateKey(day);
            const tasks = tasksByDate[dateKey] || [];
            tasks.forEach(task => {
                if (task.time) {
                    const [hour, minute] = task.time.split(':').map(Number);
                    const topPosition = hour * 60 + minute;
                    const duration = 60;
                    const taskEl = document.createElement('div');
                    taskEl.className = 'week-view-task';
                    taskEl.textContent = task.text;
                    taskEl.style.top = `${topPosition}px`;
                    taskEl.style.height = `${duration}px`;
                    taskEl.style.gridColumn = `${i + 1} / span 1`;
                    weekGridEl.appendChild(taskEl);
                }
            });
        }
    };

    // --- RENDER TODO & 7-DAYS PAGES ---
    const renderTodoPage = () => renderTaskList(todoPageList, new Date());
    
    const renderNext7DaysPage = () => {
        next7DaysList.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'week-day-card-horizontal';
            dayDiv.dataset.date = formatDateKey(date);

            const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
            const dayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

            dayDiv.innerHTML = `
                <div class="week-day-header">
                    <span class="day-name">${dayName}</span>
                    <span class="day-date">${dayDate}</span>
                </div>
                <ul class="task-list"></ul>
                <div class="add-task-bar">+ New Task</div>
            `;
            
            const taskListEl = dayDiv.querySelector('.task-list');
            renderTaskList(taskListEl, date);
            next7DaysList.appendChild(dayDiv);
        }
    };

    const renderTaskList = (listElement, date) => {
        const dateKey = formatDateKey(date);
        const tasks = tasksByDate[dateKey] || [];
        listElement.innerHTML = '';
        if (tasks.length === 0) {
            listElement.innerHTML = `<li class="no-tasks-msg">No tasks for this day.</li>`;
        } else {
            tasks.forEach(task => listElement.appendChild(createTaskElement(task, dateKey)));
        }
    };

    const createTaskElement = (task, dateKey) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        li.dataset.dateKey = dateKey;
        li.innerHTML = `<input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}><span>${task.text}</span><div class="actions"><button class="edit-btn"><i class="fas fa-pencil-alt"></i></button><button class="delete-btn"><i class="fas fa-trash"></i></button></div>`;
        return li;
    };

    // --- RENDER NOTES PAGE ---
    const renderNotesPage = () => { renderNoteTaskList(); renderNoteDetailView(); };
    
    const renderNoteTaskList = () => {
        notesTaskList.innerHTML = '<h3>All Tasks</h3>';
        const allTasks = Object.values(tasksByDate).flat().sort((a,b) => a.text.localeCompare(b.text));
        if (allTasks.length === 0) {
            notesTaskList.innerHTML += '<p class="placeholder">No tasks found. Add some tasks in the calendar!</p>';
            return;
        }
        allTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'note-task-item';
            taskEl.textContent = task.text;
            taskEl.dataset.id = task.id;
            if (task.id === selectedTaskIdForNotes) { taskEl.classList.add('active'); }
            notesTaskList.appendChild(taskEl);
        });
    };
    
    const renderNoteDetailView = () => {
        if (!selectedTaskIdForNotes) {
            notesDetailView.innerHTML = `<div class="placeholder"><i class="fas fa-arrow-left"></i><p>Select a task from the left to view its details and add notes or subtasks.</p></div>`;
            return;
        }
        const result = findTaskById(selectedTaskIdForNotes);
        if (!result) { selectedTaskIdForNotes = null; renderNotesPage(); return; }
        const { task } = result;
        notesDetailView.innerHTML = `<h3>${task.text}</h3><div id="subtask-container"><ul id="subtask-list"></ul><form id="add-subtask-form"><input type="text" id="subtask-input" placeholder="Add a note or subtask..." required /><button type="submit">Add</button></form></div>`;
        const subtaskListEl = notesDetailView.querySelector('#subtask-list');
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => {
                const li = document.createElement('li');
                li.className = 'subtask-item';
                li.dataset.id = subtask.id;
                li.innerHTML = `<input type="checkbox" class="task-checkbox" ${subtask.completed ? 'checked' : ''}><span>${subtask.text}</span><div class="actions"><button class="edit-subtask-btn"><i class="fas fa-pencil-alt"></i></button><button class="delete-subtask-btn"><i class="fas fa-trash"></i></button></div>`;
                subtaskListEl.appendChild(li);
            });
        }
    };

    // --- EVENT LISTENERS ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        if (!title) return;
        const time = taskTimeInput.value;
        const dateKey = formatDateKey(selectedDate);
        if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
        
        if (editingTaskId) {
            const result = findTaskById(editingTaskId);
            if (result) {
                result.task.text = title;
                result.task.time = time;
            }
        } else {
            tasksByDate[dateKey].push({ id: generateUniqueId(), text: title, completed: false, time, subtasks: [] });
        }
        
        closeModal();
        saveState();
        renderAll();
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.task-list')) {
            handleTaskListClick(e);
        }
    });

    function handleTaskListClick(e) {
        const taskEl = e.target.closest('.task-item');
        if (!taskEl) return;
        
        const taskId = taskEl.dataset.id;
        const dateKey = taskEl.dataset.dateKey;
        const taskIndex = tasksByDate[dateKey]?.findIndex(t => t.id === taskId);
        
        if (typeof taskIndex === 'undefined' || taskIndex === -1) return;

        if (e.target.matches('.task-checkbox')) {
            tasksByDate[dateKey][taskIndex].completed = e.target.checked;
            taskEl.classList.toggle('completed', e.target.checked);
            saveState();
        } else if (e.target.closest('.delete-btn')) {
            tasksByDate[dateKey].splice(taskIndex, 1);
            if (tasksByDate[dateKey].length === 0) delete tasksByDate[dateKey];
            saveState();
            renderAll();
        } else if (e.target.closest('.edit-btn')) {
            const taskData = { task: tasksByDate[dateKey][taskIndex], dateKey };
            openTaskModal('edit', taskData);
        }
    }

    next7DaysList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-task-bar')) {
            const card = e.target.closest('.week-day-card-horizontal');
            const dateKey = card.dataset.date;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Type and press Enter';
            e.target.innerHTML = '';
            e.target.appendChild(input);
            input.focus();

            const saveInlineTask = () => {
                const title = input.value.trim();
                if (title) {
                    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
                    tasksByDate[dateKey].push({ id: generateUniqueId(), text: title, completed: false, time: null, subtasks: [] });
                    saveState();
                    renderNext7DaysPage();
                } else {
                    e.target.innerHTML = '+ New Task';
                }
            };
            
            input.addEventListener('blur', saveInlineTask);
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    input.blur();
                }
            });
        }
    });

    notesPage.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.note-task-item');
        if (taskItem) {
            selectedTaskIdForNotes = taskItem.dataset.id;
            renderNotesPage();
            return;
        }
        const deleteBtn = e.target.closest('.delete-subtask-btn');
        if (deleteBtn) {
            const subtaskItem = deleteBtn.closest('.subtask-item');
            const subtaskId = subtaskItem.dataset.id;
            const { task } = findTaskById(selectedTaskIdForNotes);
            task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
            saveState();
            renderNoteDetailView();
            return;
        }
        const checkbox = e.target.closest('.task-checkbox');
        if (checkbox && e.target.closest('.subtask-item')) {
            const subtaskItem = checkbox.closest('.subtask-item');
            const subtaskId = subtaskItem.dataset.id;
            const { task } = findTaskById(selectedTaskIdForNotes);
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            subtask.completed = checkbox.checked;
            saveState();
        }
    });

    notesPage.addEventListener('submit', (e) => {
        if (e.target.id === 'add-subtask-form') {
            e.preventDefault();
            const input = e.target.querySelector('#subtask-input');
            const text = input.value.trim();
            if (text) {
                const { task } = findTaskById(selectedTaskIdForNotes);
                if (!task.subtasks) task.subtasks = [];
                task.subtasks.push({
                    id: generateUniqueId(),
                    text,
                    completed: false
                });
                input.value = '';
                saveState();
                renderNoteDetailView();
            }
        }
    });

    allPageLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(link.dataset.page);
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('pinned');
            mobileOverlay.classList.remove('active');
        }
    }));
    
    hamburgerMenu.addEventListener('click', () => { sidebar.classList.toggle('pinned'); mobileOverlay.classList.toggle('active', sidebar.classList.contains('pinned')); });
    
    mobileOverlay.addEventListener('click', () => { sidebar.classList.remove('pinned'); mobileOverlay.classList.remove('active'); });
    
    viewSwitcherBtn.addEventListener('click', () => viewSwitcher.classList.toggle('open'));
    
    document.addEventListener('click', (e) => {
        if (viewSwitcher && !viewSwitcher.contains(e.target) && !e.target.closest('.task-list')) {
            viewSwitcher.classList.remove('open');
        }
    });
    
    viewOptions.forEach(opt => opt.addEventListener('click', (e) => {
        e.stopPropagation();
        viewSwitcher.classList.remove('open');
        calendarViewMode = e.target.dataset.view;
        currentViewText.textContent = e.target.textContent;
        viewOptions.forEach(o => o.classList.remove('active'));
        e.target.classList.add('active');
        calendarViews.forEach(v => v.classList.remove('active'));
        document.getElementById(`${calendarViewMode}-view`).classList.add('active');
        renderCalendarView();
    }));
    
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
    
    const navigate = (direction) => {
        switch (calendarViewMode) {
            case 'month': currentDate.setMonth(currentDate.getMonth() + direction); break;
            case 'week': currentDate.setDate(currentDate.getDate() + (7 * direction)); break;
            case 'day': selectedDate.setDate(selectedDate.getDate() + direction); currentDate = new Date(selectedDate); break;
        }

        // FIX: Update the theme based on the currently viewed date
        document.body.dataset.theme = getSeason(currentDate);

        renderCalendarView();
    };
    
    document.getElementById('calendar-page').addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day');
        if (dayEl && !dayEl.classList.contains('other-month')) {
            if (e.target.classList.contains('more-tasks')) {
                dayEl.classList.toggle('expanded');
                return;
            }
            if (dayEl.dataset.date) {
                const [year, month, day] = dayEl.dataset.date.split('-').map(Number);
                selectedDate = new Date(year, month - 1, day);
                openTaskModal('add');
            }
        }
    });
    
    fab.addEventListener('click', () => {
        selectedDate = new Date();
        openTaskModal('add');
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    
    taskModal.addEventListener('click', (e) => { if(e.target === taskModal) closeModal(); });

    // --- INITIALIZATION ---
    const switchPage = (pageId) => {
        activePage = pageId;
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageId)?.classList.add('active');
        allPageLinks.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[data-page='${pageId}']`)?.classList.add('active');
        const isFabVisible = pageId !== 'notes-page';
        fab.classList.toggle('visible', isFabVisible);
        viewSwitcher.style.display = (pageId === 'calendar-page') ? 'block' : 'none';
        renderAll();
    };
    
    loadState();
    document.body.dataset.theme = getSeason(new Date());
    switchPage('calendar-page');
});
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

const sectionInput = document.getElementById('section-input');
const addSectionBtn = document.getElementById('add-section-btn');
const sectionsList = document.getElementById('sections-list');
const viewAllTasksBtn = document.getElementById('view-all-tasks-btn');
const currentSectionTitle = document.getElementById('current-section-title');

let allTaskSections = []; // Stores all sections and their tasks as an array
let currentSectionId = null; // ID of the currently active section
let viewingAllTasks = false; // Flag for 'View All Tasks' mode

// Load data from local storage when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);

addTaskBtn.addEventListener('click', addTask);
addSectionBtn.addEventListener('click', addSection);
viewAllTasksBtn.addEventListener('click', viewAllTasks);

function saveAllData() {
    localStorage.setItem('allTaskSections', JSON.stringify(allTaskSections));
    localStorage.setItem('currentSectionId', currentSectionId);
}

function loadAllData() {
    const storedSections = localStorage.getItem('allTaskSections');
    if (storedSections) {
        try {
            allTaskSections = JSON.parse(storedSections);
            // Ensure allTaskSections is an array, even if localStorage was corrupted
            if (!Array.isArray(allTaskSections)) {
                allTaskSections = [];
            }
        } catch (e) {
            console.error("Error parsing allTaskSections from localStorage:", e);
            allTaskSections = [];
        }
    } else {
        allTaskSections = [];
    }

    const storedCurrentSectionId = localStorage.getItem('currentSectionId');
    if (storedCurrentSectionId && allTaskSections.some(section => section.id === storedCurrentSectionId)) {
        currentSectionId = storedCurrentSectionId;
    } else if (allTaskSections.length > 0) {
        currentSectionId = allTaskSections[0].id; // Fallback to the first section
    } else {
        // If no sections exist, create a default one
        const defaultSectionId = Date.now().toString();
        allTaskSections.push({ id: defaultSectionId, name: 'My Tasks', tasks: [] });
        currentSectionId = defaultSectionId;
        saveAllData(); // Save the newly created default section
    }
}

function loadSectionsDataOnly() {
    const storedSections = localStorage.getItem('allTaskSections');
    if (storedSections) {
        try {
            allTaskSections = JSON.parse(storedSections);
            if (!Array.isArray(allTaskSections)) {
                allTaskSections = [];
            }
        } catch (e) {
            console.error("Error parsing allTaskSections from localStorage:", e);
            allTaskSections = [];
        }
    } else {
        allTaskSections = [];
    }
}

function initializeApp() {
    loadAllData(); // This now ensures allTaskSections and currentSectionId are valid

    // The following logic is now handled within loadAllData
    // if (allTaskSections.length === 0) {
    //     const defaultSectionId = Date.now().toString();
    //     allTaskSections.push({ id: defaultSectionId, name: 'My Tasks', tasks: [] });
    //     currentSectionId = defaultSectionId;
    //     saveAllData();
    // }
    // if (!currentSectionId || !allTaskSections.some(section => section.id === currentSectionId)) {
    //     currentSectionId = allTaskSections[0].id; // Fallback to the first section
    // }

    renderSections();
    sortAndRenderTasks();
}

function addSection() {
    const sectionName = sectionInput.value.trim();
    if (sectionName === '') {
        alert('Please enter a section name.');
        return;
    }

    const newSectionId = Date.now().toString();
    allTaskSections.push({ id: newSectionId, name: sectionName, tasks: [] });
    currentSectionId = newSectionId;
    viewingAllTasks = false;
    saveAllData();
    renderSections();
    sortAndRenderTasks();
    sectionInput.value = '';
}

function deleteSection(id) {
    if (allTaskSections.length === 1) {
        alert('Cannot delete the last section. Please create a new one first if you wish to replace it.');
        return;
    }
    const sectionToDelete = allTaskSections.find(section => section.id === id);
    if (!sectionToDelete) return;

    if (!confirm(`Are you sure you want to delete the section "${sectionToDelete.name}" and all its tasks?`)) {
        return;
    }

    allTaskSections = allTaskSections.filter(section => section.id !== id);

    if (currentSectionId === id) {
        currentSectionId = allTaskSections[0].id; // Switch to the first available section
        viewingAllTasks = false;
    }
    saveAllData();
    renderSections();
    sortAndRenderTasks();
}

function selectSection(id) {
    currentSectionId = id;
    viewingAllTasks = false;
    loadSectionsDataOnly(); // Load allTaskSections from localStorage
    renderSections();
    sortAndRenderTasks();
}

function renderSections() {
    sectionsList.innerHTML = '';
    allTaskSections.forEach(section => {
        const sectionItem = document.createElement('li');
        sectionItem.classList.add('section-item');
        if (section.id === currentSectionId && !viewingAllTasks) {
            sectionItem.classList.add('active');
        }

        const sectionNameSpan = document.createElement('span');
        sectionNameSpan.textContent = section.name;
        sectionNameSpan.classList.add('section-name');
        sectionNameSpan.addEventListener('click', () => selectSection(section.id));

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('section-item-buttons');

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-section-btn');
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent selecting the section when deleting
            deleteSection(section.id);
        });

        buttonsDiv.appendChild(deleteBtn);
        sectionItem.appendChild(sectionNameSpan);
        sectionItem.appendChild(buttonsDiv);
        sectionsList.appendChild(sectionItem);
    });

    // Update current section title display
    if (viewingAllTasks) {
        currentSectionTitle.textContent = 'All Tasks';
    } else if (currentSectionId) {
        const currentSection = allTaskSections.find(section => section.id === currentSectionId);
        currentSectionTitle.textContent = currentSection ? currentSection.name : 'No Section Selected';
    } else {
        currentSectionTitle.textContent = 'No Section Selected';
    }
}

function viewAllTasks() {
    viewingAllTasks = true;
    currentSectionId = null; // No specific section is active
    renderSections(); // Update active state of sections list
    sortAndRenderTasks(); // Render all tasks
}

function addTask() {

    if (!currentSectionId || viewingAllTasks) {

        alert('Please select a section to add tasks to, or create a new one.');

        return;

    }



    const taskText = taskInput.value.trim();

    const taskDate = dateInput.value;



    if (taskText === '') {

        alert('Please enter a task.');

        return;

    }



    const task = {

        text: taskText,

        date: taskDate,

        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More robust unique ID

        sectionId: currentSectionId // Add sectionId to the task

    };



    const currentSection = allTaskSections.find(section => section.id === currentSectionId);

    if (currentSection) {

        currentSection.tasks.push(task);

    }

    

    sortAndRenderTasks();



    taskInput.value = '';

    dateInput.value = '';

}
function deleteTask(id, sectionId) {
    const targetSection = allTaskSections.find(section => section.id === sectionId);
    if (targetSection) {
        const initialLength = targetSection.tasks.length;
        targetSection.tasks = targetSection.tasks.filter(task => task.id !== id);
        if (targetSection.tasks.length < initialLength) {
            sortAndRenderTasks();
        }
    } else {
        // Fallback for old tasks without sectionId, or if sectionId is invalid
        // This part iterates all sections and filters.
        let taskFound = false;
        for (const section of allTaskSections) {
            const initialLength = section.tasks.length;
            section.tasks = section.tasks.filter(task => task.id !== id);
            if (section.tasks.length < initialLength) {
                taskFound = true;
                break;
            }
        }
        if (taskFound) {
            sortAndRenderTasks();
        }
    }
}

function toggleEdit(id, sectionId) {
    if (viewingAllTasks) {
        alert('Cannot edit tasks in "All Tasks" view. Please switch to a specific section to edit.');
        return;
    }
    const targetSection = allTaskSections.find(section => section.id === sectionId);
    if (targetSection) {
        const task = targetSection.tasks.find(task => task.id === id);
        if (task) {
            task.isEditing = !task.isEditing;
            sortAndRenderTasks();
        }
    }
}

function updateTask(id, newText, newDate, sectionId) {
    if (viewingAllTasks) {
        alert('Cannot update tasks in "All Tasks" view. Please switch to a specific section to update.');
        return;
    }
    const targetSection = allTaskSections.find(section => section.id === sectionId);
    if (targetSection) {
        const task = targetSection.tasks.find(task => task.id === id);
        if (task) {
            task.text = newText;
            task.date = newDate;
            task.isEditing = false;
            sortAndRenderTasks();
        }
    }
}

function sortAndRenderTasks() {
    let tasksToRender = [];

    if (viewingAllTasks) {
        // Gather all tasks from all sections
        allTaskSections.forEach(section => {
            tasksToRender = tasksToRender.concat(section.tasks);
        });
    } else if (currentSectionId) {
        // Directly use the tasks from the current section
        const currentSection = allTaskSections.find(section => section.id === currentSectionId);
        if (currentSection) {
            tasksToRender = [...currentSection.tasks]; // Create a shallow copy
        }
    }

    tasksToRender.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(a.date) - new Date(b.date);
        }
        if (a.date) {
            return -1;
        }
        if (b.date) {
            return 1;
        }
        return 0;
    });

    renderTasks(tasksToRender);
    saveAllData();
}

function renderTasks(tasksToDisplay = []) {
    taskList.innerHTML = '';

    if (viewingAllTasks) {
        // Group tasks by section for display
        const groupedTasks = {};
        allTaskSections.forEach(section => {
            groupedTasks[section.id] = { name: section.name, tasks: [] };
        });

        tasksToDisplay.forEach(task => {
            // Find which section this task belongs to
            if (task.sectionId && groupedTasks[task.sectionId]) {
                groupedTasks[task.sectionId].tasks.push(task);
            }
        });

        allTaskSections.forEach(section => {
            const sectionData = groupedTasks[section.id];
            if (sectionData && sectionData.tasks.length > 0) {
                // Removed sectionHeader creation
                sectionData.tasks.forEach(task => {
                    appendTaskToDOM(task, true, sectionData.name);
                });
            }
        });
    } else { // Not viewing all tasks, so display tasks from the current section
        const currentSection = allTaskSections.find(section => section.id === currentSectionId);
        const currentSectionName = currentSection ? currentSection.name : '';
        tasksToDisplay.forEach(task => {
            appendTaskToDOM(task, false, currentSectionName);
        });
    }
}

function appendTaskToDOM(task, disableActions, sectionName = '') {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task');

    if (task.isEditing && !disableActions) {
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = task.text;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = task.date;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('save-btn');
        saveBtn.addEventListener('click', () => {
            updateTask(task.id, textInput.value, dateInput.value, task.sectionId);
        });

        taskItem.appendChild(textInput);
        taskItem.appendChild(dateInput);
        taskItem.appendChild(saveBtn);
    } else {
        const taskContent = document.createElement('div');
        taskContent.classList.add('task-content');

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        taskTextSpan.classList.add('task-text');

        const taskDateSpan = document.createElement('span');
        taskDateSpan.textContent = task.date ? new Date(task.date).toLocaleDateString() : 'No date';
        taskDateSpan.classList.add('task-date');

        taskContent.appendChild(taskTextSpan);
        taskContent.appendChild(taskDateSpan);

        if (viewingAllTasks && sectionName) {
            const taskSectionSpan = document.createElement('span');
            taskSectionSpan.textContent = `Section: ${sectionName}`;
            taskSectionSpan.classList.add('task-section-name');
            taskContent.appendChild(taskSectionSpan);
        }

        taskItem.appendChild(taskContent);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttonsDiv');

        if (!disableActions) {
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => {
                toggleEdit(task.id, task.sectionId);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteTask(task.id, task.sectionId);
            });
            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);
        }
        taskItem.appendChild(buttonsDiv);
    }

    taskList.appendChild(taskItem);
}
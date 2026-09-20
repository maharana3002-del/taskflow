const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("dueDate");
const categoryInput = document.getElementById("category");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");
const sortTasks = document.getElementById("sortTasks");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];
let currentFilter = "all";
let editingTaskId = null;


/* =========================
   ADD / UPDATE TASK
========================= */

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        return;
    }

    // UPDATE EXISTING TASK
    if (editingTaskId !== null) {

        tasks = tasks.map(task => {

            if (task.id === editingTaskId) {
                return {
                    ...task,
                    title: title,
                    priority: priorityInput.value,
                    dueDate: dueDateInput.value,
                    category: categoryInput.value
                };
            }

            return task;
        });

        editingTaskId = null;

        document.querySelector(".add-btn").textContent =
            "+ Add Task";
    }

    // ADD NEW TASK
    else {

        const task = {
            id: Date.now(),
            title: title,
            priority: priorityInput.value,
            dueDate: dueDateInput.value,
            category: categoryInput.value,
            completed: false
        };

        tasks.push(task);
    }

    saveTasks();

    taskForm.reset();

    priorityInput.value = "medium";
    categoryInput.value = "other";

    renderTasks();
});


/* =========================
   SAVE
========================= */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


/* =========================
   DISPLAY TASKS
========================= */

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    const searchTerm =
        searchInput.value.trim().toLowerCase();

    if (searchTerm !== "") {

        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm)
        );
    }

    if (currentFilter === "pending") {

        filteredTasks =
            filteredTasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {

        filteredTasks =
            filteredTasks.filter(task => task.completed);
    }
/* =========================
   SORT TASKS
========================= */

const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
};

if (sortTasks.value === "newest") {

    filteredTasks.sort((a, b) => b.id - a.id);

}

if (sortTasks.value === "oldest") {

    filteredTasks.sort((a, b) => a.id - b.id);

}

if (sortTasks.value === "priority") {

    filteredTasks.sort(
        (a, b) =>
            priorityOrder[a.priority] -
            priorityOrder[b.priority]
    );

}

if (sortTasks.value === "dueDate") {

    filteredTasks.sort((a, b) => {

        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.localeCompare(b.dueDate);
    });

}

    if (filteredTasks.length === 0) {

        taskList.appendChild(emptyState);

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(task => {

            const taskElement =
                document.createElement("div");

            taskElement.className = "task-item";

            taskElement.innerHTML = `

                <div class="task-left">

                    <input
                        type="checkbox"
                        class="task-check"
                        ${task.completed ? "checked" : ""}
                        onchange="toggleTask(${task.id})"
                    >

                    <div class="task-info">

                        <div class="task-title ${
                            task.completed ? "completed" : ""
                        }">

                            ${escapeHTML(task.title)}

                        </div>

                        <div class="task-meta">

                            <span class="priority ${task.priority}">
                                ${capitalize(task.priority)}
                            </span>

                            <span class="category ${
                                task.category || "other"
                            }">
                                ${capitalize(
                                    task.category || "other"
                                )}
                            </span>

                            ${
                                task.dueDate
                                ? getDueDateLabel(task.dueDate)
                                : ""
                            }

                        </div>

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="action-btn"
                        onclick="editTask(${task.id})"
                        title="Edit task"
                    >
                        ✎
                    </button>


                    <button
                        class="action-btn delete-btn"
                        onclick="deleteTask(${task.id})"
                        title="Delete task"
                    >
                        ✕
                    </button>

                </div>
            `;

            taskList.appendChild(taskElement);
        });
    }

    updateStats();
}


/* =========================
   EDIT TASK
========================= */

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    editingTaskId = id;

    taskInput.value = task.title;

    priorityInput.value = task.priority;

    dueDateInput.value = task.dueDate;

    categoryInput.value = task.category || "other";

    document.querySelector(".add-btn").textContent =
        "Save Changes";

    taskInput.focus();

    window.scrollTo({
        top: document.querySelector(".task-form-card").offsetTop - 100,
        behavior: "smooth"
    });
}


/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    if (editingTaskId === id) {

        editingTaskId = null;

        taskForm.reset();

        priorityInput.value = "medium";
        categoryInput.value = "other";

        document.querySelector(".add-btn").textContent =
            "+ Add Task";
    }

    saveTasks();

    renderTasks();
}


/* =========================
   FILTERS
========================= */

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        currentFilter = this.dataset.filter;

        renderTasks();
    });
});


/* =========================
   STATISTICS
========================= */

function updateStats() {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;


    // Productivity Progress

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    progressPercent.textContent = `${percentage}%`;

    progressFill.style.width = `${percentage}%`;


    if (total === 0) {

        progressText.textContent =
            "Start completing tasks to track your progress.";

    } else if (completed === total) {

        progressText.textContent =
            "Excellent! All tasks completed.";

    } else {

        progressText.textContent =
            `${completed} of ${total} tasks completed. Keep going!`;
    }
}


/* =========================
   DARK MODE
========================= */

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeToggle.textContent = "☀";

    } else {

        themeToggle.textContent = "☾";
    }
});


/* =========================
   SMART DUE DATE
========================= */

function getDueDateLabel(dueDate) {

    if (!dueDate) {
        return "";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate + "T00:00:00");

    due.setHours(0, 0, 0, 0);

    const difference =
        Math.round(
            (due - today) / (1000 * 60 * 60 * 24)
        );

    if (difference < 0) {

        return `
            <span class="due-date overdue">
                Overdue · ${dueDate}
            </span>
        `;
    }

    if (difference === 0) {

        return `
            <span class="due-date today">
                Today · ${dueDate}
            </span>
        `;
    }

    if (difference === 1) {

        return `
            <span class="due-date tomorrow">
                Tomorrow · ${dueDate}
            </span>
        `;
    }

    return `
        <span class="due-date">
            Due: ${dueDate}
        </span>
    `;
}


/* =========================
   HELPERS
========================= */

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   INITIAL LOAD
========================= */

searchInput.addEventListener("input", function () {
    renderTasks();
});
sortTasks.addEventListener("change", function () {
    renderTasks();
});

renderTasks();
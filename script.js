
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const statusMessage = document.getElementById("status-message");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = JSON.parse(localStorage.getItem("todo-tasks") || "[]");
let currentFilter = "all";
let editingId = null;

function saveTasks() {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks));
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(function (task) {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(function (task) {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.dataset.action = "toggle";
        checkbox.dataset.id = task.id;
        checkbox.setAttribute("aria-label", "Complete task: " + task.text);

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit";
        editButton.dataset.id = task.id;
        editButton.setAttribute("aria-label", "Edit task: " + task.text);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = task.id;
        deleteButton.setAttribute("aria-label", "Delete task: " + task.text);

        actions.append(editButton, deleteButton);
        item.append(checkbox, text, actions);
        taskList.appendChild(item);
    });

    const remaining = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskCount.textContent = remaining + " task(s) remaining";
    emptyMessage.hidden = visibleTasks.length > 0;

    filterButtons.forEach(function (button) {
        button.setAttribute(
            "aria-pressed",
            String(button.dataset.filter === currentFilter)
        );
    });
}

// CREATE: Add a new task or save an edited task.
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        statusMessage.textContent = "Please enter a task.";
        return;
    }

    if (editingId !== null) {
        tasks = tasks.map(function (task) {
            return task.id === editingId
                ? { ...task, text: text }
                : task;
        });

        editingId = null;
        document.getElementById("add-button").textContent = "Add Task";
        statusMessage.textContent = "Task updated.";
    } else {
        tasks.push({
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            text: text,
            completed: false
        });

        statusMessage.textContent = "Task added.";
    }

    saveTasks();
    renderTasks();
    taskForm.reset();
});

// UPDATE / DELETE: Delegated event listener for task list.
taskList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) return;

    if (action === "edit") {
        editingId = id;
        taskInput.value = task.text;
        document.getElementById("add-button").textContent = "Save Changes";
        taskInput.focus();
        statusMessage.textContent = "Edit the task and save your changes.";
    }

    if (action === "delete") {
        tasks = tasks.filter(function (item) {
            return item.id !== id;
        });

        if (editingId === id) {
            editingId = null;
            taskForm.reset();
            document.getElementById("add-button").textContent = "Add Task";
        }

        saveTasks();
        renderTasks();
        statusMessage.textContent = "Task deleted.";
    }
});

// UPDATE: Mark task as completed or active.
taskList.addEventListener("change", function (event) {
    const checkbox = event.target;

    if (!checkbox.matches('input[data-action="toggle"]')) return;

    const id = checkbox.dataset.id;

    tasks = tasks.map(function (task) {
        return task.id === id
            ? { ...task, completed: checkbox.checked }
            : task;
    });

    saveTasks();
    renderTasks();
    statusMessage.textContent = "Task status updated.";
});

// FILTER: All, Active, Completed.
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

// DELETE all completed tasks.
clearCompletedButton.addEventListener("click", function () {
    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
    statusMessage.textContent = "Completed tasks cleared.";
});

renderTasks();

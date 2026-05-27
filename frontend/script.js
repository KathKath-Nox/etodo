const { createApp } = Vue;

createApp({
  data() {
    return {
      userName: localStorage.getItem("userName") || "",
      profilePic: "",        
      categories: ["Work", "Personal", "Shopping", "Others"],
      selectedCategory: "Home",
      newTodo: { title: "", description: "", category: "Work", startTime: "", endTime: "", subtasks: [] },
      todos: [],
      sidebarOpen: true,
      profileOpen: false,
      weekDays: [],         
      hours: Array.from({length: 24}, (_, i) => i + ":00"),
      darkMode: true
    };
  },
  computed: {
    ongoingTodos() {
      return this.todos.filter(t => {
        const isSelected = this.selectedCategory === "Home" || t.category === this.selectedCategory;
        if (t.endTime && new Date(t.endTime) - new Date() < 3600 * 1000) t.urgent = true;
        else t.urgent = false;
        return !t.completed && isSelected;
      });
    },
    completedTodos() {
      return this.todos.filter(t => t.completed && (this.selectedCategory === "Home" || t.category === this.selectedCategory));
    },
    todoStats() {
      const total = this.todos.length;
      const completed = this.todos.filter(t => t.completed).length;
      const ongoing = total - completed;
      const missed = this.todos.filter(t => !t.completed && t.endTime && new Date(t.endTime) < new Date()).length;
      return { total, completed, ongoing, missed };
    }
  },
  methods: {
    loadSettings() {
      console.log('Loading settings from localStorage...');
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          this.profilePic = settings.profilePic || '';
          this.darkMode = settings.darkMode !== undefined ? settings.darkMode : true;
          this.userName = settings.firstname ? `${settings.firstname} ${settings.name}` : this.userName;
          console.log('Settings loaded. Dark mode:', this.darkMode);
          console.log('Profile pic loaded:', this.profilePic ? 'Yes' : 'No');
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      } else {
        console.log('No saved settings found - using defaults');
        this.darkMode = true;
      }
      this.applyTheme();
    },
    
    applyTheme() {
      console.log('Applying theme. Dark mode:', this.darkMode);
      const root = document.documentElement;
      const body = document.body;
      
      if (this.darkMode) {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
      }
    },
    
    addTodo() {
      if (!this.newTodo.title) return alert("Task title cannot be empty!");
      const id = Date.now();
      this.todos.push({
        id,
        title: this.newTodo.title,
        description: this.newTodo.description,
        category: this.newTodo.category,
        startTime: this.newTodo.startTime,
        endTime: this.newTodo.endTime,
        completed: false,
        subtasks: [],
        showSubtasks: true
      });
      this.saveTodos();
      this.newTodo = { title: "", description: "", category: this.categories[0], startTime: "", endTime: "", subtasks: [] };
    },
    deleteTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id);
      this.saveTodos();
    },
    toggleTodo(todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
    },
    formatDate(datetime) {
      if (!datetime) return "";
      const d = new Date(datetime);
      return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
    },
    saveTodos() {
      localStorage.setItem("todos", JSON.stringify(this.todos));
    },
    loadTodos() {
      const data = localStorage.getItem("todos");
      if (data) {
        try {
          this.todos = JSON.parse(data);
        } catch (e) {
          console.error('Error loading todos:', e);
          this.todos = [];
        }
      }
    },
    toggleSubtasks(todo) {
      todo.showSubtasks = !todo.showSubtasks;
      this.saveTodos();
    },
    addSubtask(todo) {
      const title = prompt("Enter subtask title:");
      if (title) {
        todo.subtasks.push({ title, completed: false });
        this.saveTodos();
      }
    },
    toggleSubtask(todo, subtask) {
      subtask.completed = !subtask.completed;
      this.saveTodos();
    },
    completedSubtasks(todo) {
      return todo.subtasks.filter(s => s.completed).length;
    },
    deleteSubtask(todo, subtask) {
      todo.subtasks = todo.subtasks.filter(s => s !== subtask);
      this.saveTodos();
    },
    logout() {
      localStorage.removeItem("todos");
      localStorage.removeItem("userName");
      window.location.href = "login.html";
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    // CALENDAR METHODS
    generateWeek(startDate = new Date()) {
      const start = new Date(startDate);
      // Shift to Monday of current week
      const day = start.getDay(); // 0 = Sunday, 1 = Monday, ...
      const diff = (day === 0 ? -6 : 1) - day; 
      start.setDate(start.getDate() + diff);

      this.weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        this.weekDays.push({
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dateObj: new Date(d.getFullYear(), d.getMonth(), d.getDate()) // Normalized date
        });
      }
    },
    prevWeek() {
      const firstDay = this.weekDays[0]?.dateObj || new Date();
      const prev = new Date(firstDay);
      prev.setDate(prev.getDate() - 7);
      this.generateWeek(prev);
    },
    nextWeek() {
      const lastDay = this.weekDays[this.weekDays.length - 1]?.dateObj || new Date();
      const next = new Date(lastDay);
      next.setDate(next.getDate() + 1);
      this.generateWeek(next);
    },
    tasksByHour(dateObj, hourString) {
      if (!dateObj) return [];
      
      // Extract the hour number from the string (e.g., "14:00" -> 14)
      const hourNum = parseInt(hourString.split(':')[0], 10);
      
      return this.todos.filter(t => {
        if (!t.startTime || !t.endTime) return false;
        
        const start = new Date(t.startTime);
        
        // Check if task is on the same day
        const isSameDay = start.getFullYear() === dateObj.getFullYear() &&
                         start.getMonth() === dateObj.getMonth() &&
                         start.getDate() === dateObj.getDate();
        
        // Only show task at its START hour
        const startHour = start.getHours();
        
        return isSameDay && startHour === hourNum;
      });
    }
  },
  mounted() {
    this.loadSettings(); // Load theme settings first
    this.loadTodos();
    this.generateWeek();
  }
}).mount("#app");
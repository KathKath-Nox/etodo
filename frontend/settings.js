const { createApp } = Vue;

createApp({
  data() {
    return {
      profilePic: '',
      darkMode: true,
      form: {
        firstname: '',
        name: '',
        email: '',
        password: ''
      },
      loading: false,
      message: null
    };
  },
  computed: {
    profilePicText() {
      if (this.form.firstname && this.form.name) {
        return this.form.firstname[0].toUpperCase() + this.form.name[0].toUpperCase();
      }
      return '👤';
    }
  },
  mounted() {
    console.log('✅ Settings page loaded - NO API CALLS');
    this.loadSettings();
    this.applyTheme();
    console.log('Theme applied on mount');
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
          this.form.firstname = settings.firstname || '';
          this.form.name = settings.name || '';
          this.form.email = settings.email || '';
          console.log('Settings loaded successfully. Dark mode:', this.darkMode);
        } catch (e) {
          console.error('Error parsing settings:', e);
          this.showMessage('Error loading settings', 'error');
        }
      } else {
        console.log('No saved settings found - using defaults');
        // First time - set dark mode as default
        this.darkMode = true;
        this.saveSettings();
      }
    },
    
    applyTheme() {
      console.log('Applying theme. Dark mode:', this.darkMode);
      // Apply to both html and body for better compatibility
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
    
    handleProfilePicChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        this.showMessage('File size must be less than 2MB', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.showMessage('Please upload an image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePic = e.target.result;
        this.saveSettings();
        this.showMessage('Profile picture updated successfully!', 'success');
      };
      reader.onerror = () => {
        this.showMessage('Error reading file', 'error');
      };
      reader.readAsDataURL(file);
    },

    removeProfilePic() {
      this.profilePic = '';
      this.saveSettings();
      this.showMessage('Profile picture removed', 'success');
    },

    toggleDarkMode() {
      console.log('Theme toggled. New dark mode value:', this.darkMode);
      this.applyTheme();
      this.saveSettings();
      this.showMessage(`Switched to ${this.darkMode ? 'Dark' : 'Light'} mode`, 'success');
    },

    updateAccount() {
      if (!this.form.firstname || !this.form.name || !this.form.email) {
        this.showMessage('Please fill in all required fields', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.showMessage('Please enter a valid email address', 'error');
        return;
      }

      this.loading = true;
      
      setTimeout(() => {
        this.saveSettings();
        this.loading = false;
        this.showMessage('Account updated successfully!', 'success');
        this.form.password = '';
      }, 800);
    },

    resetForm() {
      this.loadSettings();
      this.form.password = '';
      this.showMessage('Changes discarded', 'info');
    },

    deleteAccount() {
      if (confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('🗑️ This will permanently delete all your data. Are you absolutely sure?')) {
          this.loading = true;
          
          setTimeout(() => {
            localStorage.clear();
            this.loading = false;
            this.showMessage('Account deleted successfully', 'success');
            
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1500);
          }, 1000);
        }
      }
    },

    saveSettings() {
      try {
        const settings = {
          profilePic: this.profilePic,
          darkMode: this.darkMode,
          firstname: this.form.firstname,
          name: this.form.name,
          email: this.form.email
        };
        localStorage.setItem('userSettings', JSON.stringify(settings));
        console.log('Settings saved to localStorage:', settings);
      } catch (e) {
        console.error('Error saving settings:', e);
        this.showMessage('Error saving settings', 'error');
      }
    },

    showMessage(text, type) {
      this.message = { text, type };
      setTimeout(() => {
        this.message = null;
      }, 3000);
    },

    goBack() {
      window.location.href = 'index.html';
    }
  }
}).mount('#app');

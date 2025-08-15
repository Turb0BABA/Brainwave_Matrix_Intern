DailyFlow

Welcome to DailyFlow, a dynamic and feature-rich single-page web application designed to help you organize your life with style and efficiency. Built with vanilla JavaScript, HTML, and CSS, this planner is a powerful demonstration of modern front-end development techniques without relying on external frameworks.

The interface is clean, intuitive, and responsive, providing a seamless experience across all devices. All your tasks and notes are saved directly in your browser's local storage, ensuring your data is always available when you return.

Features 
Daily Planner Pro is packed with features to make your planning experience both productive and delightful:

🗓️ Dynamic Calendar System
Multiple Views: Seamlessly switch between Month, Week, and Day views to see your schedule at a glance or in detail.

Easy Navigation: Navigate through different dates, weeks, and months with intuitive controls.

Smart Date Highlighting: The current day is always highlighted, making it easy to orient yourself.

✅ Comprehensive Task Management
Add Tasks Anywhere: Add tasks directly from the calendar, the dedicated to-do list, or the "My Week" view.

Track Progress: Mark tasks as complete with a satisfying checkbox.

Edit & Delete: Easily modify or remove tasks as your plans change.

📝 Notes Section
Master-Detail View: Select any task from a master list on the left to view and manage its specific notes and subtasks on the right.

Subtask Management: Add, edit, complete, and delete detailed notes or subtasks for any main task.

Persistent & Organized: All notes are directly linked to their parent task and saved automatically.

🎨 Automatic Seasonal Theming
A Fresh Look, All Year Round: The entire UI automatically adapts its color scheme based on the current season, keeping the interface fresh and engaging.

Four Beautiful Themes:

🌸 Spring: Light pastels and fresh greens.

☀️ Summer: Bright, sunny yellows and vibrant colors.

🍂 Autumn: Warm, earthy oranges and deep reds.

❄️ Winter: Cool blues and crisp whites.

Dynamic Updates: The theme changes automatically as you navigate to months in different seasons.

Getting Started
To run this project locally, simply follow these steps:

Clone the repository or download the project files (index.html, style.css, script.js).

Open the index.html file in your favorite web browser (like Chrome, Firefox, or Edge).

That's it! The application is fully self-contained and requires no build steps or dependencies.

Technologies Used
This project was built from the ground up using core web technologies:

HTML5: For the structure and content of the application.

CSS3: For all styling, including Flexbox, Grid, custom variables for theming, and responsive design.

JavaScript (ES6+): For all application logic, state management, DOM manipulation, and interactivity.

How It Works
State Management: The application state (all tasks, subtasks, and dates) is managed in a single JavaScript object and saved to localStorage.

Timezone-Safe Dates: A custom date formatting function ensures that tasks always appear on the correct date, regardless of the user's local timezone.

Dynamic Rendering: The UI is dynamically rendered based on the current state, ensuring that any change (like adding a task or changing the theme) is immediately reflected on the screen.

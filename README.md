# AS-pire ✦

AS-pire is a real-time, shared accountability and task management application designed to keep two users on track with their daily and weekly goals. Built with a focus on seamless synchronization and a clean UI, it features auto-saving notes, instant nudges, and a historical calendar to track progress over time.

## ✨ Features

* **Real-Time Synchronization:** Tasks, sticky notes, and reactions sync instantly between users via Firebase Realtime Database.
* **Daily & Weekly Tracking:** Separate tabs for daily chores and long-term weekly goals.
* **Smart Midnight Reset:** Daily tasks automatically reset at 12:00 AM local time. Pending tasks roll over to the next day, while completed tasks are archived.
* **Time Machine Calendar:** A dedicated calendar interface to browse historically completed tasks by date.
* **Fixed Tasks (Habits):** Configure recurring daily tasks that automatically generate every midnight.
* **Instant Nudges & Reactions:** Send screen-shaking nudges or floating emoji reactions (`L` for ❤️, `F` for 🔥, `T` for 👍) to your partner.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
* **Backend / Database:** Firebase Realtime Database
* **Hosting:** Netlify (Continuous Deployment)

## 📁 Project Structure

├── index.html       # Main application interface
├── calendar.html    # Historical calendar view
├── style.css        # Shared stylesheet for UI and animations
├── app.js           # Core logic, Firebase config, and midnight reset engine
└── calendar.js      # Logic for fetching and rendering historical data


## 🚀 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/AS-pire.git](https://github.com/your-username/AS-pire.git)

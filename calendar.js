import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDErNk02qqYnbVFskumgNGch47gJJCzMTA",
  authDomain: "aspire-2924d.firebaseapp.com",
  databaseURL: "https://aspire-2924d-default-rtdb.firebaseio.com",
  projectId: "aspire-2924d",
  storageBucket: "aspire-2924d.firebasestorage.app",
  messagingSenderId: "260852889050",
  appId: "1:260852889050:web:136fe46f8fd42db64b3ce3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const dateInput = document.getElementById('calendarDate');
const resultsDiv = document.getElementById('historyResults');

// Set max date to today
const today = new Date().toLocaleDateString('en-CA');
dateInput.max = today;

dateInput.addEventListener('change', async (e) => {
  const selectedDate = e.target.value; // Format: YYYY-MM-DD
  if (!selectedDate) return;

  resultsDiv.innerHTML = `<div class="empty-txt">Fetching data from Firebase...</div>`;

  try {
    const snapshot = await get(ref(db, `aspire/history/${selectedDate}`));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      let html = '';

      ['you', 'friend'].forEach(profile => {
        if (data[profile]) {
          const tasks = Object.values(data[profile]);
          html += `<div style="margin-bottom: 20px;">
                     <h3 style="color: var(--gold); margin-bottom: 10px; font-family: 'Playfair Display', serif;">
                       ${profile.toUpperCase()}'S COMPLETED TASKS
                     </h3>
                     <div class="tasks">`;
          
          tasks.forEach(t => {
            html += `<div class="task done" style="margin-bottom: 5px;">
                       <div class="chk on"><span class="chk-mark">✓</span></div>
                       <div class="task-txt">${t.text}</div>
                       <span class="task-by">${t.by}</span>
                     </div>`;
          });
          html += `</div></div>`;
        }
      });
      
      if(html === '') {
          resultsDiv.innerHTML = `<div class="empty"><div class="empty-txt">No tasks were completed on this date.</div></div>`;
      } else {
          resultsDiv.innerHTML = html;
      }
      
    } else {
      resultsDiv.innerHTML = `<div class="empty"><div class="empty-icon">🍃</div><div class="empty-txt">No history found for ${selectedDate}.</div></div>`;
    }
  } catch (error) {
    resultsDiv.innerHTML = `<div class="empty-txt" style="color: var(--rose);">Error connecting to Firebase.</div>`;
  }
});

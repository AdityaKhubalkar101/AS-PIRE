import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase Configuration
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

// Local State
let _state = {
  names: { you: 'A', friend: 'S' },
  quote: '', nudge: { to: null, ts: 0 }, reactions: { type: null, ts: 0 },
  streak: 0, lastActive: 0, lastResetDate: '', settings: { fixedTasks: { you: [], friend: [] } },
  you: { daily: {}, weekly: {}, weeklyReset: null },
  friend: { daily: {}, weekly: {}, weeklyReset: null }
};

let profile = 'you';
let tab = 'daily';
let isFbReady = false;

// Realtime Listener
onValue(ref(db, 'aspire'), (snapshot) => {
  if (snapshot.exists()) {
    _state = { ..._state, ...snapshot.val() };
    isFbReady = true;
    document.getElementById('demoBanner').style.display = 'none';
    document.getElementById('syncDot').className = 'sync-dot live';
    document.getElementById('syncLbl').textContent = 'live 🔥';
    renderAll();
  }
});

// Save Helper
function save(path, val) {
  set(ref(db, 'aspire/' + path), val);
}

// Remove Helper
function removeNode(path) {
  remove(ref(db, 'aspire/' + path));
}

// FIX 2 & 6: Midnight Reset Engine
function checkResets() {
  const now = new Date();
  const todayLocal = now.toLocaleDateString('en-CA'); // Gets YYYY-MM-DD local time
  const nowMs = now.getTime();

  // Daily Check (Rollover + Save History)
  if (_state.lastResetDate && _state.lastResetDate !== todayLocal) {
    ['you', 'friend'].forEach(p => {
      let dailyTasks = (_state[p] && _state[p].daily) ? _state[p].daily : {};
      let uncompleted = {};
      let completed = {};

      for (let id in dailyTasks) {
        if (dailyTasks[id].done) completed[id] = dailyTasks[id];
        else uncompleted[id] = dailyTasks[id]; // Rolls over
      }

      // Save completed to history
      if (Object.keys(completed).length > 0) {
        save(`history/${_state.lastResetDate}/${p}`, completed);
      }

      // Inject Fixed Tasks (Fix 3 setup)
      let fixedTasks = (_state.settings && _state.settings.fixedTasks && _state.settings.fixedTasks[p]) ? _state.settings.fixedTasks[p] : [];
      fixedTasks.forEach(ft => {
        let newId = 't' + Date.now() + Math.random().toString(36).slice(2,5);
        uncompleted[newId] = { text: ft, done: false, by: 'System', ts: Date.now() };
      });

      save(`${p}/daily`, uncompleted);
    });
    save('lastResetDate', todayLocal);
  } else if (!_state.lastResetDate) {
    save('lastResetDate', todayLocal);
  }

  // Weekly Check (Exactly 1 week later)
  ['you', 'friend'].forEach(p => {
    if (_state[p] && _state[p].weeklyReset && nowMs > _state[p].weeklyReset) {
      save(`${p}/weekly`, {});
      save(`${p}/weeklyReset`, null);
    }
  });
}

function renderAll() {
  checkResets();
  const s = _state;
  const yn = s.names?.you || 'A';
  const fn = s.names?.friend || 'S';

  document.getElementById('nameYou').textContent = yn;
  document.getElementById('nameFriend').textContent = fn;
  document.getElementById('avYou').textContent = yn[0].toUpperCase();
  document.getElementById('avFriend').textContent = fn[0].toUpperCase();
  document.getElementById('friendLabel').textContent = fn;
  document.getElementById('streakBadge').textContent = `🔥 ${s.streak || 0} day streak`;

  const sb = document.getElementById('sBody');
  if (document.activeElement !== sb) sb.value = s.quote || '';

  document.getElementById('btnYou').classList.toggle('active', profile === 'you');
  document.getElementById('btnFriend').classList.toggle('active', profile === 'friend');
  document.getElementById('friendNotice').style.display = profile === 'friend' ? 'flex' : 'none';
  document.getElementById('tDaily').classList.toggle('active', tab === 'daily');
  document.getElementById('tWeekly').classList.toggle('active', tab === 'weekly');
  document.getElementById('tabPill').classList.toggle('right', tab === 'weekly');

  const raw = s[profile]?.[tab] || {};
  const tasks = Object.entries(raw).map(([id, val]) => ({ id, ...val })).sort((a, b) => a.ts - b.ts);
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  // Render Tasks (Fix 1: Blinking)
  const list = document.getElementById('taskList');
  if (!tasks.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">✦</div><div class="empty-txt">no tasks yet — add one above</div></div>`;
  } else {
    list.innerHTML = tasks.map((t, i) => {
      const isNew = (Date.now() - t.ts) < 1000;
      const animClass = isNew ? 'task-new' : '';
      return `<div class="task ${t.done ? 'done' : ''} ${animClass}" style="animation-delay:${i * 0.07}s">
        <div class="chk ${t.done ? 'on' : ''}" data-id="${t.id}"><span class="chk-mark">✓</span></div>
        <div class="task-txt">${t.text}</div>
        <span class="task-by">${t.by}</span>
        <button class="del-btn" data-id="${t.id}">×</button>
      </div>`;
    }).join('');
  }

  // Bind Listeners
  document.querySelectorAll('.chk').forEach(btn => btn.onclick = () => window.toggleTask(btn.dataset.id));
  document.querySelectorAll('.del-btn').forEach(btn => btn.onclick = () => window.deleteTask(btn.dataset.id));

  document.getElementById('progPct').textContent = `${pct}%`;
  document.getElementById('progFill').style.width = `${pct}%`;
  document.getElementById('progFill').classList.toggle('empty', pct === 0);
  document.getElementById('allDone').classList.toggle('show', tasks.length > 0 && done === tasks.length);
}

// Global actions for HTML buttons
window.switchProfile = (p) => { profile = p; renderAll(); };
window.switchTab = (t) => { tab = t; renderAll(); };

window.addTask = () => {
  const text = document.getElementById('tInput').value.trim();
  if (!text) return;
  const now = Date.now();
  
  if (tab === 'weekly' && !_state[profile]?.weeklyReset) {
    save(`${profile}/weeklyReset`, now + (7 * 86400000));
  }
  
  const id = 't' + now + Math.random().toString(36).slice(2,5);
  const by = profile === 'you' ? (_state.names?.you || 'A') : (_state.names?.friend || 'S');
  
  save(`${profile}/${tab}/${id}`, { text, done: false, by, ts: now });
  document.getElementById('tInput').value = '';
};

window.toggleTask = (id) => {
  const t = _state[profile]?.[tab]?.[id];
  if (!t) return;
  save(`${profile}/${tab}/${id}/done`, !t.done);
};

window.deleteTask = (id) => removeNode(`${profile}/${tab}/${id}`);

// Fixed Tasks Settings (Fix 3)
window.openSettings = () => document.getElementById('settingsModal').classList.add('show');
window.closeSettings = () => document.getElementById('settingsModal').classList.remove('show');
window.saveFixedTask = () => {
  const assignee = document.getElementById('fixedAssignee').value;
  const taskText = document.getElementById('mFixedTask').value.trim();
  if (taskText) {
    let currentFixed = _state.settings?.fixedTasks?.[assignee] || [];
    currentFixed.push(taskText);
    save(`settings/fixedTasks/${assignee}`, currentFixed);
    document.getElementById('mFixedTask').value = '';
    closeSettings();
    alert("Fixed task added! It will appear automatically at midnight.");
  }
};

// Event Listeners
document.getElementById('addBtn').onclick = window.addTask;
document.getElementById('tInput').onkeydown = e => { if (e.key === 'Enter') window.addTask(); };
document.getElementById('sBody').oninput = e => save('quote', e.target.value);

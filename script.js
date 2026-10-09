/* ================= STORAGE HELPERS ================= */
const store = {
  get(key, fallback) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      alert('Could not save — the file you attached is likely too large for browser storage. Try a shorter video or a smaller image.');
      return false;
    }
  }
};

const $ = (id) => document.getElementById(id);


/* ================= SEED DATA ================= */
const CATEGORIES = [
  {
    id: 'performing',
    name: 'Performing Arts',
    desc: 'Dance, music, acting',
    cls: 'cat-performing'
  },
  {
    id: 'technical',
    name: 'Technical',
    desc: 'Coding, robotics, design',
    cls: 'cat-technical'
  },
  {
    id: 'academic',
    name: 'Academic',
    desc: 'Writing, research, debate',
    cls: 'cat-academic'
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    desc: 'Athletics, fitness, games',
    cls: 'cat-sports'
  }
];


function seedIfEmpty() {
  if (!store.get('th_talents', null)) {
    store.set('th_talents', []);
  }

  if (!store.get('th_users', null)) {
    store.set('th_users', {});
  }
}

seedIfEmpty();


/* ================= STATE ================= */
let currentUser = store.get('th_current_user', null);
let activeCategoryId = null;

/*
  FIX:
  activeFilter is declared here BEFORE showApp()
  can call renderCategories() -> renderExploreGrid()
  -> getFilteredTalents().
*/
let activeFilter = {
  type: 'all',
  value: null
};


/* ================= TIER LOGIC ================= */
function getTierFromEndorsements(count) {
  if (count >= 50) {
    return {
      name: 'Legend',
      cls: 'tier-legend'
    };
  }

  if (count >= 25) {
    return {
      name: 'Platinum',
      cls: 'tier-platinum'
    };
  }

  if (count >= 10) {
    return {
      name: 'Gold',
      cls: 'tier-gold'
    };
  }

  if (count >= 3) {
    return {
      name: 'Silver',
      cls: 'tier-silver'
    };
  }

  return {
    name: 'Bronze',
    cls: 'tier-bronze'
  };
}


function getActivityTier(postCount) {
  if (postCount >= 20) {
    return {
      name: 'Hub Legend',
      min: 20,
      max: 20
    };
  }

  if (postCount >= 10) {
    return {
      name: 'Core Member',
      min: 10,
      max: 20
    };
  }

  if (postCount >= 5) {
    return {
      name: 'Active',
      min: 5,
      max: 10
    };
  }

  if (postCount >= 1) {
    return {
      name: 'Rising',
      min: 1,
      max: 5
    };
  }

  return {
    name: 'Newcomer',
    min: 0,
    max: 1
  };
}


/* ================= AUTH ================= */

$('show-signup').onclick = () => {
  $('login-form').classList.add('hidden');
  $('signup-form').classList.remove('hidden');
};


$('show-login').onclick = () => {
  $('signup-form').classList.add('hidden');
  $('login-form').classList.remove('hidden');
};


$('signup-btn').onclick = () => {
  const username = $('signup-username').value.trim();
  const password = $('signup-password').value.trim();

  if (!username || !password) {
    return alert('Fill both fields');
  }

  const users = store.get('th_users', {});

  if (users[username]) {
    return alert('Username or mobile number already exists');
  }

  users[username] = password;
  store.set('th_users', users);

  // Clear signup fields
  $('signup-username').value = '';
  $('signup-password').value = '';

  // Show tick, then send user back to Login form
  showSuccessTick('Account created!', () => {
    $('signup-form').classList.add('hidden');
    $('login-form').classList.remove('hidden');
  });
};


$('login-btn').onclick = () => {
  const username = $('login-username').value.trim();
  const password = $('login-password').value.trim();

  const users = store.get('th_users', {});

  if (!users[username] || users[username] !== password) {
    return alert('Invalid username/mobile number or password');
  }

  showSuccessTick('Login successful!', () => {
    loginUser(username);

    $('login-username').value = '';
    $('login-password').value = '';
  });
};


/* ================= SUCCESS TICK OVERLAY ================= */

function showSuccessTick(message, onDone) {
  const overlay = $('success-overlay');

  $('success-message').textContent = message;

  // Restart the draw animation each time it is shown
  const circle = overlay.querySelector('.tick-circle');
  const check = overlay.querySelector('.tick-check');

  circle.style.animation = 'none';
  check.style.animation = 'none';

  // Force reflow so animation restarts
  void overlay.offsetWidth;

  circle.style.animation = '';
  check.style.animation = '';

  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');

    if (onDone) {
      onDone();
    }
  }, 1300);
}


function loginUser(username) {
  currentUser = username;

  store.set('th_current_user', username);

  showApp();
}


$('logout-btn').onclick = () => {
  currentUser = null;

  localStorage.removeItem('th_current_user');

  $('app-screen').classList.add('hidden');
  $('auth-screen').classList.remove('hidden');
};


function showApp() {
  $('auth-screen').classList.add('hidden');
  $('app-screen').classList.remove('hidden');

  renderCategories();
}


if (currentUser) {
  showApp();
}


/* ================= NAV SWITCHING ================= */

document.querySelectorAll('.nav-btn').forEach(btn => {

  btn.onclick = () => {

    document
      .querySelectorAll('.nav-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    document
      .querySelectorAll('.view')
      .forEach(v => v.classList.add('hidden'));

    $(btn.dataset.view).classList.remove('hidden');


    if (btn.dataset.view === 'spotlight-view') {
      renderSpotlight();
    }


    if (btn.dataset.view === 'profile-view') {
      renderProfile();
    }


    if (btn.dataset.view === 'explore-view') {

      $('category-posts-section').classList.add('hidden');

      $('explore-browse').classList.remove('hidden');
    }
  };

});


/* ================= EXPLORE: SEARCH + GRID ================= */

function renderCategories() {
  renderExploreGrid();
}


function getFilteredTalents() {

  const talents = store.get('th_talents', []);

  if (activeFilter.type === 'user') {

    return talents.filter(
      t => t.author === activeFilter.value
    );

  }

  return talents;
}


/* ================= INSTAGRAM STYLE GRID ================= */

function renderExploreGrid() {

  const grid = $('post-grid');

  grid.innerHTML = '';

  const list = getFilteredTalents();


  if (list.length === 0) {

    grid.innerHTML = `
      <div class="grid-empty">
        No talents here yet.<br>
        Tap "+ Post a Talent" to be the first.
      </div>
    `;

    return;
  }


  list.forEach((t, index) => {

    const cat = CATEGORIES.find(
      c => c.id === t.category
    );

    const tile = document.createElement('div');

    tile.className = 'grid-tile';


    let mediaHTML = `
      <div class="grid-tile-placeholder ${cat ? cat.cls : ''}">
        ${escapeHTML(t.title)}
      </div>
    `;


    if (t.image) {

      mediaHTML =
        t.mediaType === 'video'

          ? `
            <video
              src="${t.image}"
              muted
              preload="metadata">
            </video>

            <div class="grid-tile-video-icon">
              ▶
            </div>
          `

          : `
            <img
              src="${t.image}"
              alt="${escapeHTML(t.title)}">
          `;
    }


    tile.innerHTML = `
      ${mediaHTML}

      <div class="grid-tile-overlay">
        👍
        <span>${t.endorsements || 0}</span>
      </div>
    `;


    tile.onclick = () => {

      openReelsFromList(
        list,
        index,
        activeFilter.type === 'user'
          ? `@${activeFilter.value}`
          : $('explore-heading').textContent
      );

    };


    grid.appendChild(tile);

  });
}


/* ================= OPEN REELS ================= */

function openReelsFromList(list, startIndex, title) {

  // Reorder so clicked talent plays first
  const reordered = [
    list[startIndex],
    ...list.slice(0, startIndex),
    ...list.slice(startIndex + 1)
  ];


  $('explore-browse').classList.add('hidden');

  $('category-posts-section').classList.remove('hidden');

  $('category-title').textContent = title;

  renderReels(reordered);
}


/* ================= SEARCH PEOPLE BY USERNAME ================= */

$('user-search-input').addEventListener('input', (e) => {

  const query = e.target.value.trim().toLowerCase();

  const results = $('user-search-results');


  if (!query) {

    results.classList.add('hidden');

    results.innerHTML = '';

    return;
  }


  const users = store.get('th_users', {});


  const matches = Object.keys(users).filter(
    u => u.toLowerCase().includes(query)
  );


  if (matches.length === 0) {

    results.innerHTML = `
      <div
        class="user-result-item"
        style="color:var(--text-muted);cursor:default">

        No users found

      </div>
    `;

  } else {

    results.innerHTML = matches
      .map(u => `
        <div
          class="user-result-item"
          data-user="${escapeHTML(u)}">

          ${escapeHTML(u)}

        </div>
      `)
      .join('');


    results
      .querySelectorAll('.user-result-item[data-user]')
      .forEach(item => {

        item.onclick = () => {

          const username = item.dataset.user;


          activeFilter = {
            type: 'user',
            value: username
          };


          $('explore-heading').textContent =
            `@${username}`;


          $('user-search-input').value = '';

          results.classList.add('hidden');


          renderExploreGrid();

        };

      });

  }


  results.classList.remove('hidden');

});


/* ================= HIDE SEARCH RESULTS ================= */

document.addEventListener('click', (e) => {

  if (!e.target.closest('.search-bar-wrap')) {

    $('user-search-results').classList.add('hidden');

  }

});


/* ================= REELS RENDER ================= */

function renderReels(list) {

  const container = $('reels-container');

  container.innerHTML = '';


  if (list.length === 0) {

    container.innerHTML = `
      <div class="reels-empty">
        No talents posted in this category yet.<br>
        Be the first — tap "+ Post a Talent".
      </div>
    `;

    return;
  }


  list.forEach(t => {

    const tier = getTierFromEndorsements(
      t.endorsements || 0
    );


    const slide = document.createElement('div');

    slide.className =
      'reel-slide' +
      (t.image ? '' : ' no-image');


    slide.innerHTML = `

      ${t.image
        ? renderMediaHTML(t, 'reel-media')
        : ''
      }

      <div class="reel-side-actions">

        <div>

          <button
            class="reel-endorse-btn"
            data-id="${t.id}">

            👍

          </button>

          <div class="reel-endorse-count">
            ${t.endorsements || 0}
          </div>

        </div>

      </div>


      <div class="reel-overlay">

        <div class="reel-author">
          @${escapeHTML(t.author)}
        </div>

        <div class="reel-title">
          ${escapeHTML(t.title)}
        </div>

        <div class="reel-desc">
          ${escapeHTML(t.desc)}
        </div>

        <span class="tier-badge ${tier.cls} reel-tier">
          ${tier.name}
        </span>

      </div>

    `;


    container.appendChild(slide);

  });


  container
    .querySelectorAll('.reel-endorse-btn')
    .forEach(btn => {

      btn.onclick = () => {

        endorseTalent(
          btn.dataset.id,
          true
        );

      };

    });

}


/* ================= BACK TO CATEGORIES ================= */

$('back-to-categories').onclick = () => {

  $('category-posts-section').classList.add('hidden');

  $('explore-browse').classList.remove('hidden');

  renderExploreGrid();

};


/* ================= RENDER TALENT CARDS ================= */

function renderTalentList(container, list) {

  container.innerHTML = '';


  if (list.length === 0) {

    container.innerHTML = `
      <p
        style="
          color: var(--text-muted);
          font-size: 0.9rem;
        ">

        Nothing here yet.

      </p>
    `;

    return;
  }


  list.forEach(t => {

    const tier = getTierFromEndorsements(
      t.endorsements || 0
    );


    const card = document.createElement('div');

    card.className = 'talent-card';


    card.innerHTML = `

      <div class="talent-card-header">

        <h4>
          ${escapeHTML(t.title)}
        </h4>

        <span class="tier-badge ${tier.cls}">
          ${tier.name}
        </span>

      </div>


      <div class="talent-meta">

        ${escapeHTML(t.author)}
        ·
        ${new Date(t.timestamp).toLocaleDateString()}

      </div>


      <div>
        ${escapeHTML(t.desc)}
      </div>


      ${
        t.image
          ? renderMediaHTML(
              t,
              'talent-card-media'
            )
          : ''
      }


      <div class="talent-card-footer">

        <button
          class="endorse-btn"
          data-id="${t.id}">

          👍 Endorse

        </button>


        <span class="endorse-count">

          ${t.endorsements || 0}
          endorsements

        </span>

      </div>

    `;


    container.appendChild(card);

  });


  container
    .querySelectorAll('.endorse-btn')
    .forEach(btn => {

      btn.onclick = () => {

        endorseTalent(
          btn.dataset.id
        );

      };

    });

}


/* ================= RENDER MEDIA ================= */

function renderMediaHTML(t, cssClass) {

  if (!t.image) {
    return '';
  }


  if (t.mediaType === 'video') {

    return `
      <video
        src="${t.image}"
        class="${cssClass}"
        controls
        muted
        playsinline>
      </video>
    `;

  }


  return `
    <img
      src="${t.image}"
      class="${cssClass}"
      alt="${escapeHTML(t.title)}">
  `;

}


/* ================= ESCAPE HTML ================= */

function escapeHTML(str) {

  const div = document.createElement('div');

  div.textContent = str;

  return div.innerHTML;

}


/* ================= ENDORSE ================= */

function endorseTalent(id, fromReels) {

  const talents = store.get(
    'th_talents',
    []
  );


  const t = talents.find(
    t => t.id === id
  );


  if (!t) {
    return;
  }


  t.endorsements =
    (t.endorsements || 0) + 1;


  store.set(
    'th_talents',
    talents
  );


  if (fromReels) {

    // Update only this slide's count and tier
    // without full re-render

    const btn = document.querySelector(
      `.reel-endorse-btn[data-id="${id}"]`
    );


    if (btn) {

      const countEl =
        btn.parentElement.querySelector(
          '.reel-endorse-count'
        );


      countEl.textContent =
        t.endorsements;


      const tier =
        getTierFromEndorsements(
          t.endorsements
        );


      const badge =
        btn
          .closest('.reel-slide')
          .querySelector('.reel-tier');


      badge.textContent =
        tier.name;


      badge.className =
        `tier-badge ${tier.cls} reel-tier`;

    }


    return;
  }


  if (
    !$('spotlight-view')
      .classList
      .contains('hidden')
  ) {

    renderSpotlight();

  }

}


/* ================= NEW TALENT MODAL ================= */

$('new-talent-btn').onclick = () => {

  $('talent-modal')
    .classList
    .remove('hidden');

};


$('cancel-talent').onclick = () => {

  closeTalentModal();

};


function closeTalentModal() {

  $('talent-modal')
    .classList
    .add('hidden');


  $('talent-title').value = '';

  $('talent-desc').value = '';

  $('talent-image').value = '';


  $('talent-image-preview')
    .classList
    .add('hidden');


  $('talent-image-preview').src = '';


  $('talent-video-preview')
    .classList
    .add('hidden');


  $('talent-video-preview').src = '';


  pendingImageData = null;

  pendingMediaType = null;

}


/* ================= PENDING MEDIA ================= */

let pendingImageData = null;

let pendingMediaType = null;
// 'image' | 'video'


/* ================= TALENT IMAGE ================= */

$('talent-image').onchange = (e) => {

  const file = e.target.files[0];


  if (!file) {
    return;
  }


  const maxSizeMB =
    file.type.startsWith('video/')
      ? 8
      : 4;


  if (
    file.size >
    maxSizeMB * 1024 * 1024
  ) {

    alert(
      `This file is too large (${(
        file.size /
        (1024 * 1024)
      ).toFixed(1)}MB). Please pick one under ${maxSizeMB}MB — browser storage is limited.`
    );


    e.target.value = '';

    return;
  }


  pendingMediaType =
    file.type.startsWith('video/')
      ? 'video'
      : 'image';


  const reader =
    new FileReader();


  reader.onload = () => {

    pendingImageData =
      reader.result;


    if (
      pendingMediaType === 'video'
    ) {

      $('talent-image-preview')
        .classList
        .add('hidden');


      $('talent-image-preview').src = '';


      $('talent-video-preview').src =
        pendingImageData;


      $('talent-video-preview')
        .classList
        .remove('hidden');

    } else {

      $('talent-video-preview')
        .classList
        .add('hidden');


      $('talent-video-preview').src = '';


      $('talent-image-preview').src =
        pendingImageData;


      $('talent-image-preview')
        .classList
        .remove('hidden');

    }

  };


  reader.readAsDataURL(file);

};


/* ================= SUBMIT TALENT ================= */

$('submit-talent').onclick = () => {

  const title =
    $('talent-title')
      .value
      .trim();


  const desc =
    $('talent-desc')
      .value
      .trim();


  const category =
    $('talent-category').value;


  if (!title || !desc) {

    return alert(
      'Fill in the talent name and description'
    );

  }


  const talents =
    store.get(
      'th_talents',
      []
    );


  talents.unshift({

    id: 't' + Date.now(),

    author: currentUser,

    category: category,

    title: title,

    desc: desc,

    image: pendingImageData,

    mediaType: pendingMediaType,

    endorsements: 0,

    timestamp: Date.now()

  });


  const saved =
    store.set(
      'th_talents',
      talents
    );


  if (!saved) {
    return;
  }


  updateStreak();

  closeTalentModal();


  // Back to the full grid
  // so the user sees their new post

  activeFilter = {
    type: 'all',
    value: null
  };


  $('explore-heading').textContent =
    'All Talents';


  renderCategories();

};


/* ================= STREAK LOGIC ================= */

function updateStreak() {

  const today =
    new Date().toDateString();


  const streakData =
    store.get(
      'th_streak_' + currentUser,
      {
        lastPostDate: null,
        streak: 0
      }
    );


  if (
    streakData.lastPostDate === today
  ) {
    return;
  }


  const yesterday =
    new Date();


  yesterday.setDate(
    yesterday.getDate() - 1
  );


  streakData.streak =
    (
      streakData.lastPostDate ===
      yesterday.toDateString()
    )
      ? streakData.streak + 1
      : 1;


  streakData.lastPostDate =
    today;


  store.set(
    'th_streak_' + currentUser,
    streakData
  );

}


/* ================= SPOTLIGHT VIEW ================= */

function renderSpotlight() {

  const talents =
    store.get(
      'th_talents',
      []
    );


  const top =
    [...talents]
      .sort(
        (a, b) =>
          (b.endorsements || 0) -
          (a.endorsements || 0)
      )
      .slice(0, 5);


  renderTalentList(
    $('spotlight-list'),
    top
  );

}


/* ================= PROFILE VIEW ================= */

function renderProfile() {

  $('profile-username').textContent =
    currentUser;


  const talents =
    store.get(
      'th_talents',
      []
    );


  const myTalents =
    talents.filter(
      t => t.author === currentUser
    );


  const totalEndorsements =
    myTalents.reduce(
      (sum, t) =>
        sum + (t.endorsements || 0),
      0
    );


  const streakData =
    store.get(
      'th_streak_' + currentUser,
      {
        streak: 0
      }
    );


  $('stat-talents').textContent =
    myTalents.length;


  $('stat-endorsements').textContent =
    totalEndorsements;


  $('stat-streak').textContent =
    streakData.streak;


  const activityTier =
    getActivityTier(
      myTalents.length
    );


  $('activity-tier-badge').textContent =
    activityTier.name;


  const range =
    activityTier.max -
    activityTier.min ||
    1;


  const progressPct =
    Math.min(
      100,
      (
        (
          myTalents.length -
          activityTier.min
        ) /
        range
      ) * 100
    );


  $('activity-progress').style.width =
    progressPct + '%';


  $('activity-progress-label').textContent =
    `${myTalents.length} talents posted`;


  renderTalentList(
    $('my-talent-list'),
    myTalents
  );

}


/* ================= DARK MODE ================= */

const savedTheme =
  store.get(
    'th_theme',
    'light'
  );


if (savedTheme === 'dark') {

  document.documentElement
    .setAttribute(
      'data-theme',
      'dark'
    );

  $('theme-toggle').textContent =
    '☀️';

}


$('theme-toggle').onclick = () => {

  const isDark =
    document.documentElement
      .getAttribute('data-theme') ===
    'dark';


  if (isDark) {

    document.documentElement
      .removeAttribute(
        'data-theme'
      );


    $('theme-toggle').textContent =
      '🌙';


    store.set(
      'th_theme',
      'light'
    );

  } else {

    document.documentElement
      .setAttribute(
        'data-theme',
        'dark'
      );


    $('theme-toggle').textContent =
      '☀️';


    store.set(
      'th_theme',
      'dark'
    );

  }

};
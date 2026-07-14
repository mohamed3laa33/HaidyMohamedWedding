/* =============================================================
   Mohamed & Haidy — invitation logic
   -------------------------------------------------------------
   ✏️  EDIT ME: everything you'd normally want to change lives in
       the CONFIG block below.
   ============================================================= */
const CONFIG = {
  // Date & time of the wedding (used for the live countdown).
  // Format: "YYYY-MM-DDTHH:MM:SS+02:00"  (+02:00 = Cairo time)
  weddingDateTime: "2026-08-06T19:30:00+02:00",

  // Background music. Put your file at this path (an .mp3 works best).
  // If the file isn't there, the music button simply won't appear.
  songFile: "assets/song.mp3",

  // Doors slide open by themselves this many ms after load.
  // Set to 0 to keep them closed until "Open Invitation" is pressed.
  autoOpenDelay: 1300,

  // After the invitation opens, wait this long then gently auto-scroll down.
  // Cancels instantly if the guest scrolls/taps. Set autoScrollDelay to 0 to disable.
  autoScrollDelay: 1500,   // ms to wait before auto-scroll begins (~1.5s)
  autoScrollSpeed: 95,     // pixels per second (gentle)
};

/* ---------- 1. THE MOVING ELEVATOR ---------- */
const elevator  = document.getElementById("elevator");
const indicator = document.getElementById("indicator");
const floorNum  = document.getElementById("floorNum");
const openBtn   = document.getElementById("openBtn");
const invite    = document.getElementById("invite");

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Open the doors (reveal the couple inside the cabin).
function openDoors() { elevator.classList.add("open"); }
function closeDoors(){ elevator.classList.remove("open"); }

// Animate the floor indicator counting from `from` to `to`.
// Returns a promise that resolves when it arrives.
function runFloors(from, to) {
  return new Promise((resolve) => {
    const goingDown = to < from;
    indicator.classList.toggle("going-down", goingDown);
    elevator.classList.add("travelling");
    let cur = from;
    const step = goingDown ? -1 : 1;
    floorNum.textContent = cur;
    const tick = setInterval(() => {
      cur += step;
      floorNum.textContent = cur <= 1 ? "L" : cur;   // ground floor shows "L"
      if (cur === to) {
        clearInterval(tick);
        elevator.classList.remove("travelling");
        resolve();
      }
    }, prefersReduced ? 40 : 260);
  });
}

// Auto-arrival on load: the car "rises" to the lobby then opens.
if (!prefersReduced && CONFIG.autoOpenDelay > 0) {
  runFloors(3, 1).then(() => setTimeout(openDoors, 250));
} else if (CONFIG.autoOpenDelay > 0) {
  setTimeout(openDoors, CONFIG.autoOpenDelay);
}

// "Open Invitation": the car rides up (doors stay open so you watch the
// photo scroll by), then the invitation is revealed.
let invited = false;
openBtn.addEventListener("click", async () => {
  attemptPlay();                      // if music isn't already playing, start it now (this tap counts)
  if (invited) { showInvite(); return; }
  invited = true;
  openBtn.disabled = true;
  openBtn.textContent = "Going up…";

  openDoors();                        // make sure we can see inside
  await runFloors(1, 9);              // a longer ride — the full photo sweeps past
  await wait(prefersReduced ? 100 : 400);

  showInvite();
  openBtn.textContent = "Welcome";
});

function showInvite() {
  invite.classList.add("revealed");
  // reveal every section right away (don't rely only on scroll observers),
  // then glide down into the invitation
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 120 * i);
    });
    invite.scrollIntoView({ behavior: "smooth" });
    scheduleAutoScroll();
  });
}

// After opening, wait a few seconds then gently auto-scroll the guest down the
// page — hands-free. The moment they scroll or tap to take over, we cancel it.
function scheduleAutoScroll() {
  if (prefersReduced || !CONFIG.autoScrollDelay) return;
  let cancelled = false, rafId = 0, timer = 0, last = null, pos = 0;
  const events = ["wheel", "touchmove", "keydown", "pointerdown"];
  function stop() {
    cancelled = true;
    clearTimeout(timer);
    cancelAnimationFrame(rafId);
    events.forEach((e) => removeEventListener(e, stop));
  }
  events.forEach((e) => addEventListener(e, stop, { passive: true }));

  timer = setTimeout(() => {
    if (cancelled) return;
    pos = window.scrollY;
    const step = (ts) => {
      if (cancelled) return;
      if (last === null) last = ts;
      pos += (CONFIG.autoScrollSpeed * (ts - last)) / 1000;
      last = ts;
      window.scrollTo(0, pos);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (pos >= max - 1) { stop(); return; }   // reached the bottom
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }, CONFIG.autoScrollDelay);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Preview helper: open index.html#peek to jump straight to the invitation.
if (location.hash === "#peek" || location.hash === "#peekonly") {
  openDoors();
  invite.classList.add("revealed");
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  // #peekonly also hides the hero — handy for previewing just the invitation
  if (location.hash === "#peekonly") document.querySelector(".hero").style.display = "none";
}

/* ---------- 2. "A GLIMPSE INSIDE" FILM STRIP ---------- */
const film = document.getElementById("film");
const filmImgs = [...film.querySelectorAll("img")];
const dotsBox = document.getElementById("dots");
filmImgs.forEach((_, i) => {
  const s = document.createElement("span");
  if (i === 0) s.classList.add("on");
  dotsBox.appendChild(s);
});
const dots = [...dotsBox.children];
let filmIdx = 0;
setInterval(() => {
  filmImgs[filmIdx].classList.remove("active");
  dots[filmIdx].classList.remove("on");
  filmIdx = (filmIdx + 1) % filmImgs.length;
  filmImgs[filmIdx].classList.add("active");
  dots[filmIdx].classList.add("on");
}, 2600);

/* ---------- 3. COUNTDOWN ---------- */
const target = new Date(CONFIG.weddingDateTime).getTime();
const cd = {
  d: document.getElementById("cd-d"),
  h: document.getElementById("cd-h"),
  m: document.getElementById("cd-m"),
  s: document.getElementById("cd-s"),
};
function tickCountdown() {
  let diff = Math.max(0, target - Date.now());
  const day = Math.floor(diff / 86400000); diff -= day * 86400000;
  const hr  = Math.floor(diff / 3600000);  diff -= hr * 3600000;
  const min = Math.floor(diff / 60000);    diff -= min * 60000;
  const sec = Math.floor(diff / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  cd.d.textContent = day;
  cd.h.textContent = pad(hr);
  cd.m.textContent = pad(min);
  cd.s.textContent = pad(sec);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- 4. REVEAL SECTIONS ON SCROLL ----------
   (The RSVP section was intentionally removed at the couple's request.) */
function revealOnScroll() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}
revealOnScroll();

/* ---------- 5. GOLD SCROLL-PROGRESS BAR ---------- */
const progress = document.getElementById("scrollProgress");
function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
  progress.style.width = pct + "%";
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();

/* ---------- 6. BACKGROUND MUSIC ---------- */
const song = document.getElementById("song");
const musicBtn = document.getElementById("musicToggle");
const musicHint = document.getElementById("musicHint");
let wantPlay = true;   // we want music on as soon as possible; false only if paused by hand

song.querySelector("source").src = CONFIG.songFile;
song.preload = "auto";
song.load();

// Show the control RIGHT AWAY. (iOS Safari won't preload audio, so waiting for a
// "loaded" event would leave the button invisible until a tap — which looked like
// "music never loaded". Now the button is always there; if the file is genuinely
// missing, the error handler hides it.)
musicBtn.hidden = false;
musicBtn.classList.add("hint");
song.addEventListener("error", () => { musicBtn.hidden = true; hideHint(); });
["loadedmetadata", "canplay"].forEach((e) => song.addEventListener(e, attemptPlay));

function hideHint() { if (musicHint) musicHint.classList.add("gone"); }

function playSong() {
  wantPlay = true;
  // call play() straight inside the gesture; the browser buffers + starts even
  // before it's fully loaded.
  return song.play().then(() => {
    musicBtn.hidden = false;
    musicBtn.classList.add("playing");
    musicBtn.classList.remove("hint");
    musicBtn.setAttribute("aria-label", "Pause music");
    hideHint();
  });
}
function pauseSong() {
  wantPlay = false;
  song.pause();
  musicBtn.classList.remove("playing");
  musicBtn.setAttribute("aria-label", "Play music");
}
musicBtn.addEventListener("click", () => (song.paused ? playSong().catch(() => {}) : pauseSong()));

// Start music at the earliest possible moment. Browsers block audio-with-sound
// until the visitor interacts, so we arm EVERY early gesture (anywhere on the
// page) — the first tap/scroll opens the site *and* the song.
function attemptPlay() {
  if (wantPlay && song.paused) playSong().catch(() => {});
}
["pointerdown", "touchstart", "keydown", "scroll", "click"].forEach((e) =>
  addEventListener(e, attemptPlay, { passive: true }));

// tuck the hint away after a while even if nothing happens
setTimeout(hideHint, 9000);

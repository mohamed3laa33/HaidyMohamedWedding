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

  // Where RSVP replies should go. On GitHub Pages there is no server,
  // so submitting the form opens the guest's email app with a message
  // pre-filled to this address. Change it to your email.
  rsvpEmail: "mohamedabdelshakor1@gmail.com",

  // Doors slide open by themselves this many ms after load.
  // Set to 0 to keep them closed until "Open Invitation" is pressed.
  autoOpenDelay: 1300,
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

// "Open Invitation": take a little ride, then reveal the invitation.
let invited = false;
openBtn.addEventListener("click", async () => {
  if (invited) { showInvite(); return; }
  invited = true;
  openBtn.disabled = true;
  openBtn.textContent = "Going up…";

  closeDoors();                       // doors shut for the ride
  await wait(prefersReduced ? 100 : 900);
  await runFloors(1, 5);              // ride up to floor 5
  openDoors();                        // doors open at the top
  await wait(prefersReduced ? 100 : 900);

  showInvite();
  openBtn.textContent = "Welcome";
});

function showInvite() {
  invite.classList.add("revealed");
  // let layout settle, then scroll down into the invitation
  requestAnimationFrame(() => {
    invite.scrollIntoView({ behavior: "smooth" });
    setTimeout(revealOnScroll, 400);
  });
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

/* ---------- 4. REVEAL SECTIONS ON SCROLL ---------- */
function revealOnScroll() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}
revealOnScroll();

/* ---------- 5. RSVP (opens a pre-filled email — no server needed) ---------- */
document.getElementById("rsvpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const name   = f.name.value.trim();
  const join   = f.join.value;
  const guests = f.guests.value;
  const msg    = f.msg.value.trim();
  const subject = `Wedding RSVP — ${name || "Guest"}`;
  const body =
    `Name: ${name}\n` +
    `Attending: ${join}\n` +
    `Number of guests: ${guests}\n` +
    `Message: ${msg || "-"}`;
  window.location.href =
    `mailto:${CONFIG.rsvpEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  f.style.display = "none";
  document.getElementById("rsvpThanks").classList.add("show");
});

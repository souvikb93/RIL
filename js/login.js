/* Login – demo only. Every option goes straight into the app; no real auth yet. */

// Lottie: drop the animation at assets/login-animation.json and it replaces the fallback.
(async function loadAnimation() {
  const stage = document.getElementById('animStage');
  if (!window.lottie) return;
  try {
    const res = await fetch('assets/login-animation.json');
    if (!res.ok) return;
    const data = await res.json();
    window.lottie.loadAnimation({
      container: stage, renderer: 'svg', loop: true, autoplay: true, animationData: data,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });
    document.getElementById('animFallback').remove();
  } catch { /* keep the fallback illustration */ }
})();

function enter(user) {
  try { sessionStorage.setItem('empower.user', user || 'Guest'); } catch { /* private mode */ }
  document.body.classList.add('leaving');
  setTimeout(() => { location.href = 'app.html'; }, 220);
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  enter(email ? email.split('@')[0] : 'Guest');
});
document.querySelectorAll('[data-enter]').forEach((b) => b.addEventListener('click', () => enter('Guest')));

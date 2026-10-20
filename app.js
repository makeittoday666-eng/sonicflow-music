const audio = document.getElementById('audio');
const filePicker = document.getElementById('filePicker');
const trackList = document.getElementById('trackList');
const nowTitle = document.getElementById('nowTitle');
const nowSubtitle = document.getElementById('nowSubtitle');
const playBtn = document.getElementById('playBtn');
const seek = document.getElementById('seek');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const favBtn = document.getElementById('favBtn');
let tracks = [];
let currentIndex = -1;
let favorites = new Set(JSON.parse(localStorage.getItem('sf-favs') || '[]'));
let deferredPrompt = null;

function fmt(t) {
  if (!Number.isFinite(t) || t < 0) return '0:00';
  return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
}
function addTrack(track) {
  tracks.push(track);
  renderTracks();
}
function playIndex(i) {
  if (!tracks.length) return;
  currentIndex = (i + tracks.length) % tracks.length;
  const t = tracks[currentIndex];
  audio.src = t.src;
  nowTitle.textContent = t.name;
  nowSubtitle.textContent = t.kind === 'local' ? 'Local file selected' : 'Online audio';
  favBtn.textContent = favorites.has(t.key) ? '♥' : '♡';
  audio.play().then(() => { playBtn.textContent = 'Ⅱ'; }).catch(() => {
    playBtn.textContent = '▶';
    alert('Could not play this audio. Check the URL, connection, and file format.');
  });
  renderTracks();
}
function togglePlay() {
  if (!audio.src) {
    if (tracks.length) playIndex(0);
    return;
  }
  if (audio.paused) audio.play().then(() => playBtn.textContent = 'Ⅱ').catch(() => {});
  else audio.pause();
}
function renderTracks() {
  trackList.innerHTML = '';
  if (!tracks.length) {
    trackList.innerHTML = '<div class="empty">Your selected tracks will appear here.</div>';
    return;
  }
  tracks.forEach((t, i) => {
    const row = document.createElement('div'); row.className = 'track';
    const icon = document.createElement('div'); icon.className = 'track-icon'; icon.textContent = '♫';
    const info = document.createElement('div'); info.className = 'track-info';
    const title = document.createElement('strong'); title.textContent = t.name;
    const sub = document.createElement('small'); sub.textContent = t.kind === 'local' ? 'Local file' : 'Online URL';
    info.append(title, sub);
    const fav = document.createElement('button'); fav.type = 'button'; fav.textContent = favorites.has(t.key) ? '♥' : '♡'; fav.setAttribute('aria-label','Favorite');
    fav.onclick = () => { favorites.has(t.key) ? favorites.delete(t.key) : favorites.add(t.key); localStorage.setItem('sf-favs', JSON.stringify([...favorites])); renderTracks(); if (tracks[currentIndex]?.key === t.key) favBtn.textContent = favorites.has(t.key) ? '♥' : '♡'; };
    const play = document.createElement('button'); play.type = 'button'; play.textContent = '▶'; play.setAttribute('aria-label','Play track'); play.onclick = () => playIndex(i);
    row.append(icon, info, fav, play); trackList.append(row);
  });
}
filePicker.addEventListener('change', e => {
  [...e.target.files].forEach(file => addTrack({
    name: file.name.replace(/\.[^.]+$/, ''),
    src: URL.createObjectURL(file),
    kind: 'local',
    key: `local:${file.name}:${file.size}:${file.lastModified}`
  }));
  e.target.value = '';
});
document.getElementById('urlForm').addEventListener('submit', e => {
  e.preventDefault();
  const url = document.getElementById('trackUrl').value.trim();
  if (!url) return;
  let name = 'Online track';
  try { name = decodeURIComponent(new URL(url).pathname.split('/').pop()) || name; } catch {}
  addTrack({name, src:url, kind:'online', key:`url:${url}`});
  document.getElementById('trackUrl').value = '';
  playIndex(tracks.length - 1);
});
playBtn.addEventListener('click', togglePlay);
document.getElementById('prevBtn').addEventListener('click', () => { if (tracks.length) playIndex(currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1); });
document.getElementById('nextBtn').addEventListener('click', () => { if (tracks.length) playIndex(currentIndex + 1); });
favBtn.addEventListener('click', () => {
  if (currentIndex < 0) return;
  const key = tracks[currentIndex].key;
  favorites.has(key) ? favorites.delete(key) : favorites.add(key);
  localStorage.setItem('sf-favs', JSON.stringify([...favorites]));
  favBtn.textContent = favorites.has(key) ? '♥' : '♡';
  renderTracks();
});
audio.addEventListener('play', () => playBtn.textContent = 'Ⅱ');
audio.addEventListener('pause', () => playBtn.textContent = '▶');
audio.addEventListener('ended', () => { if (tracks.length > 1) playIndex(currentIndex + 1); else playBtn.textContent = '▶'; });
audio.addEventListener('loadedmetadata', () => duration.textContent = fmt(audio.duration));
audio.addEventListener('timeupdate', () => {
  currentTime.textContent = fmt(audio.currentTime);
  duration.textContent = fmt(audio.duration);
  if (Number.isFinite(audio.duration) && audio.duration > 0) seek.value = String(Math.round(audio.currentTime / audio.duration * 1000));
});
seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value) / 1000 * audio.duration; });

// Use the standard HTML audio element (not Web Audio) to give iOS the best chance
// of continuing playback when the app is backgrounded or the screen is locked.
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack', () => { if (tracks.length) playIndex(currentIndex - 1); });
  navigator.mediaSession.setActionHandler('nexttrack', () => { if (tracks.length) playIndex(currentIndex + 1); });
}
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  document.getElementById('installBtn').classList.remove('hidden');
});
document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null;
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

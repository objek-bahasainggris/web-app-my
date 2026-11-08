/* Objex — learning app logic. Photos are analyzed in-browser and are not uploaded. */
'use strict';

const $ = (id) => document.getElementById(id);
const pages = [...document.querySelectorAll('.page')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const titles = { home: 'Halo, Penjelajah! 👋', missions: 'Misi Eksplorasi 🧭', camera: 'Ambil Foto 📷', words: 'Kotak Kosakata 📚', practice: 'Latihan Kalimat ✍️', achievements: 'Badge dan Penghargaan 🏆', profile: 'Profil Pelajar 👤', teacher: 'Dashboard Guru 🧑‍🏫' };
const STORAGE_KEY = 'objexProgress_v2';
const ROSTER_KEY = 'objexTeacherRoster_v1';
const PROFILE_KEY = 'objexStudentProfile_v1';
const PRACTICE_KEY = 'objexPracticeCount_v1';

const missionData = {
  write: { title: 'Find something you write with!', hint: 'Foto pensil, pulpen, atau alat tulis.', points: 50, level: 'easy', icon: '✏️', keys: [] },
  flower: { title: 'Find a colourful flower!', hint: 'Foto bunga berwarna-warni.', points: 50, level: 'easy', icon: '🌸', keys: [] },
  sports: { title: 'Find a ball or sports equipment!', hint: 'Foto bola atau alat olahraga.', points: 50, level: 'easy', icon: '⚽', keys: ['sports ball', 'baseball bat', 'tennis racket', 'skateboard', 'frisbee', 'kite', 'surfboard', 'skis', 'snowboard'] },
  bottle: { title: 'Find your drink bottle!', hint: 'Foto botol minumanmu.', points: 50, level: 'easy', icon: '🧴', keys: ['bottle'] },
  classmate: { title: 'Find your classmate!', hint: 'Foto teman sekelas hanya setelah mendapat izin. Hindari membagikan foto orang lain.', points: 50, level: 'easy', icon: '🧑‍🤝‍🧑', keys: ['person'], privacy: true },
  book: { title: 'Find your favorite book!', hint: 'Foto buku kesukaanmu.', points: 50, level: 'easy', icon: '📘', keys: ['book'] },
  white: { title: 'Find something white or clean!', hint: 'Foto benda berwarna putih atau terlihat bersih.', points: 50, level: 'easy', icon: '🤍', keys: [] },
  square: { title: 'Find a square object!', hint: 'Foto benda berbentuk persegi di kelas.', points: 75, level: 'medium', icon: '🔲', keys: [] },
  texture: { title: 'Find a natural texture!', hint: 'Foto tekstur daun, batang pohon, atau batu.', points: 75, level: 'medium', icon: '🍃', keys: [] },
  big: { title: 'Find something big outside!', hint: 'Foto benda besar seperti pagar atau tiang bendera.', points: 75, level: 'medium', icon: '🏫', keys: ['bus', 'truck', 'train', 'airplane'] },
  lunch: { title: 'Find your snack or lunch box!', hint: 'Foto bekal, makanan ringan, atau kotak makan.', points: 75, level: 'medium', icon: '🍱', keys: ['apple', 'orange', 'banana', 'sandwich', 'pizza', 'donut', 'cake', 'bowl', 'cup', 'carrot', 'broccoli', 'hot dog'] },
  reading: { title: 'Find something you read to learn!', hint: 'Foto buku, kamus, atau majalah.', points: 75, level: 'medium', icon: '📚', keys: ['book'] },
  medical: { title: 'Find medical equipment or first aid items!', hint: 'Foto kotak P3K atau termometer. Jangan gunakan obat tanpa arahan orang dewasa.', points: 75, level: 'medium', icon: '🩹', keys: [] },
  uniform: { title: 'Find someone in a uniform or role!', hint: 'Amati guru atau petugas. Minta izin sebelum memotret dan jangan unggah foto tanpa izin.', points: 75, level: 'medium', icon: '🧑‍🏫', keys: ['person'], privacy: true }
};

const vocabData = [
  { category: 'In the Classroom', translation: 'Di Dalam Kelas', words: [['pencil','pensil','✏️'],['pen','pulpen','🖊️'],['ruler','penggaris','📏'],['eraser','penghapus','🧽'],['notebook','buku catatan','📓'],['textbook','buku pelajaran','📘'],['desk','meja','🪑'],['chair','kursi','💺'],['whiteboard','papan tulis','🧑‍🏫'],['clock','jam dinding','🕒'],['bag','tas','🎒']] },
  { category: 'In the School Garden', translation: 'Di Taman Sekolah', words: [['leaf','daun','🍃'],['flower','bunga','🌸'],['tree','pohon','🌳'],['stem','batang','🌿'],['grass','rumput','🌱'],['stone / rock','batu','🪨'],['soil','tanah','🟤'],['pot','pot tanaman','🪴'],['fresh','segar','💧'],['green','hijau','🟢'],['brown','cokelat','🟫'],['dry','kering','🍂']] },
  { category: 'Around the School Yard', translation: 'Di Sekitar Lapangan & Halaman', words: [['field','lapangan','🏟️'],['ball','bola','⚽'],['net','jaring','🥅'],['gate','gerbang','🚪'],['flagpole','tiang bendera','🚩'],['bench','bangku','🪑'],['fence','pagar','🚧'],['wide','luas','↔️'],['tall','tinggi','📏'],['hard','keras','🪨']] },
  { category: 'At the Canteen', translation: 'Di Kantin Sekolah', words: [['bottle','botol','🧴'],['snack','makanan ringan','🍪'],['lunchbox','kotak makan','🍱'],['plate','piring','🍽️'],['glass','gelas','🥛'],['spoon','sendok','🥄'],['fork','garpu','🍴'],['sweet','manis','🍬'],['salty','asin/gurih','🥨'],['cold','dingin','🧊'],['warm','hangat','☕']] },
  { category: 'In the Library', translation: 'Di Perpustakaan', words: [['bookshelf','rak buku','📚'],['dictionary','kamus','📖'],['magazine','majalah','📰'],['story book','buku cerita','📕'],['table','meja baca','🪑'],['chair','kursi baca','💺'],['card','kartu anggota','🪪'],['thick','tebal','📚'],['thin','tipis','📄'],['quiet','tenang','🤫'],['many','banyak','🔢']] },
  { category: 'At the School Clinic / UKS', translation: 'Di Unit Kesehatan Sekolah', words: [['bed','tempat tidur','🛏️'],['medicine','obat','💊'],['first aid kit','kotak P3K','🩹'],['thermometer','termometer','🌡️'],['pillow','bantal','🛌'],['blanket','selimut','🧣'],['sink','wastafel','🚰'],['clean','bersih','✨'],['white','putih','⚪'],['safe','aman','🛡️']] },
  { category: 'School Members', translation: 'Warga Sekolah', words: [['student','siswa','🧑‍🎓'],['classmate','teman sekelas','🧑‍🤝‍🧑'],['teacher','guru','🧑‍🏫'],['principal','kepala sekolah','👨‍💼'],['librarian','pustakawan','📚'],['security guard','satpam','🧑‍✈️']] }
];

let currentMission = 'write';
let selectedImage = null;
let objectDetectionModel = null;
let detections = [];
let analyzed = false;
let aiMatch = false;
let aiMatchType = 'manual';
let modelLoading = false;
let toastTimer;

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const validCompleted = Array.isArray(saved.completed) ? saved.completed.filter(id => Object.hasOwn(missionData, id)) : [];
    return { completed: new Set(validCompleted), photos: Number.isFinite(saved.photos) && saved.photos >= 0 ? saved.photos : 0 };
  } catch (error) { console.warn('Data Objex tidak dapat dibaca:', error); return { completed: new Set(), photos: 0 }; }
}
const progress = loadProgress();
let completed = progress.completed;
let photos = progress.photos;
let earned = [...completed].reduce((sum, id) => sum + missionData[id].points, 0);
let studentProfile = loadStudentProfile();
let practiceCount = Number(localStorage.getItem(PRACTICE_KEY) || 0) || 0;
let flashcardIndex = 0;
let flashcardFlipped = false;
let visibleVocabulary = vocabData.flatMap(group => group.words.map(([word, meaning, icon]) => ({ word, meaning, icon, category: group.category })));

function loadStudentProfile() {
  try { const data = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); return { name: typeof data.name === 'string' ? data.name : 'Pelajar Objex', className: typeof data.className === 'string' ? data.className : 'Kelas 7' }; }
  catch { return { name: 'Pelajar Objex', className: 'Kelas 7' }; }
}
function saveStudentProfile() { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(studentProfile)); } catch (error) { showToast('Profil tidak dapat disimpan di browser ini.'); } }
function renderProfile() {
  $('profileNameHeading').textContent = studentProfile.name; $('profileClassLabel').textContent = `${studentProfile.className} • Penjelajah bahasa Inggris level pemula`;
  $('profileNameInput').value = studentProfile.name === 'Pelajar Objex' ? '' : studentProfile.name; $('profileClassInput').value = studentProfile.className === 'Kelas 7' ? '' : studentProfile.className;
  const userName = document.querySelector('.sidebar-user b'); if (userName) userName.textContent = studentProfile.name;
  const userClass = document.querySelector('.sidebar-user small'); if (userClass) userClass.textContent = studentProfile.className;
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...completed], photos })); }
  catch (error) { showToast('Penyimpanan browser penuh atau dinonaktifkan.'); console.warn(error); }
}
function showToast(message) {
  const toast = $('toast'); if (!toast) return;
  toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function go(page) {
  pages.forEach(p => p.classList.toggle('active', p.id === page));
  navLinks.forEach(n => n.classList.toggle('active', n.dataset.page === page));
  $('pageTitle').textContent = titles[page] || 'Objex';
  if (page === 'teacher') renderTeacherDashboard();
  if (page === 'achievements') renderBadges();
  if (page === 'profile') renderProfile();
  if (page === 'words') renderFlashcard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateStats() {
  earned = [...completed].reduce((sum, id) => sum + missionData[id].points, 0);
  ['topPoints','profilePoints'].forEach(id => { if ($(id)) $(id).textContent = earned; });
  if ($('missionCount')) $('missionCount').textContent = `${completed.size} / ${Object.keys(missionData).length}`;
  if ($('profileMissions')) $('profileMissions').textContent = completed.size;
  if ($('profilePhotos')) $('profilePhotos').textContent = photos;
  if ($('homePoints')) $('homePoints').textContent = earned;
  if ($('homePhotos')) $('homePhotos').textContent = photos;
  if ($('homeBadges')) $('homeBadges').textContent = getUnlockedBadges().length;
  if ($('progressBar')) $('progressBar').style.width = `${completed.size / Object.keys(missionData).length * 100}%`;
  if ($('progressBar')) $('progressBar').setAttribute('aria-valuenow', String(completed.size));
  saveProgress();
  if ($('badgeGrid')) renderBadges();
  if ($('teacher') && $('teacher').classList.contains('active')) renderTeacherDashboard();
}
function renderMissions() {
  const list = $('missionList'); list.innerHTML = '';
  Object.entries(missionData).forEach(([id, mission]) => {
    const row = document.createElement('article'); row.className = 'mission-row';
    const art = document.createElement('div'); art.className = `row-art ${mission.level === 'easy' ? 'green' : 'yellow'}`; art.textContent = mission.icon;
    const content = document.createElement('div'); content.className = 'row-content';
    const level = document.createElement('span'); level.className = `difficulty ${mission.level}`; level.textContent = `${mission.level === 'easy' ? 'MUDAH' : 'MENENGAH'} • ${mission.points} POIN`;
    const heading = document.createElement('h3'); heading.textContent = mission.title;
    const hint = document.createElement('p'); hint.textContent = mission.hint;
    content.append(level, heading, hint);
    const button = document.createElement('button'); button.className = 'btn'; button.dataset.start = id; button.textContent = completed.has(id) ? 'Selesai ✓' : 'Kerjakan →';
    row.append(art, content, button); list.appendChild(row);
  });
  list.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => startMission(button.dataset.start)));
}
function renderHomeMissions() {
  const grid = document.querySelector('.mission-grid'); grid.innerHTML = '';
  Object.entries(missionData).slice(0, 3).forEach(([id, mission]) => {
    const card = document.createElement('article'); card.className = 'mission-card';
    const art = document.createElement('div'); art.className = `mission-art ${mission.level === 'easy' ? 'green' : 'yellow'}`; art.textContent = mission.icon;
    const body = document.createElement('div'); body.className = 'card-body';
    const level = document.createElement('span'); level.className = `difficulty ${mission.level}`; level.textContent = mission.level === 'easy' ? '● Mudah' : '● Menengah';
    const title = document.createElement('h3'); title.textContent = mission.title;
    const hint = document.createElement('p'); hint.textContent = mission.hint;
    const bottom = document.createElement('div'); bottom.className = 'card-bottom';
    const points = document.createElement('span'); points.textContent = `⭐ ${mission.points} poin`;
    const button = document.createElement('button'); button.className = 'btn btn-small'; button.dataset.start = id; button.textContent = completed.has(id) ? 'Ulangi' : 'Mulai';
    bottom.append(points, button); body.append(level, title, hint, bottom); card.append(art, body); grid.appendChild(card);
  });
  grid.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => startMission(button.dataset.start)));
}
function renderVocabulary() {
  const categories = $('vocabCategories'), grid = $('vocabGrid'); categories.innerHTML = ''; grid.innerHTML = '';
  vocabData.forEach(group => {
    const heading = document.createElement('div'); heading.className = 'vocab-category-heading';
    const title = document.createElement('h3'); title.textContent = group.category;
    const translation = document.createElement('p'); translation.textContent = group.translation;
    heading.append(title, translation); grid.appendChild(heading);
    group.words.forEach(([word, meaning, icon]) => {
      const card = document.createElement('div'); card.className = 'vocab-card';
      const emoji = document.createElement('span'); emoji.textContent = icon;
      const english = document.createElement('b'); english.textContent = word;
      const indonesian = document.createElement('small'); indonesian.textContent = meaning;
      card.append(emoji, english, indonesian); grid.appendChild(card);
    });
  });
  const total = vocabData.reduce((count, group) => count + group.words.length, 0);
  categories.innerHTML = `<div class="vocab-summary">📚 ${total} entri kosakata dalam ${vocabData.length} kategori</div>`;
}
function renderFlashcard() {
  const search = ($('vocabSearch')?.value || '').trim().toLowerCase();
  visibleVocabulary = vocabData.flatMap(group => group.words.map(([word, meaning, icon]) => ({ word, meaning, icon, category: group.category })))
    .filter(item => `${item.word} ${item.meaning} ${item.category}`.toLowerCase().includes(search));
  if (!visibleVocabulary.length) {
    $('flashcardWord').textContent = 'Tidak ditemukan'; $('flashcardIcon').textContent = '🔎'; $('flashcardMeaning').textContent = 'Coba kata lain';
    $('flashcardMeaning').hidden = false; $('flashcardCounter').textContent = '0 kartu'; return;
  }
  flashcardIndex = flashcardIndex % visibleVocabulary.length; flashcardFlipped = false;
  const item = visibleVocabulary[flashcardIndex];
  $('flashcardWord').textContent = item.word; $('flashcardIcon').textContent = item.icon;
  $('flashcardMeaning').textContent = item.meaning; $('flashcardMeaning').hidden = true;
  $('flashcard').classList.remove('flipped'); $('flashcardCounter').textContent = `Kartu ${flashcardIndex + 1} dari ${visibleVocabulary.length}`;
  $('flashcard').setAttribute('aria-label', `Kartu ${item.word}. Tekan untuk melihat arti.`);
}
function flipFlashcard() {
  if (!visibleVocabulary.length) return;
  flashcardFlipped = !flashcardFlipped; $('flashcardMeaning').hidden = !flashcardFlipped;
  $('flashcard').classList.toggle('flipped', flashcardFlipped);
}
const badgeDefinitions = [
  { id:'first', icon:'🌱', name:'First Explorer', description:'Selesaikan misi pertamamu.', goal:1, value:()=>completed.size, label:'misi' },
  { id:'three', icon:'🧭', name:'Explorer', description:'Selesaikan 3 misi eksplorasi.', goal:3, value:()=>completed.size, label:'misi' },
  { id:'seven', icon:'🏅', name:'Super Explorer', description:'Selesaikan 7 misi eksplorasi.', goal:7, value:()=>completed.size, label:'misi' },
  { id:'all', icon:'👑', name:'Objex Champion', description:'Selesaikan semua 14 misi.', goal:14, value:()=>completed.size, label:'misi' },
  { id:'points', icon:'⭐', name:'Point Collector', description:'Kumpulkan minimal 250 poin.', goal:250, value:()=>earned, label:'poin' },
  { id:'photos', icon:'📸', name:'Photo Hunter', description:'Pilih minimal 5 foto untuk misi.', goal:5, value:()=>photos, label:'foto' },
  { id:'writer', icon:'✍️', name:'Sentence Builder', description:'Coba 5 latihan kalimat.', goal:5, value:()=>practiceCount, label:'latihan' }
];
function getUnlockedBadges() { return badgeDefinitions.filter(badge => badge.value() >= badge.goal); }
function renderBadges() {
  const unlocked = getUnlockedBadges(); $('badgeCount').textContent = `${unlocked.length} / ${badgeDefinitions.length}`;
  $('badgeProgress').style.width = `${unlocked.length / badgeDefinitions.length * 100}%`;
  const grid = $('badgeGrid'); grid.replaceChildren();
  badgeDefinitions.forEach(badge => {
    const value = Math.min(badge.value(), badge.goal), isUnlocked = value >= badge.goal;
    const card = document.createElement('article'); card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    const icon = document.createElement('div'); icon.className = 'badge-icon'; icon.textContent = isUnlocked ? badge.icon : '🔒';
    const title = document.createElement('h3'); title.textContent = badge.name;
    const description = document.createElement('p'); description.textContent = badge.description;
    const progressText = document.createElement('small'); progressText.textContent = isUnlocked ? 'Terbuka ✓' : `${value} / ${badge.goal} ${badge.label}`;
    const bar = document.createElement('div'); bar.className = 'badge-progress'; const fill = document.createElement('i'); fill.style.width = `${value / badge.goal * 100}%`; bar.appendChild(fill);
    card.append(icon, title, description, progressText, bar); grid.appendChild(card);
  });
}
const practiceExamples = {
  leaf: { prompt:'Daun hijau', example:'This is a green leaf.', words:['This','is','a','green','leaf.'] },
  flower: { prompt:'Bunga indah', example:'The flower is beautiful.', words:['The','flower','is','beautiful.'] },
  book: { prompt:'Buku besar', example:'This is a big book.', words:['This','is','a','big','book.'] },
  bottle: { prompt:'Botol biru', example:'This is a blue bottle.', words:['This','is','a','blue','bottle.'] },
  tree: { prompt:'Pohon tinggi', example:'I see a tall tree.', words:['I','see','a','tall','tree.'] },
  ball: { prompt:'Bola merah', example:'This is a red ball.', words:['This','is','a','red','ball.'] }
};
function updatePracticePrompt() { const item = practiceExamples[$('practicePrompt').value]; $('practiceExample').textContent = `Petunjuk: ${item.example}`; }
function checkPractice() {
  const input = $('practiceInput').value.trim(); const result = checkSentence(input); practiceCount += 1;
  try { localStorage.setItem(PRACTICE_KEY, String(practiceCount)); } catch {}
  const box = $('practiceResult'); box.className = `practice-result ${result.ok ? 'good' : 'needs-work'}`;
  box.textContent = `${result.title} ${result.message} ${result.corrected ? `Saran penulisan: ${result.corrected}` : ''}`;
  renderBadges(); updateStats();
}

function clearDetectionOverlay() { const old = $('detectionOverlay'); if (old) old.remove(); }
function resetAIResult() {
  detections = []; analyzed = false; aiMatch = false; aiMatchType = 'manual'; clearDetectionOverlay();
  if ($('aiResult')) $('aiResult').textContent = 'Pilih foto, kemudian jalankan deteksi objek AI.';
  if ($('aiStatus')) $('aiStatus').textContent = objectDetectionModel ? 'AI siap' : (modelLoading ? 'Memuat model…' : 'Belum aktif');
  if ($('analyzeButton')) $('analyzeButton').disabled = !selectedImage || modelLoading;
}
function startMission(id) {
  if (!missionData[id]) return;
  currentMission = id; selectedImage = null; $('galleryInput').value = ''; $('cameraInput').value = '';
  $('cameraMission').textContent = `${missionData[id].title} — ${missionData[id].hint}`;
  $('description').value = ''; $('charCount').textContent = '0/160'; $('resultPanel').hidden = true;
  $('photoPreview').innerHTML = '<div class="camera-placeholder">📸<b>Foto benda di sekitarmu</b><span>Gunakan kamera atau pilih foto dari perangkat.</span></div>';
  resetAIResult(); $('analyzeButton').textContent = '🔍 Analisis Foto dengan AI'; go('camera');
}
function loadPhoto(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Pilih file gambar ya!'); return; }
  if (file.size > 8 * 1024 * 1024) { showToast('Ukuran foto maksimal 8 MB.'); return; }
  const reader = new FileReader();
  reader.onerror = () => showToast('Foto tidak dapat dibaca. Coba file gambar lain.');
  reader.onload = event => {
    const image = new Image(); image.alt = 'Foto benda yang dipilih'; image.id = 'selectedPhoto';
    image.onload = () => {
      selectedImage = image; $('photoPreview').replaceChildren(image); resetAIResult();
      photos += 1; updateStats(); showToast('Foto siap dianalisis.');
    };
    image.onerror = () => showToast('Gambar tidak dapat dibuka.');
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}
async function loadAIModel() {
  if (objectDetectionModel || modelLoading) return;
  modelLoading = true; $('aiStatus').textContent = 'Memuat model…'; $('aiResult').textContent = 'Mengunduh model AI. Koneksi internet diperlukan saat pertama kali digunakan.';
  try {
    if (!window.cocoSsd) throw new Error('Library COCO-SSD belum termuat. Periksa internet, lalu muat ulang halaman.');
    objectDetectionModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    $('aiStatus').textContent = 'AI siap'; $('aiResult').textContent = 'Model AI siap. Pilih foto untuk mulai mendeteksi objek.';
  } catch (error) {
    $('aiStatus').textContent = 'Gagal dimuat'; $('aiResult').textContent = `${error.message} Kamu masih dapat mencoba memuat ulang halaman.`;
    console.error('Objex AI model:', error);
  } finally {
    modelLoading = false; $('analyzeButton').disabled = !selectedImage;
  }
}
function getMissionMatch(found, missionId) {
  const keys = missionData[missionId].keys;
  if (!keys.length) return { type: 'manual', match: false, explanation: 'Misi ini memerlukan pemeriksaan warna, bentuk, tekstur, atau jenis benda yang belum dapat dipastikan oleh model COCO-SSD.' };
  const hit = found.find(item => keys.includes(item.class));
  if (hit) return { type: 'detected', match: true, explanation: `AI menemukan “${hit.class}” dengan skor ${Math.round(hit.score * 100)}%.` };
  return { type: 'not-found', match: false, explanation: 'Objek yang cocok belum terdeteksi. Model ini hanya mengenali kelas benda tertentu; hasil ini bukan berarti fotomu pasti salah.' };
}
function drawDetectionBoxes(found) {
  clearDetectionOverlay();
  const preview = $('photoPreview'); const image = $('selectedPhoto'); if (!image || !found.length) return;
  const canvas = document.createElement('canvas'); canvas.id = 'detectionOverlay'; canvas.className = 'detection-overlay';
  canvas.width = preview.clientWidth; canvas.height = preview.clientHeight; preview.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const offsetX = (canvas.width - image.naturalWidth * scale) / 2;
  const offsetY = (canvas.height - image.naturalHeight * scale) / 2;
  ctx.lineWidth = 3; ctx.font = 'bold 13px Arial';
  found.forEach(item => {
    const [x, y, width, height] = item.bbox;
    const left = offsetX + x * scale, top = offsetY + y * scale, boxW = width * scale, boxH = height * scale;
    ctx.strokeStyle = '#14a66a'; ctx.fillStyle = 'rgba(20,166,106,.13)'; ctx.strokeRect(left, top, boxW, boxH); ctx.fillRect(left, top, boxW, boxH);
    const label = `${item.class} ${Math.round(item.score * 100)}%`; const labelWidth = ctx.measureText(label).width + 12;
    ctx.fillStyle = '#087a4b'; ctx.fillRect(left, Math.max(0, top - 23), labelWidth, 22); ctx.fillStyle = '#fff'; ctx.fillText(label, left + 6, Math.max(15, top - 7));
  });
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]); }
async function analyzePhoto() {
  if (!selectedImage) { showToast('Pilih foto terlebih dahulu.'); return; }
  const button = $('analyzeButton'); button.disabled = true; button.textContent = '⏳ AI sedang menganalisis…';
  $('aiResult').textContent = 'Menganalisis foto di perangkat ini…';
  try {
    if (!objectDetectionModel) {
      if (!window.cocoSsd) throw new Error('Library AI belum tersedia. Periksa koneksi internet dan muat ulang halaman.');
      objectDetectionModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    }
    detections = await objectDetectionModel.detect(selectedImage, 10, 0.35);
    analyzed = true;
    const match = getMissionMatch(detections, currentMission); aiMatch = match.match; aiMatchType = match.type;
    drawDetectionBoxes(detections);
    const rows = detections.length ? `<ol class="ai-predictions">${detections.map(item => `<li>${escapeHtml(item.class)} <b>${Math.round(item.score * 100)}%</b><div class="ai-confidence"><i style="width:${Math.round(item.score * 100)}%"></i></div></li>`).join('')}</ol>` : '<p>Belum ada objek yang dikenali. Coba foto lebih dekat dengan pencahayaan yang baik.</p>';
    const matchClass = match.match ? 'success' : 'warning';
    const matchTitle = match.match ? '✅ Kemungkinan objek sesuai' : (match.type === 'manual' ? '👀 Perlu pemeriksaanmu' : '⚠️ Belum ditemukan kecocokan');
    $('aiResult').innerHTML = `<h4>Hasil deteksi AI</h4>${rows}<div class="ai-match ${matchClass}">${matchTitle}<br><span>${escapeHtml(match.explanation)}</span></div><small>Kotak hijau menandai objek yang dikenali. Skor bukan jaminan kebenaran. Model COCO-SSD hanya mengenali 80 kelas umum.</small>`;
    showToast('Analisis AI selesai. Periksa hasil dan fotomu.');
  } catch (error) {
    analyzed = false; $('aiResult').textContent = error.message || 'Analisis gagal. Coba lagi.'; console.error(error); showToast('AI belum dapat menganalisis foto.');
  } finally { button.disabled = !selectedImage; button.textContent = '🔍 Analisis Ulang Foto'; }
}
function checkSentence(raw) {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (!text) return { ok: false, title: 'Yuk, tulis kalimat dulu!', message: 'Mulai dengan “This is a …” atau “The … is …”.' };
  let corrected = text.charAt(0).toUpperCase() + text.slice(1); if (!/[.!?]$/.test(corrected)) corrected += '.';
  const hasPattern = /^(this is|that is|these are|those are|the .+ is|i see|it is|there is|there are)\b/i.test(corrected);
  const wordCount = corrected.replace(/[.!?]/g, '').split(/\s+/).length;
  if (!hasPattern) return { ok: false, title: 'Hampir benar! 💪', message: 'Gunakan pola “This is a …” atau “The … is …”.', corrected, suggestion: 'This is a green leaf.' };
  if (wordCount < 4) return { ok: false, title: 'Tambahkan deskripsi', message: 'Tambahkan nama benda atau kata sifat.', corrected, suggestion: 'This is a green leaf.' };
  return { ok: true, title: 'Bagus! Kalimatmu punya pola yang baik 🎉', message: 'Pola dasar dan tanda baca sudah diperiksa. Pastikan isi kalimat sesuai foto.', corrected };
}
function renderSentenceResult(raw, result) {
  const panel = $('resultPanel'); panel.hidden = false;
  const photoNote = selectedImage ? 'Foto sudah dipilih.' : 'Pilih foto untuk menyelesaikan misi.';
  panel.innerHTML = `<h3>Hasil latihan</h3><div class="result-status ${result.ok ? '' : 'warn'}">${result.title}</div><p>${result.message}</p>${result.corrected ? `<div class="correction"><span class="muted">Kalimatmu:</span> ${escapeHtml(raw)}<p><span class="muted">Perbaikan kapital/tanda baca:</span><br><span class="corrected">${escapeHtml(result.corrected)}</span></p>${result.suggestion ? `<p>Contoh: <b>${escapeHtml(result.suggestion)}</b></p>` : ''}</div>` : ''}<p class="muted">${photoNote}</p><button class="btn" id="finishMission" ${completed.has(currentMission) ? 'disabled' : ''}>${completed.has(currentMission) ? 'Misi sudah selesai ✓' : 'Konfirmasi Foto & Selesaikan Misi ⭐'}</button>`;
  $('finishMission').addEventListener('click', () => finishMission(result));
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function finishMission(sentenceResult) {
  if (!selectedImage) { showToast('Pilih foto terlebih dahulu.'); return; }
  if (!analyzed) { showToast('Jalankan analisis AI terlebih dahulu.'); return; }
  if (!sentenceResult.ok) { showToast('Perbaiki kalimat terlebih dahulu.'); return; }
  if (completed.has(currentMission)) { showToast('Misi ini sudah pernah mendapatkan poin.'); return; }
  const mission = missionData[currentMission];
  const confirmation = aiMatch
    ? `AI menemukan objek yang mungkin cocok. Apakah kamu sudah memastikan foto benar-benar sesuai dengan misi “${mission.title}”?`
    : `AI tidak dapat memastikan misi ini. Apakah kamu sendiri sudah memastikan foto benar-benar sesuai dengan misi “${mission.title}”?`;
  if (!window.confirm(confirmation)) return;
  if (mission.privacy && !window.confirm('Pastikan orang yang terlihat sudah memberi izin untuk difoto. Jangan membagikan foto tanpa izin. Apakah izin sudah didapat?')) return;
  completed.add(currentMission); updateStats(); renderMissions(); renderHomeMissions();
  showToast(`Hebat! +${mission.points} poin berhasil didapat.`);
  $('finishMission').textContent = 'Misi selesai ✓'; $('finishMission').disabled = true;
}

// Teacher dashboard (local prototype; cross-device sync requires an online database).
function loadRoster() {
  try {
    const value = JSON.parse(localStorage.getItem(ROSTER_KEY) || '[]');
    return Array.isArray(value) ? value.filter(item => item && typeof item.name === 'string' && typeof item.className === 'string') : [];
  } catch (error) { console.warn('Daftar siswa tidak dapat dibaca:', error); return []; }
}
let teacherRoster = loadRoster();
function saveRoster() {
  try { localStorage.setItem(ROSTER_KEY, JSON.stringify(teacherRoster)); }
  catch (error) { showToast('Daftar siswa tidak dapat disimpan di browser ini.'); }
}
function renderTeacherDashboard() {
  if (!$('teacherStudentCount')) return;
  $('teacherStudentCount').textContent = teacherRoster.length;
  $('teacherMissionCount').textContent = `${completed.size}/${Object.keys(missionData).length}`;
  $('teacherPointCount').textContent = earned;
  $('teacherPhotoCount').textContent = photos;
  $('teacherRosterCount').textContent = `${teacherRoster.length} siswa`;
  const query = ($('studentSearch')?.value || '').trim().toLowerCase();
  const body = $('studentTableBody'); body.replaceChildren();
  const filtered = teacherRoster.filter(student => `${student.name} ${student.className}`.toLowerCase().includes(query));
  if (!filtered.length) {
    const row = document.createElement('tr'), cell = document.createElement('td');
    cell.colSpan = 4; cell.className = 'empty-row'; cell.textContent = teacherRoster.length ? 'Siswa tidak ditemukan.' : 'Belum ada siswa. Tambahkan siswa terlebih dahulu.';
    row.appendChild(cell); body.appendChild(row);
  } else {
    filtered.forEach(student => {
      const row = document.createElement('tr');
      const name = document.createElement('td'); name.textContent = student.name;
      const klass = document.createElement('td'); klass.textContent = student.className;
      const status = document.createElement('td'); status.innerHTML = '<span class="status-pending">Belum terhubung</span>';
      const action = document.createElement('td'); const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'table-action'; remove.textContent = 'Hapus';
      remove.setAttribute('aria-label', `Hapus siswa ${student.name}`);
      remove.addEventListener('click', () => {
        if (!confirm(`Hapus ${student.name} dari daftar kelas?`)) return;
        teacherRoster = teacherRoster.filter(item => item.id !== student.id); saveRoster(); renderTeacherDashboard(); showToast('Siswa dihapus dari daftar.');
      });
      action.appendChild(remove); row.append(name, klass, status, action); body.appendChild(row);
    });
  }
  const report = $('teacherMissionReport'); report.replaceChildren();
  Object.entries(missionData).forEach(([id, mission]) => {
    const row = document.createElement('div'); row.className = 'teacher-mission-row';
    const label = document.createElement('span'); label.textContent = `${mission.icon} ${mission.title}`;
    const state = document.createElement('b'); state.className = completed.has(id) ? 'mission-done' : 'mission-pending';
    state.textContent = completed.has(id) ? 'Selesai' : 'Belum selesai';
    row.append(label, state); report.appendChild(row);
  });
}
function exportTeacherCsv() {
  const rows = [['Nama siswa','Kelas','Status data','Misi selesai di perangkat ini','Total poin di perangkat ini']];
  teacherRoster.forEach(student => rows.push([student.name, student.className, 'Belum terhubung', '', '']));
  rows.push(['Pelajar pada perangkat ini','—','Data lokal', `${completed.size}/${Object.keys(missionData).length}`, String(earned)]);
  const csv = '\ufeff' + rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = 'laporan-objex-guru.csv'; link.click(); URL.revokeObjectURL(url);
}
$('addStudentForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const name = $('studentName').value.trim(), className = $('studentClass').value.trim();
  if (!name || !className) return;
  if (teacherRoster.some(student => student.name.toLowerCase() === name.toLowerCase() && student.className.toLowerCase() === className.toLowerCase())) {
    showToast('Siswa tersebut sudah ada di daftar.'); return;
  }
  teacherRoster.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name, className });
  saveRoster(); $('addStudentForm').reset(); renderTeacherDashboard(); showToast('Siswa berhasil ditambahkan.');
});
$('studentSearch')?.addEventListener('input', renderTeacherDashboard);
$('exportTeacherCsv')?.addEventListener('click', exportTeacherCsv);
$('flashcard')?.addEventListener('click', flipFlashcard);
$('flashcard')?.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flipFlashcard(); } });
$('nextFlashcard')?.addEventListener('click', () => { if (!visibleVocabulary.length) return; flashcardIndex = (flashcardIndex + 1) % visibleVocabulary.length; renderFlashcard(); });
$('vocabSearch')?.addEventListener('input', renderFlashcard);
$('practicePrompt')?.addEventListener('change', updatePracticePrompt);
$('practiceCheck')?.addEventListener('click', checkPractice);
$('profileForm')?.addEventListener('submit', event => { event.preventDefault(); const name = $('profileNameInput').value.trim(); const className = $('profileClassInput').value.trim() || 'Kelas 7'; if (!name) { showToast('Masukkan nama terlebih dahulu.'); return; } studentProfile = { name, className }; saveStudentProfile(); renderProfile(); showToast('Profil pelajar berhasil disimpan.'); });

// Navigation and controls
renderMissions(); renderHomeMissions(); renderVocabulary(); renderProfile(); renderFlashcard(); renderBadges(); updatePracticePrompt(); updateStats();
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => go(button.dataset.go)));
navLinks.forEach(button => button.addEventListener('click', () => go(button.dataset.page)));
$('galleryInput').addEventListener('change', event => loadPhoto(event.target.files[0]));
$('cameraInput').addEventListener('change', event => loadPhoto(event.target.files[0]));
$('analyzeButton').addEventListener('click', analyzePhoto);
$('description').addEventListener('input', () => { $('charCount').textContent = `${$('description').value.length}/160`; });
$('hintToggle').addEventListener('click', () => { const box = $('wordHints'); box.hidden = !box.hidden; $('hintToggle').querySelector('span').textContent = box.hidden ? '＋' : '−'; });
document.querySelectorAll('[data-word]').forEach(button => button.addEventListener('click', () => {
  const input = $('description'), word = button.dataset.word; const start = input.selectionStart, end = input.selectionEnd;
  const before = input.value.slice(0, start), after = input.value.slice(end), spacer = before && !before.endsWith(' ') ? ' ' : '';
  input.value = before + spacer + word + after; input.focus(); const cursor = (before + spacer + word).length; input.setSelectionRange(cursor, cursor); $('charCount').textContent = `${input.value.length}/160`;
}));
$('checkButton').addEventListener('click', () => renderSentenceResult($('description').value, checkSentence($('description').value)));
$('resetProgressButton')?.addEventListener('click', () => {
  if (!window.confirm('Hapus semua poin, misi selesai, dan hitungan foto dari browser ini?')) return;
  completed = new Set(); photos = 0; practiceCount = 0; try { localStorage.removeItem(PRACTICE_KEY); } catch {} updateStats(); renderMissions(); renderHomeMissions(); renderBadges(); showToast('Progres Objex berhasil direset pada browser ini.');
});
loadAIModel();

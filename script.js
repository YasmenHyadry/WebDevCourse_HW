//-------------------------------------------------------------
// GLOBALS
//-------------------------------------------------------------
let songs = [];
let editMode = false;
let editId = null;

const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const cardView = document.getElementById('cardView');
const tableView = document.getElementById('tableView');
const submitBtn = document.getElementById('submitBtn');
const searchInput = document.getElementById('search');
const toggleViewBtn = document.getElementById('toggleView');
const playerFrame = document.getElementById('playerFrame');

let viewMode = "table";

//-------------------------------------------------------------
// LOAD SONGS FROM STORAGE
//-------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    songs = JSON.parse(localStorage.getItem('songs') || "[]");
    renderSongs();
});

//-------------------------------------------------------------
// EXTRACT YOUTUBE ID
//-------------------------------------------------------------
function extractID(url) {
    if (url.includes("youtu.be/"))
        return url.split("youtu.be/")[1].split("?")[0];

    if (url.includes("/shorts/"))
        return url.split("/shorts/")[1].split("?")[0];

    const m = url.match(/v=([^&]+)/);
    if (m) return m[1];

    return url;
}

//-------------------------------------------------------------
// ADD / UPDATE SONG
//-------------------------------------------------------------
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const rating = Number(document.getElementById('rating').value);

    const youtubeId = extractID(url);
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;

    const song = {
        id: editMode ? editId : Date.now(),
        title,
        url,
        youtubeId,
        thumbnail,
        rating,
        dateAdded: Date.now()
    };

    if (editMode) {
        songs = songs.map(s => (s.id === editId ? song : s));
    } else {
        songs.push(song);
    }

    editMode = false;
    editId = null;

    submitBtn.innerHTML = "+ Add";
    submitBtn.classList.replace('btn-warning', 'btn-success');

    saveAndRender();
    form.reset();
});

//-------------------------------------------------------------
// SAVE + RENDER
//-------------------------------------------------------------
function saveAndRender() {
    localStorage.setItem("songs", JSON.stringify(songs));
    renderSongs();
}

//-------------------------------------------------------------
// RENDER SONGS
//-------------------------------------------------------------
function renderSongs() {

    const searchTerm = searchInput.value.toLowerCase();
    let filtered = songs.filter(s => s.title.toLowerCase().includes(searchTerm));

    const sortOption = document.querySelector('input[name="sortOption"]:checked').value;

    if (sortOption === "name")
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === "rating")
        filtered.sort((a, b) => b.rating - a.rating);
    else
        filtered.sort((a, b) => b.dateAdded - a.dateAdded);

    list.innerHTML = "";
    cardView.innerHTML = "";

    filtered.forEach(song => {

        // TABLE ROW
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="align-middle d-flex align-items-center gap-3">
                <img src="${song.thumbnail}" class="thumbnail">
                <span>${song.title}</span>
            </td>

            <td class="align-middle">${song.rating}</td>

            <td class="align-middle">
                <a href="#" onclick="openPlayer('${song.youtubeId}')" class="text-info fw-bold">Watch</a>
            </td>

            <td class="text-end align-middle">
                <button class="btn btn-warning btn-sm me-2" onclick="editSong(${song.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteSong(${song.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        list.appendChild(tr);

        // CARD VIEW
        const card = document.createElement("div");
        card.innerHTML = `
            <div class="card">
                <img src="${song.thumbnail}">
                <div class="card-body text-center">
                    <h5>${song.title}</h5>
                    <p>Rating: ${song.rating}/10</p>

                    <button class="btn btn-primary w-100 mb-2" onclick="openPlayer('${song.youtubeId}')">▶ Play</button>
                    <button class="btn btn-warning w-100 mb-2" onclick="editSong(${song.id})">✏ Edit</button>
                    <button class="btn btn-danger w-100" onclick="deleteSong(${song.id})">🗑 Delete</button>
                </div>
            </div>
        `;
        cardView.appendChild(card);
    });

    toggleDisplay();
}

//-------------------------------------------------------------
// EDIT SONG
//-------------------------------------------------------------
function editSong(id) {
    const s = songs.find(x => x.id === id);

    document.getElementById('title').value = s.title;
    document.getElementById('url').value = s.url;
    document.getElementById('rating').value = s.rating;

    editMode = true;
    editId = id;

    submitBtn.innerHTML = "Update";
    submitBtn.classList.replace('btn-success', 'btn-warning');
}

//-------------------------------------------------------------
// DELETE SONG
//-------------------------------------------------------------
function deleteSong(id) {
    if (!confirm("Delete this song?")) return;
    songs = songs.filter(s => s.id !== id);
    saveAndRender();
}

//-------------------------------------------------------------
// OPEN PLAYER (MODAL)
//-------------------------------------------------------------
function openPlayer(id) {
    playerFrame.src = `https://www.youtube.com/embed/${id}`;
    new bootstrap.Modal(document.getElementById('videoModal')).show();
}

//-------------------------------------------------------------
// TOGGLE VIEW
//-------------------------------------------------------------
toggleViewBtn.addEventListener('click', () => {
    viewMode = viewMode === "table" ? "cards" : "table";
    toggleViewBtn.innerHTML =
        viewMode === "table"
            ? `<i class="fa-solid fa-table-cells-large"></i>`
            : `<i class="fa-solid fa-list"></i>`;
    renderSongs();
});

function toggleDisplay() {
    tableView.style.display = viewMode === "table" ? "table" : "none";
    cardView.style.display = viewMode === "cards" ? "grid" : "none";
}

//-------------------------------------------------------------
// SEARCH + SORT
//-------------------------------------------------------------
searchInput.addEventListener('input', renderSongs);
document.querySelectorAll('input[name="sortOption"]').forEach(radio =>
    radio.addEventListener('change', renderSongs)
);

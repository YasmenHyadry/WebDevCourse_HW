//-------------------------------------------------------------
// GLOBALS
//-------------------------------------------------------------
let songs = [];
let editMode = false;
let editId = null;

//-------------------------------------------------------------
// DOM
//-------------------------------------------------------------
const form = document.getElementById("songForm");
const list = document.getElementById("songList");
const searchInput = document.getElementById("search");
const submitBtn = document.getElementById("submitBtn");
const playerFrame = document.getElementById("playerFrame");

//-------------------------------------------------------------
// LOAD FROM STORAGE
//-------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem("songs");
    songs = stored ? JSON.parse(stored) : [];
    renderSongs();
});

//-------------------------------------------------------------
// ADD / UPDATE SONG
//-------------------------------------------------------------
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const rating = Number(document.getElementById("rating").value);

    const youtubeId = extractID(url);
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;

    const songData = {
        id: editMode ? editId : Date.now(),
        title,
        url,
        youtubeId,
        thumbnail,
        rating,
        dateAdded: Date.now()
    };

    if (editMode) {
        songs = songs.map(s => s.id === editId ? songData : s);
    } else {
        songs.push(songData);
    }

    editMode = false;
    submitBtn.innerText = "+ Add";

    saveAndRender();
    form.reset();
});

//-------------------------------------------------------------
// EXTRACT YOUTUBE ID
//-------------------------------------------------------------
function extractID(url) {
    if (url.includes("youtu.be/"))
        return url.split("youtu.be/")[1].split("?")[0];

    if (url.includes("/shorts/"))
        return url.split("/shorts/")[1].split("?")[0];

    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : url;
}

//-------------------------------------------------------------
// RENDER TABLE
//-------------------------------------------------------------
function renderSongs() {
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = songs.filter(s =>
        s.title.toLowerCase().includes(searchTerm)
    );

    const sortOption = document.querySelector('input[name="sortOption"]:checked').value;

    if (sortOption === "name")
        filtered.sort((a, b) => a.title.localeCompare(b.title));

    else if (sortOption === "rating")
        filtered.sort((a, b) => b.rating - a.rating);

    else
        filtered.sort((a, b) => b.dateAdded - a.dateAdded);

    list.innerHTML = "";

    filtered.forEach(song => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><img src="${song.thumbnail}" class="thumbnail"></td>
            <td>${song.title}</td>
            <td>${song.rating}</td>

            <td>
                <a href="#" class="text-info fw-bold"
                   onclick="openPlayer('${song.youtubeId}')">
                   Watch
                </a>
            </td>

            <td class="text-end">
                <button class="btn btn-warning btn-sm" onclick="editSong(${song.id})">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteSong(${song.id})">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;

        list.appendChild(row);
    });
}

//-------------------------------------------------------------
// SAVE + RERENDER
//-------------------------------------------------------------
function saveAndRender() {
    localStorage.setItem("songs", JSON.stringify(songs));
    renderSongs();
}

//-------------------------------------------------------------
// EDIT SONG
//-------------------------------------------------------------
function editSong(id) {
    const song = songs.find(s => s.id === id);

    document.getElementById("title").value = song.title;
    document.getElementById("url").value = song.url;
    document.getElementById("rating").value = song.rating;

    editMode = true;
    editId = id;

    submitBtn.innerText = "Update";
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
// OPEN VIDEO PLAYER
//-------------------------------------------------------------
function openPlayer(id) {
    playerFrame.src = `https://www.youtube.com/embed/${id}`;
    const modal = new bootstrap.Modal(document.getElementById("videoModal"));
    modal.show();
}

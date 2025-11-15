let skins = ["basic.css", "modern.css", "dark.css"];
let index = 0;

function changeSkin() {
    index = (index + 1) % skins.length; 
    document.getElementById("skin").href = skins[index];
}

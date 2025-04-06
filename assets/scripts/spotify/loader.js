let devMode = false;
let updateProgressInterval = null;

async function init() {
    if (updateProgressInterval) {
        clearInterval(updateProgressInterval);
    }
    const e_title = document.getElementById("sp_title");
    const e_artist = document.getElementById("sp_artist");
    const e_button = document.getElementById("sp_button");
    const e_button_link = document.getElementById("sp_button_link");
    const e_progress = document.getElementById("sp_progress");
    const e_cover = document.getElementById("sp_cover");
    const e_album = document.getElementById("sp_album");
    const e_features = document.getElementById("sp_features");

    const song = await getSong();

    const title = song.item.name;
    const artist = song.item.artists[0].name;
    const album = song.item.album.name;
    const albumArt = song.item.album.images[2].url;
    const link = song.item.external_urls.spotify;
    const duration = song.item.duration_ms;
    let progress = song.progress_ms;
    const features = song.item.artists.splice(1) || ['-'];

    e_title.innerHTML = title;
    e_artist.innerHTML = artist
    e_cover.innerHTML = `<img src=${albumArt} alt="${artist} - ${title}" style="width: 100%; height: 100%;">`;
    e_album.innerHTML = album;
    e_button.disabled = false;
    e_button_link.href = link;
    e_features.innerHTML = features.map(artist => `<span>${artist.name}</span>`).join(', ');
    e_progress.style = `width: ${progress / duration * 100}%`;
   
    if (song.is_playing) {
        updateProgressInterval = setInterval(() => {
            if (progress >= duration) {
                clearInterval(updateProgressInterval);
                setTimeout(() => {
                    init();
                }, 1000);
                return;
            }
            progress += 1000;
            e_progress.style = `width: ${progress / duration * 100}%`;
        }
        , 1000);
    }
}

async function getSong() {
    if (devMode) {
        const response = await fetch('./assets/scripts/spotify/mock.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;

    }
    const song = await fetch('https://walter.eze.net.ar/raw', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());
    if (!song) {
        throw new Error('No song found');
    }
    return song;

}
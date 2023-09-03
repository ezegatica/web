// when clicking any image, open it in a new page
// (useful for images that are too big for the screen)

document.addEventListener('click', function (e) {
    if (e.target.tagName === 'IMG') {
        window.open(e.target.src, '_blank');
    }
}, false);
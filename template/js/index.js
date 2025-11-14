const body = document.querySelector('body');
// this is for loading at refresh
document.addEventListener('DOMContentLoaded', function () {
    const theme = sessionStorage.getItem('theme');
    if (theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.add('light');
    }

// toc head
    const toc=document.getElementsByClassName('table-of-contents')[0];

    const newTOC = document.createElement("h3");
    newTOC.textContent = "Contents";
    newTOC.classList.add("table-of-contents-header");
    toc.before(newTOC);
    newTOC.onclick = handleTocToggle();
    // not including () here was causing twice click issue

});
// for toggle

function handleDarkModeToggle() {
    if (body.classList.contains('dark')) {
        body.classList.remove('dark');
        body.classList.add('light');
        sessionStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light');
        body.classList.add('dark');
        sessionStorage.setItem('theme', 'dark');
    }
}

function handleTocToggle() {
    const tocHeader = document.querySelector('.table-of-contents-header');
    const toc = document.querySelector('.table-of-contents');

    tocHeader.addEventListener('click', () => {
        toc.classList.toggle('hidden');
    });
}
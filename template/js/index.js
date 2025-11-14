const body = document.querySelector('body');

document.addEventListener('DOMContentLoaded', function () {
    const theme = sessionStorage.getItem('theme');
    if (theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.add('light');
    }
});

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

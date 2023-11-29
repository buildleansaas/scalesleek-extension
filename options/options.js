document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const viewType = params.get('type');
    const youtubeView = document.getElementById('youtube-view');
    const vidiqView = document.getElementById('vidiq-view');
    const youtubeTab = document.getElementById('youtubeTab');
    const vidiqTab = document.getElementById('vidiqTab');

    function showView(view) {
        youtubeView.style.display = view === 'youtube' ? 'block' : 'none';
        vidiqView.style.display = view === 'vidiq' ? 'block' : 'none';

        youtubeTab.classList.toggle('active', view === 'youtube');
        vidiqTab.classList.toggle('active', view === 'vidiq');
    }

    youtubeTab.addEventListener('click', () => showView('youtube'));
    vidiqTab.addEventListener('click', () => showView('vidiq'));

    // Set initial view based on query parameter
    if (viewType === 'youtube' || viewType === 'vidiq') {
        showView(viewType);
    } else {
        // Default to YouTube view if the type parameter is missing or invalid
        showView('youtube');
    }
});

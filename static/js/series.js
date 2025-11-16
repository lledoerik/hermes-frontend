// Series Page JavaScript

const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function() {
    loadSeries();
    updateModeSubtitle();
});

// Update mode subtitle
function updateModeSubtitle() {
    const viewMode = window.HermesApp.getViewMode();
    const subtitle = document.getElementById('modeSubtitle');
    
    const modeLabels = {
        'normal': 'Mode Normal',
        'mixed': 'Mode Mixt (Normal + Anime)',
        'anime': 'Mode Anime'
    };
    
    if (subtitle) {
        subtitle.textContent = modeLabels[viewMode] || 'Mode Normal';
    }
}

// Load series from API
async function loadSeries() {
    const loadingState = document.getElementById('loadingState');
    const seriesGrid = document.getElementById('seriesGrid');
    const emptyState = document.getElementById('emptyState');
    const viewMode = window.HermesApp.getViewMode();

    try {
        loadingState.style.display = 'flex';
        seriesGrid.style.display = 'none';
        emptyState.style.display = 'none';

        // Fetch series from API based on view mode
        const endpoints = getSeriesEndpoints(viewMode);
        const series = await fetchSeriesFromEndpoints(endpoints);

        if (series.length === 0) {
            loadingState.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        // Display series
        displaySeries(series);
        
        loadingState.style.display = 'none';
        seriesGrid.style.display = 'grid';

    } catch (error) {
        console.error('Error loading series:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

// Get series endpoints based on view mode
function getSeriesEndpoints(viewMode) {
    switch(viewMode) {
        case 'normal':
            return [`${API_URL}/api/library/series`];
        case 'anime':
            return [`${API_URL}/api/library/series?type=anime`];
        case 'mixed':
            return [
                `${API_URL}/api/library/series`,
                `${API_URL}/api/library/series?type=anime`
            ];
        default:
            return [`${API_URL}/api/library/series`];
    }
}

// Fetch series from multiple endpoints
async function fetchSeriesFromEndpoints(endpoints) {
    try {
        const responses = await Promise.all(
            endpoints.map(endpoint => 
                fetch(endpoint)
                    .then(res => res.ok ? res.json() : [])
                    .catch(() => [])
            )
        );
        
        // Flatten and combine results
        return responses.flat();
    } catch (error) {
        console.error('Error fetching series:', error);
        
        // Return mock data for demonstration if API fails
        return getMockSeries(window.HermesApp.getViewMode());
    }
}

// Display series in grid
function displaySeries(series) {
    const grid = document.getElementById('seriesGrid');
    grid.innerHTML = '';

    series.forEach(show => {
        const card = createSeriesCard(show);
        grid.appendChild(card);
    });
}

// Create series card element
function createSeriesCard(show) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.onclick = () => viewSeriesDetail(show.id);

    const isAnime = show.type === 'anime';
    const progress = getSeriesProgress(show.id);

    card.innerHTML = `
        <div class="media-poster">
            ${show.poster ? 
                `<img src="${API_URL}/api/image/poster/${show.id}" alt="${show.name}">` :
                `<div class="poster-placeholder">
                    <div class="placeholder-icon">${isAnime ? '🎌' : '📺'}</div>
                    <div class="placeholder-title">${show.name}</div>
                </div>`
            }
            
            ${isAnime ? '<div class="type-badge">Anime</div>' : ''}
            
            ${show.quality ? `<div class="quality-badge">${show.quality}</div>` : ''}
            
            <div class="play-overlay">
                <button class="play-button">
                    <div class="play-icon"></div>
                </button>
            </div>

            ${progress > 0 ? `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            ` : ''}
        </div>

        <div class="media-info">
            <h3 class="media-title">${show.name}</h3>
            <div class="media-meta">
                ${show.seasons ? `<span class="media-year">${show.seasons} temporades</span>` : ''}
                ${show.seasons && show.episode_count ? '<span class="meta-separator">•</span>' : ''}
                ${show.episode_count ? `<span>${show.episode_count} episodis</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

// Get series progress from localStorage
function getSeriesProgress(seriesId) {
    const progress = localStorage.getItem(`series_progress_${seriesId}`);
    if (progress) {
        const data = JSON.parse(progress);
        return data.percentage || 0;
    }
    return 0;
}

// View series detail
function viewSeriesDetail(seriesId) {
    window.location.href = `series-detail.html?id=${seriesId}`;
}

// Mock data for demonstration
function getMockSeries(viewMode) {
    const normalSeries = [
        { id: 1, name: 'Breaking Bad', type: 'normal', seasons: 5, episode_count: 62, quality: 'FHD' },
        { id: 2, name: 'Stranger Things', type: 'normal', seasons: 4, episode_count: 34, quality: '4K' },
        { id: 3, name: 'The Crown', type: 'normal', seasons: 6, episode_count: 60, quality: '4K' },
        { id: 4, name: 'Game of Thrones', type: 'normal', seasons: 8, episode_count: 73, quality: 'FHD' },
    ];

    const animeSeries = [
        { id: 5, name: 'Attack on Titan', type: 'anime', seasons: 4, episode_count: 87, quality: 'FHD' },
        { id: 6, name: 'Death Note', type: 'anime', seasons: 1, episode_count: 37, quality: 'FHD' },
        { id: 7, name: 'Fullmetal Alchemist', type: 'anime', seasons: 1, episode_count: 64, quality: 'HD' },
        { id: 8, name: 'One Punch Man', type: 'anime', seasons: 2, episode_count: 24, quality: 'FHD' },
    ];

    switch(viewMode) {
        case 'normal':
            return normalSeries;
        case 'anime':
            return animeSeries;
        case 'mixed':
            return [...normalSeries, ...animeSeries];
        default:
            return normalSeries;
    }
}
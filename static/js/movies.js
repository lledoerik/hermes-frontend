// Movies Page JavaScript

const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function() {
    loadMovies();
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

// Load movies from API
async function loadMovies() {
    const loadingState = document.getElementById('loadingState');
    const moviesGrid = document.getElementById('moviesGrid');
    const emptyState = document.getElementById('emptyState');
    const viewMode = window.HermesApp.getViewMode();

    try {
        loadingState.style.display = 'flex';
        moviesGrid.style.display = 'none';
        emptyState.style.display = 'none';

        // Fetch movies from API based on view mode
        const endpoints = getMovieEndpoints(viewMode);
        const movies = await fetchMoviesFromEndpoints(endpoints);

        if (movies.length === 0) {
            loadingState.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        // Display movies
        displayMovies(movies);
        
        loadingState.style.display = 'none';
        moviesGrid.style.display = 'grid';

    } catch (error) {
        console.error('Error loading movies:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

// Get movie endpoints based on view mode
function getMovieEndpoints(viewMode) {
    switch(viewMode) {
        case 'normal':
            return [`${API_URL}/api/movies`];
        case 'anime':
            return [`${API_URL}/api/movies?type=anime`];
        case 'mixed':
            return [
                `${API_URL}/api/movies`,
                `${API_URL}/api/movies?type=anime`
            ];
        default:
            return [`${API_URL}/api/movies`];
    }
}

// Fetch movies from multiple endpoints
async function fetchMoviesFromEndpoints(endpoints) {
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
        console.error('Error fetching movies:', error);
        
        // Return mock data for demonstration if API fails
        return getMockMovies(window.HermesApp.getViewMode());
    }
}

// Display movies in grid
function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';

    movies.forEach(movie => {
        const card = createMovieCard(movie);
        grid.appendChild(card);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.onclick = () => playMovie(movie.id);

    const isAnime = movie.type === 'anime';
    const progress = getMovieProgress(movie.id);

    card.innerHTML = `
        <div class="media-poster">
            ${movie.poster ? 
                `<img src="${API_URL}/api/image/poster/${movie.id}" alt="${movie.title}">` :
                `<div class="poster-placeholder">
                    <div class="placeholder-icon">${isAnime ? '🎌' : '🎬'}</div>
                    <div class="placeholder-title">${movie.title}</div>
                </div>`
            }
            
            ${isAnime ? '<div class="type-badge">Anime</div>' : ''}
            
            ${movie.quality ? `<div class="quality-badge">${movie.quality}</div>` : ''}
            
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
            <h3 class="media-title">${movie.title}</h3>
            <div class="media-meta">
                ${movie.year ? `<span class="media-year">${movie.year}</span>` : ''}
                ${movie.year && movie.duration ? '<span class="meta-separator">•</span>' : ''}
                ${movie.duration ? `<span>${formatDuration(movie.duration)}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

// Get movie progress from localStorage
function getMovieProgress(movieId) {
    const progress = localStorage.getItem(`progress_${movieId}`);
    if (progress) {
        const data = JSON.parse(progress);
        if (data.completed) return 100;
        if (data.time && data.duration) {
            return Math.min(100, (data.time / data.duration) * 100);
        }
    }
    return 0;
}

// Format duration
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Play movie
function playMovie(movieId) {
    window.location.href = `player.html?id=${movieId}&type=movie`;
}

// Mock data for demonstration
function getMockMovies(viewMode) {
    const normalMovies = [
        { id: 1, title: 'La Princesa Promesa', type: 'normal', year: 1987, duration: 5880, quality: 'HD' },
        { id: 2, title: 'El Cigne Negre', type: 'normal', year: 2010, duration: 6480, quality: 'FHD' },
        { id: 3, title: 'Inception', type: 'normal', year: 2010, duration: 8880, quality: '4K' },
        { id: 4, title: 'Interstellar', type: 'normal', year: 2014, duration: 10140, quality: '4K' },
    ];

    const animeMovies = [
        { id: 5, title: 'Kimi No Na Wa', type: 'anime', year: 2016, duration: 6360, quality: 'FHD' },
        { id: 6, title: 'La Princesa Mononoke', type: 'anime', year: 1997, duration: 8100, quality: 'HD' },
        { id: 7, title: 'Spirited Away', type: 'anime', year: 2001, duration: 7500, quality: 'FHD' },
        { id: 8, title: 'Akira', type: 'anime', year: 1988, duration: 7440, quality: '4K' },
    ];

    switch(viewMode) {
        case 'normal':
            return normalMovies;
        case 'anime':
            return animeMovies;
        case 'mixed':
            return [...normalMovies, ...animeMovies];
        default:
            return normalMovies;
    }
}
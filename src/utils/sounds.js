// Sound effects from https://freesound.org/ (Creative Commons License)
export const SOUNDS = {
    meow: {
        url: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
        name: 'Meow',
        duration: 1000,
        category: 'Animal'
    },
    pop: {
        url: 'https://cdn.freesound.org/previews/156/156031_2703579-lq.mp3',
        name: 'Pop',
        duration: 300,
        category: 'Effect'
    },
    bell: {
        url: 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3',
        name: 'Bell Ring',
        duration: 1500,
        category: 'Effect'
    },
    drum: {
        url: 'https://cdn.freesound.org/previews/156/156563_2703579-lq.mp3',
        name: 'Drum Beat',
        duration: 500,
        category: 'Music'
    },
    piano: {
        url: 'https://cdn.freesound.org/previews/415/415096_5121236-lq.mp3',
        name: 'Piano Note',
        duration: 1000,
        category: 'Music'
    },
    laugh: {
        url: 'https://cdn.freesound.org/previews/415/415218_5121236-lq.mp3',
        name: 'Laugh',
        duration: 2000,
        category: 'Human'
    }
};

// Audio context for volume control
let audioContext = null;
let gainNode = null;

// Function to ensure audio context is initialized and resumed
export const initAudio = () => {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            console.log('Audio context initialized:', audioContext.state);
        } catch (error) {
            console.error('Failed to create audio context:', error);
            return null;
        }
    }

    // Resume audio context if it's in suspended state
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('Audio context resumed successfully');
        }).catch(error => {
            console.error('Failed to resume audio context:', error);
        });
    }

    return { audioContext, gainNode };
};

// Cache for loaded audio buffers
const audioBufferCache = new Map();

// Function to load and cache audio buffer
const loadAudioBuffer = async (url) => {
    if (audioBufferCache.has(url)) {
        return audioBufferCache.get(url);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (!audioContext) {
            const audio = initAudio();
            if (!audio) throw new Error('Failed to initialize audio context');
        }
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferCache.set(url, audioBuffer);
        return audioBuffer;
    } catch (error) {
        console.error('Error loading sound:', error, 'URL:', url);
        return null;
    }
};

export const playSound = async (soundId, volume = 1) => {
    console.log('Attempting to play sound:', soundId, 'with volume:', volume);
    
    const sound = SOUNDS[soundId];
    if (!sound) {
        console.error('Sound not found:', soundId);
        return;
    }

    // Initialize audio context if needed
    if (!audioContext || audioContext.state === 'closed') {
        const audio = initAudio();
        if (!audio) {
            console.error('Failed to initialize audio context');
            return;
        }
    }

    // Ensure audio context is running
    if (audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
            console.log('Audio context resumed');
        } catch (error) {
            console.error('Failed to resume audio context:', error);
            return;
        }
    }

    try {
        // Load and cache the audio buffer
        const audioBuffer = await loadAudioBuffer(sound.url);
        if (!audioBuffer) {
            console.error('Failed to load audio buffer for sound:', soundId);
            return;
        }

        // Create and configure source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Set volume
        gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
        source.connect(gainNode);
        
        // Start playing
        source.start(0);
        console.log('Sound started playing:', soundId);
        
        // Stop the sound after its duration
        setTimeout(() => {
            try {
                source.stop();
                console.log('Sound stopped:', soundId);
            } catch (error) {
                // Ignore errors when stopping already stopped sources
            }
        }, sound.duration);
        
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}; 
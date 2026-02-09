import { v4 as uuidv4 } from 'uuid';

export const moves = [
    // Motion moves
    {
        id: uuidv4(),
        todo: 'Move 50 steps',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'Move -50 steps',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'Move up 50 steps',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'Move down 50 steps',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'turn 45 degrees',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'turn 90 degrees',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'turn 135 degrees',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'turn 180 degrees',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'turn 360 degrees',
        category: 'Motion',
        color: '#4C97FF'
    },
    {
        id: uuidv4(),
        todo: 'Go to coordinates',
        category: 'Motion',
        color: '#4C97FF'
    },

    // Looks moves
    {
        id: uuidv4(),
        todo: 'Say Hello for 5 sec',
        category: 'Looks',
        color: '#9966FF'
    },
    {
        id: uuidv4(),
        todo: 'Think Hmmm for 3 sec',
        category: 'Looks',
        color: '#9966FF'
    },
    {
        id: uuidv4(),
        todo: 'Say Bye',
        category: 'Looks',
        color: '#9966FF'
    },
    {
        id: uuidv4(),
        todo: 'Say Hii',
        category: 'Looks',
        color: '#9966FF'
    },
    {
        id: uuidv4(),
        todo: 'Think See you',
        category: 'Looks',
        color: '#9966FF'
    },
    {
        id: uuidv4(),
        todo: 'show',
        category: 'Looks',
        color: '#9966FF'
    },
    {
        id: uuidv4(),
        todo: 'hide',
        category: 'Looks',
        color: '#9966FF'
    },

    // Sound moves
    {
        id: uuidv4(),
        todo: 'Play Meow Sound',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Play Pop Sound',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Play Bell Sound',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Play Drum Beat',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Play Piano Note',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Play Laugh Sound',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Increase Volume',
        category: 'Sound',
        color: '#CF63CF'
    },
    {
        id: uuidv4(),
        todo: 'Decrease Volume',
        category: 'Sound',
        color: '#CF63CF'
    },

    // Control moves
    {
        id: uuidv4(),
        todo: 'repeat',
        category: 'Control',
        color: '#FFAB19'
    },
    {
        id: uuidv4(),
        todo: 'Wait 1 second',
        category: 'Control',
        color: '#FFAB19'
    },
    {
        id: uuidv4(),
        todo: 'Stop all',
        category: 'Control',
        color: '#FFAB19'
    },

    // Events moves
    {
        id: uuidv4(),
        todo: 'When green flag clicked',
        category: 'Events',
        color: '#FFD500'
    },
    {
        id: uuidv4(),
        todo: 'When sprite clicked',
        category: 'Events',
        color: '#FFD500'
    },
    {
        id: uuidv4(),
        todo: 'Broadcast message',
        category: 'Events',
        color: '#FFD500'
    },

    // Sensing moves
    {
        id: uuidv4(),
        todo: 'Touching sprite?',
        category: 'Sensing',
        color: '#5CB1D6'
    },
    {
        id: uuidv4(),
        todo: 'Touching edge?',
        category: 'Sensing',
        color: '#5CB1D6'
    },
    {
        id: uuidv4(),
        todo: 'Sprite position report',
        category: 'Sensing',
        color: '#5CB1D6'
    },

    // Operators moves
    {
        id: uuidv4(),
        todo: 'Pick random 1 to 10',
        category: 'Operators',
        color: '#59C059'
    },
    {
        id: uuidv4(),
        todo: 'Add 5 + 10',
        category: 'Operators',
        color: '#59C059'
    },
    {
        id: uuidv4(),
        todo: 'Is score > 10?',
        category: 'Operators',
        color: '#59C059'
    },

    // Variables moves
    {
        id: uuidv4(),
        todo: 'Set score to 0',
        category: 'Variables',
        color: '#FF8C1A'
    },
    {
        id: uuidv4(),
        todo: 'Change score by 1',
        category: 'Variables',
        color: '#FF8C1A'
    },
    {
        id: uuidv4(),
        todo: 'Change score by -1',
        category: 'Variables',
        color: '#FF8C1A'
    },

    // My Blocks moves
    {
        id: uuidv4(),
        todo: 'Custom spin',
        category: 'My Blocks',
        color: '#FF6680'
    },
    {
        id: uuidv4(),
        todo: 'Custom bounce',
        category: 'My Blocks',
        color: '#FF6680'
    }
];

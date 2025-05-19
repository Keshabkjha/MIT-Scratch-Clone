# MIT Scratch Clone

A modern web-based implementation of MIT's Scratch programming environment, designed to make programming more accessible and engaging through visual block-based coding.

## 🎯 Project Overview

This project is a clone of MIT's Scratch programming environment, reimagined with modern web technologies. It provides a visual programming interface where users can create interactive stories, games, and animations by dragging and dropping code blocks.

## Video presentation

[Video presentation](https://drive.google.com/file/d/1yXdp5MaNA3PSJwie4YRWN4acRwVjkic_/view?usp=sharing)
### Why This Project?

- **Educational Impact**: Makes programming concepts more accessible to beginners through visual block-based coding
- **Interactive Learning**: Provides a hands-on approach to learning programming fundamentals
- **Modern Implementation**: Built with current web technologies for better performance and user experience
- **Open Source**: Contributes to the educational technology community

## 🛠️ Technology Stack

- **Frontend Framework**: React.js
- **UI Components**: Material-UI (@mui/material)
- **Drag and Drop**: react-beautiful-dnd
- **Styling**: 
  - Styled Components
  - Tailwind CSS
  - Emotion
- **Icons**: React Icons
- **Build Tools**: Webpack
- **Development**: React Scripts

## 📁 Project Structure

```
src/
├── Assets/         # Static assets and images
├── Components/     # React components
│   ├── eventBody.jsx           # Main workspace component
│   ├── ActionHistoryFooter.jsx # Action history display
│   ├── LibraryModal.jsx        # Block library interface
│   ├── CategorySidebar.jsx     # Category navigation
│   └── ...
├── data/          # Data files and constants
├── styles/        # Global styles and CSS
└── utils/         # Utility functions
```

## 🚀 Features

1. **Block-Based Programming**
   - Drag and drop interface for code blocks
   - Visual representation of programming concepts
   - Intuitive block snapping and alignment
   - Multiple action areas for different code sequences
   - Real-time code execution

2. **Sprite Management**
   - Multiple sprite support (up to 2 sprites)
   - Built-in sprite library with popular characters
   - Custom sprite upload capability
   - Sprite visibility controls (show/hide)
   - Sprite deletion functionality

3. **Motion Controls**
   - Move up/down/left/right
   - Rotate sprites
   - Scale sprites (grow/shrink)
   - Move to specific coordinates
   - Random position movement

4. **Visual Effects**
   - Sprite animations
   - Collision detection with visual feedback
   - Alignment guides for precise positioning
   - Visual effects on sprite interactions
   - Smooth transitions and animations

5. **Backdrop Management**
   - Multiple backdrop options
   - Custom backdrop upload
   - Backdrop deletion
   - Pre-loaded scenic backgrounds
   - Easy backdrop switching

6. **Interactive Features**
   - Sprite collision detection
   - Sprite swapping animations
   - Action history tracking
   - Play/pause functionality
   - Action replay system

7. **User Interface**
   - Modern, responsive design
   - Category-based block organization
   - Intuitive navigation and controls
   - Toast notifications for user feedback
   - Drag and drop interface

8. **Development Tools**
   - Hot reloading for development
   - Production build optimization
   - Testing setup with Jest
   - Error handling and validation
   - Performance optimizations

9. **Additional Features**
   - Sound effects on actions
   - Volume control
   - Action queue management
   - Sprite state management
   - Responsive layout

## 🏁 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Keshabkjha/MIT-Scratch-Clone.git
   cd MIT-Scratch-Clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## 🌐 Live Demo

The project is deployed and can be accessed at: [MIT Scratch Clone Demo](https://mit-scratch-clone-keshab-kumars-projects.vercel.app/)

## 🎨 Implementation Details

The project implements a drag-and-drop interface where users can:
- Select code blocks from a categorized library
- Drag blocks to create sequences of actions
- Execute code blocks in real-time
- Save and load projects
- View action history

The implementation uses React's state management for handling block positions and sequences, while react-beautiful-dnd provides smooth drag-and-drop functionality.

## 📊 Project Statistics

- **Languages Used**:
  - JavaScript: 90.1%
  - CSS: 8.7%
  - HTML: 1.2%

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by MIT's Scratch project
- Built with modern web technologies
- Community-driven development
- Special thanks to all contributors and supporters

## 📞 Contact

For any queries or suggestions, please feel free to reach out through GitHub issues or create a pull request.

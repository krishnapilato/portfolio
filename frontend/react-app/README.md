# Interactive Developer Portfolio

An interactive personal developer portfolio built with React, Three.js, and modern web animation tools. The application features interactive 3D scenes, smooth custom scrolling, complex animations, and responsive web design.

## Key Features

- **Interactive 3D Experience**: Powered by React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
- **Smooth Scrolling**: Implemented using `lenis` for a fluid, natural scroll feel.
- **Complex UI Animations**: Built with `framer-motion` and `@use-gesture/react` for elegant reveals, magnetic buttons, and custom interactive cursors.
- **Modern Styling**: Styled with Tailwind CSS v4 and `clsx` / `class-variance-authority` (CVA) for scalable class construction.
- **State Management**: Lightweight robust global state handling via Zustand (`zustand`).
- **Performance Optimized**: Built on Vite with React 19.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/), React Three Postprocessing
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Scroll & Movement**: [Lenis](https://lenis.studiofreight.com/), React Use Gesture
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

## Project Structure

```text
src/
├── assets/          # Static assets (images, fonts, 3D models)
├── components/      # Reusable UI components
│   ├── layout/      # Navbar, Footers, Page containers
│   └── ui/          # Micro-components (Buttons, Cursor, Toast, Reveal)
├── data/            # Static JSON content for the portfolio
├── hooks/           # Custom React Hooks (Lenis, MousePosition, Observer)
├── lib/             # Utility functions (Tailwind merge, motion variants)
├── scenes/          # 3D R3F Scenes (Hero, Skills)
├── sections/        # Main landing page sections (About, Projects, Experience, Contact)
└── store/           # Zustand global state management
```

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v24+ recommended) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd portfolio/frontend/react-app
   ```

2. Install the dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev -- --host
   ```

4. Open your browser and visit `http://localhost:5173` to view the application.

## Building for Production

To create a production-ready build:

```bash
npm run build
```

You can then preview the built project locally:

```bash
npm run preview
```

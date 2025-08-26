# Block Blast Game

## Overview

This is a modern Block Blast puzzle game built with React, TypeScript, and Express. The game features a 10x10 grid where players place Tetris-like block pieces to clear lines and score points. The project implements a full-stack architecture with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern React 18 application using functional components and hooks
- **Vite Build System**: Fast development server with Hot Module Replacement (HMR) for optimal developer experience
- **State Management**: Zustand for lightweight, type-safe state management across game logic, audio, and UI components
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **UI Components**: Radix UI primitives with custom styled components for consistent design language
- **3D Graphics Support**: React Three Fiber and Drei for potential 3D game elements and visual effects
- **Game Logic**: Custom canvas-based rendering for the game grid with particle effects and animations

### Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Development Integration**: Vite middleware integration for seamless development experience
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request tracking and performance monitoring
- **Modular Route Structure**: Organized route handling with separate storage interface

### Data Storage Solutions
- **PostgreSQL Database**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Database Migrations**: Automated schema migrations using Drizzle Kit
- **In-Memory Storage**: MemStorage class for development and testing purposes
- **Storage Interface**: Abstract storage interface (IStorage) allowing easy switching between storage implementations

### Game Engine Architecture
- **Canvas Rendering**: Custom 2D canvas rendering system for game grid and pieces
- **Game State Management**: Zustand stores managing game phase, grid state, scoring, and drag operations
- **Animation System**: Custom particle effects and animations for visual feedback
- **Audio System**: Web Audio API integration with mute/unmute functionality
- **Drag and Drop**: Custom drag and drop implementation for piece placement
- **Game Logic**: Modular game mechanics including line clearing, piece validation, and scoring

### Development and Build System
- **TypeScript Configuration**: Strict TypeScript setup with path aliases and ES modules
- **Build Pipeline**: Vite for frontend bundling and esbuild for backend compilation
- **Asset Handling**: Support for 3D models (GLTF/GLB), audio files, and GLSL shaders
- **Development Server**: Integrated development environment with both frontend and backend hot reloading

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL database for production data storage
- **Drizzle ORM**: Schema definition and database operations with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend Libraries
- **React Ecosystem**: React 18 with React DOM for UI rendering
- **UI Component Libraries**: Comprehensive Radix UI component collection for accessible UI primitives
- **3D Graphics**: React Three Fiber ecosystem including Drei and post-processing effects
- **State Management**: Zustand for application state management
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Data Fetching**: TanStack React Query for server state management
- **Utility Libraries**: clsx for conditional classes, date-fns for date operations

### Backend Dependencies
- **Express.js**: Web framework with TypeScript support
- **Development Tools**: tsx for TypeScript execution, esbuild for bundling

### Development and Build Tools
- **Vite**: Build tool with React plugin and GLSL shader support
- **TypeScript**: Type checking and compilation
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Replit Integration**: Runtime error overlay for development environment

### Audio and Assets
- **Font Assets**: Inter font family via Fontsource
- **Audio Support**: Built-in Web Audio API for game sounds and background music
- **Asset Pipeline**: Support for various file formats including 3D models and audio files
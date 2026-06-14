# ArchPro - Architectural Project Management App

A modern React-based project management application designed for architectural firms to track projects, budgets, milestones, and team progress.

## Features

- **Dashboard**: Overview of active projects, budgets, and progress
- **Project Management**: Create, view, and manage architectural projects
- **Milestone Tracking**: Break down projects into milestones with budgets and progress
- **Budget Monitoring**: Track total costs vs. actual spending
- **Export**: Download project data as CSV

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Technology Stack

- **React 18.3.1** - UI framework
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling (via CDN)
- **LocalStorage** - Data persistence

## Project Structure

```
/src
  └── index.js       # Main React app component
/public
  └── index.html     # HTML entry point
package.json         # Dependencies and scripts
```

## Data Storage

The app uses browser LocalStorage to persist project data. Data is automatically saved when changes are made.

## License

MIT

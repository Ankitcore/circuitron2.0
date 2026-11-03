# Circuitron - TechXpo 2025 Website

Full clone and recreation of the [Circuitron RVSCET TechXpo 2025 website](https://circuitron-rvscet.vercel.app/).

## Tech Stack
- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Animations**: Framer Motion
- **Particle System**: `@tsparticles/react` & `@tsparticles/slim`

## Features & Pages
- **Home (`/`)**: Hero section with interactive particle network, TechXpo countdown/details, Brochure download, Event stats, Featured events, Gallery preview, Core team preview, and Contact teaser.
- **About (`/about`)**: Story of Circuitron, Pillars (Innovation, Excellence, Community), Vision (Empower, Innovate, Connect), and Why TechXpo Matters for Students and Industry.
- **Events (`/events`)**: Categorized technical events (Technical, Robotics, Workshops, Exhibitions), modal view for requirements and rules, and direct Google Form registration links.
- **Team (`/team`)**: Faculty Coordinators, Executive Team, and Core Team Members with roles, roll numbers, and photos.
- **Gallery (`/gallery`)**: Event photo gallery with category filter and full-screen lightbox modal.
- **Schedule (`/schedule`)**: Timeline schedule for TechXpo 2025 with times, locations, category color codes, and event guidelines.
- **Contact (`/contact`)**: Interactive contact form, email links, campus location with Google Maps link, and social profiles.
- **Floating Controls**: Animated "Register Now" button when scrolling down, responsive mobile menu drawer, and animated active tab indicator.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

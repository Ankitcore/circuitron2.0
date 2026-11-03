# Circuitron - TechXpo 2026 Website

Full recreation and modern 3D redesign of the Circuitron RVSCET TechXpo 2026 website.

- **Event Date**: 30 November 2026
- **Venue**: RVS College of Engineering & Technology, Jamshedpur

## Tech Stack
- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Animations & 3D Interactive UI**: Framer Motion
- **Particle System**: `@tsparticles/react` & `@tsparticles/slim`
- **Icons**: Lucide React

## Features & Pages
- **Home (`/`)**: Hero section with interactive 3D gyroscope model, live digital countdown to 30 November 2026, Bento grid stats, Brochure download, Featured events, Gallery preview, Core team preview, and Contact inquiry hub.
- **About (`/about`)**: Story of Circuitron, Pillars (Innovation, Excellence, Community), Vision (Empower, Innovate, Connect), and Why TechXpo Matters for Students and Industry.
- **Events (`/events`)**: Categorized technical events (Technical, Robotics, Workshops, Exhibitions), modal view for requirements and rules, and direct registration links.
- **Team (`/team`)**: Faculty Coordinators, Executive Team, and Core Team Members with roles, roll numbers, and photos.
- **Gallery (`/gallery`)**: Event photo gallery with category filter and full-screen lightbox modal with keyboard navigation.
- **Schedule (`/schedule`)**: Circuit timeline schedule for 30 November 2026 with times, locations, category color codes, and event guidelines.
- **Contact (`/contact`)**: Interactive contact form, email links, campus location with Google Maps link, and FAQ accordion.
- **Floating Controls**: Animated "Register Now" button when scrolling down, responsive floating dock navigation, and sound/ambient toggles.

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

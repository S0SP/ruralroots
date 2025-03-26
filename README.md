# Rural Roots - Farmer Assistance Website

Rural Roots is a responsive web application designed to help farmers diagnose crop issues, check weather conditions for spraying, and gain expert agricultural guidance.

## Features

### 1. Header & Navigation
- Logo in the top-left corner
- Navigation menu with links to Business, Our Services, Schemes, and Pricing pages
- Search and user profile icons

### 2. Weather Forecast (Our Services Page)
- Current weather data display with location, date, conditions, temperature, and rain probability
- Spraying conditions indicator (favorable, moderate, unfavorable)
- Hourly forecast showing optimal spraying times

### 3. Disease Detection Tool
- Image upload functionality
- Selection dropdown for crop/plant/soil type
- Analysis results with disease name, type, reason, treatment, heal time, and future precautions

## Technical Details

- Built with React and TypeScript
- Styled using styled-components
- Navigation handled with React Router
- Weather data from OpenWeatherMap API
- Responsive design for all screen sizes

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open http://localhost:3000 to view it in the browser

## API Integration

- The weather forecast feature uses the OpenWeatherMap API with key: `c2d1ebfac3b64219ba740601bcbd0eef`
- The disease detection feature is currently using mock data, but can be integrated with an AI API like Google Cloud Vision or a custom backend

## Future Enhancements

- Add authentication
- Implement profile management
- Add government scheme information
- Integrate market prices
- Add community forum for farmers

## Note
This project requires actual image assets (logo and background image) to be added to the src/assets folder.

## License
MIT

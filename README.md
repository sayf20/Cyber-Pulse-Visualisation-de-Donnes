
# Cyber Attack Visualization Dashboard

## Project Information

**Project Title:** CyberPulse World Map - Cyber Attack Visualization Dashboard

**Team Members:**
- [Saifeddine MOSRATI] - [mosratisayf20@gmail.com]
- [Carla VALLET / Vincent OGER] 

**Declaration Date:** 21/03/2024
**Submission Date:** 20/04/2024

**GitHub Repository:** [https://github.com/sayf20/Cyber-Pulse-Visualisation-de-Donnes.git](https://github.com/sayf20/Cyber-Pulse-Visualisation-de-Donnes.git)

## Project Description

This project visualizes cyber attack data on a world map, showing attack origins, destinations, types, and frequencies. The interactive dashboard provides multiple visualization methods including a real-time attack map, time series data, and various charts to analyze attack patterns.

## Data Source

The data used in this project represents cyber attack information including:

- Attack source (country)
- Attack destination (country)
- Attack type (DDoS, Phishing, Malware, etc.)
- Timestamp
- Attack protocol
- Port information
- Attack intensity

The dataset covers the period from January 1, 2024, to the present day. In a production environment, this data would be sourced from real network monitoring systems, but for demonstration purposes, we've implemented realistic mock data generation.

## Technologies Used

This project is built exclusively with:

- D3.js for all data visualizations
- TypeScript for type safety
- React for the component architecture
- TailwindCSS for styling

## Getting Started

```sh
# Clone the repository
git clone https://github.com/sayf20/Cyber-Pulse-Visualisation-de-Donnes.git

# Navigate to the project directory
cd Cyber-Pulse-Visualisation-de-Donnes

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Features

- Interactive world map visualization of cyber attacks
- Real-time attack animation with customizable speed
- Multiple chart types for data analysis (Bar, Pie, Time Series)
- Country-specific attack details
- Filtering by attack type
- Light/dark theme switching
- Responsive design for all screen sizes


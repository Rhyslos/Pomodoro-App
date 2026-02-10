# Pomodoro Shared Timer

A collaborative Pomodoro timer application that allows users to create rooms, join study sessions, and synchronize work/break cycles in real-time.

## Project Overview

This application is designed to help groups study or work together remotely using the Pomodoro technique. It features a Node.js backend that manages session states, user identities, and timer synchronization.

### Key Features
* **User Management:** Create temporary user profiles with unique IDs.
* **Session Management:** Create and join distinct rooms.
* **Synchronized Timer:** Real-time countdown shared across all connected clients.
* **State Persistence:** Saves user and session data to local JSON files.
* **API Driven:** decoupled backend logic accessible via REST API.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Frontend:** Vanilla JavaScript (ES6), HTML5, CSS3
* **Data Storage:** JSON Files (File System)

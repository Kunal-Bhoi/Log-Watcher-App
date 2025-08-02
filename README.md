# Log Watcher

A real-time log monitoring web application that displays log file updates in a browser interface. The application uses Node.js with Express and Socket.IO to provide live updates of log file changes.

## Features

- **Real-time log monitoring**: Watch log files for changes and display updates instantly
- **Web interface**: Clean, responsive web UI to view logs
- **Auto-scroll**: Automatically scrolls to show the latest log entries
- **Connection status**: Visual indicator showing connection status
- **Large file support**: Efficiently handles large log files (up to 10GB)

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this project to your local machine
2. Navigate to the project directory:
   ```bash
   cd logWatchingApp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Server

1. Start the log watcher server:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

2. The server will start on `http://localhost:3000`

3. Open your web browser and navigate to:
   - `http://localhost:3000/log`

### Testing with Sample Log Updates

To test the application with sample log entries, you can use the provided script:

1. **Open a new terminal window** (keep the server running in the first terminal)

2. Navigate to the project directory and run the log updater script:
   ```bash
   cd logWatchingApp
   ./update-log.sh
   ```

3. **What the script does:**
   - Adds a new log entry to `log.txt` every 2 seconds
   - Each entry includes the current timestamp
   - Continues running until you stop it with `Ctrl+C`
   - Shows "Added: [timestamp] - Log entry added" in the terminal

4. **Watch the web interface** at `http://localhost:3000/log` to see real-time updates appear automatically

## Configuration

### Log File

- The application monitors `log.txt` by default
- You can change the log file by modifying the `LOG_FILE` constant in `server.js`

### Port

- The server runs on port 3000 by default
- You can change the port by modifying the `PORT` constant in `server.js`

## Project Structure

```
logWatchingApp/
├── server.js          # Main server file with log watching logic
├── package.json       # Project dependencies and scripts
├── public/
│   └── index.html     # Web interface
├── log.txt           # Log file being monitored
├── update-log.sh     # Script to generate test log entries
└── README.md         # This file
```

## How It Works

1. **Server Setup**: The Express server serves the web interface and sets up Socket.IO for real-time communication
2. **File Watching**: Uses Node.js `fs.watch()` to monitor the log file for changes
3. **Real-time Updates**: When the log file changes, new lines are sent to connected clients via WebSocket
4. **Web Interface**: The browser displays logs and automatically scrolls to show new entries

## Dependencies

- **express**: Web framework for serving the application
- **socket.io**: Real-time bidirectional communication between server and clients

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the `PORT` constant in `server.js` to an available port.

### Log File Not Found
Make sure `log.txt` exists in the project root directory. The application will create an empty file if it doesn't exist.

### No Updates Showing
- Check that the log file is being written to
- Ensure the web interface is connected (green "Connected" status)
- Try refreshing the browser page

## License

This project is open source and available under the MIT License. 
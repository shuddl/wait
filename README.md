# Secure File Access Portal

A lightweight, client-side web application designed for secure file access with built-in waiting periods and session management.

## Features

- **Secure Access**: Password-protected file download
- **Waiting Period**: Configurable 5-minute waiting period with visual feedback
- **Session Management**: Prevents multiple simultaneous accesses
- **Responsive Design**: Works on desktop and mobile devices
- **Self-healing**: Detects and clears stale sessions automatically

## Technical Implementation

- **HTML5** for structure with semantic elements
- **CSS3** for styling and animations
- **Vanilla JavaScript** (ES6+) for functionality
- **LocalStorage** for session management

## Quick Start

1. Configure the application:
   - Open `script.js` and modify the constants at the top:
     - `HARDCODED_PASSWORD`: Your desired access password
     - `FILE_URL`: The URL to your actual file
     - `WAIT_DURATION_MS`: The waiting period (default: 5 minutes)

2. Deploy the application:
   - Run `./deploy.sh` (see Deployment section)
   - Or deploy manually using one of the methods below

3. Access the application at http://localhost:8080 (or your chosen host)

## Deployment Options

### Using the Provided Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run the script
./deploy.sh
```

### Manual Deployment Options

#### Using Python

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Using Node.js

```bash
# Install http-server globally (if needed)
npm install -g http-server

# Run the server
http-server -p 8080
```

#### Using PHP

```bash
php -S localhost:8080
```

## Configuration Reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `HARDCODED_PASSWORD` | "access2024" | Password required for access |
| `WAIT_DURATION_MS` | 300000 | Wait time in milliseconds (5 minutes) |
| `FILE_URL` | "https://example.com/files/generated_file.ext" | URL to file for download |
| `STALE_LOCK_THRESHOLD_MS` | 480000 | Time after which a session lock is considered stale |

## How It Works

1. **Login Phase**:
   - User enters the password
   - System validates the password
   - On success, system sets a session lock and proceeds to waiting phase

2. **Waiting Phase**:
   - Displays a 5-minute countdown timer
   - Shows a progress bar for visual feedback
   - Prevents other users from accessing during this period

3. **Download Phase**:
   - Validates the file URL
   - Presents download button
   - Clears session lock after download initiation

## Troubleshooting

- **"Access Temporarily Unavailable"**: Another user is currently in a session
- **Download issues**: Verify the `FILE_URL` points to a valid, accessible file
- **Timer problems**: Ensure the browser tab stays open during the waiting period
- **Persistent busy state**: Wait 8 minutes for the stale lock detection to clear the session

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

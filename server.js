import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 3000;
const LOG_FILE = 'log.txt';

app.use(express.static('public'));

class FileWatcher {
    constructor() {
        this.offset = 0;
        this.filePath = LOG_FILE;
        this.maxFileSize = 10 * 1024 * 1024 * 1024; // 10GB limit
        this.initializeOffset();
    }

    getLastNLines(n = 10) {
        try {
            if (!fs.existsSync(this.filePath)) {
                return [];
            }
            const stats = fs.statSync(this.filePath);
            const fileSize = stats.size;
            if (fileSize === 0) {
                return [];
            }
            if (fileSize > this.maxFileSize) {
                console.warn(`File size (${fileSize} bytes) exceeds limit. Reading last ${n} lines may be slow.`);
            }
            if (fileSize < 1024 * 1024) { // Less than 1MB
                const content = fs.readFileSync(this.filePath, 'utf8');
                const lines = content.split('\n').filter(line => line.length > 0);
                return lines.slice(-n);
            }
            const fd = fs.openSync(this.filePath, 'r');
            let position = fileSize - 1;
            let lineCount = 0;
            const buffer = Buffer.alloc(8192);
            let lastNewlinePos = fileSize;
            while (position >= 0 && lineCount < n) {
                const readSize = Math.min(buffer.length, position + 1);
                fs.readSync(fd, buffer, 0, readSize, position - readSize + 1);
                // fs.readSync(
                //     fd,           // File descriptor
                //     buffer,       // Buffer where data will be written
                //     0,            // Offset in buffer (start at index 0)
                //     readSize,     // How many bytes to read
                //     position - readSize + 1 // Position in file to start reading from
                //   );
                for (let i = readSize - 1; i >= 0; i--) {
                    if (buffer[i] === 10) { // newline character
                    lineCount++;
                    if (lineCount === 1) {
                            lastNewlinePos = position - readSize + 1 + i + 1;
                        }
                        if (lineCount >= n) {
                            break;
                        }
                    }
                }
                position -= readSize;
            }
            fs.closeSync(fd);
            if (lastNewlinePos < fileSize) {
                const readFd = fs.openSync(this.filePath, 'r');
                const readSize = fileSize - lastNewlinePos;
                const readBuffer = Buffer.alloc(readSize);
                fs.readSync(readFd, readBuffer, 0, readSize, lastNewlinePos);
                fs.closeSync(readFd);
                const content = readBuffer.toString('utf8');
                const allLines = content.split('\n').filter(line => line.length > 0);
                return allLines.slice(-n);
            }
            return [];
        } catch (error) {
            console.error('Error reading file:', error);
            return [];
        }
    }

    initializeOffset() {
        try {
            if (fs.existsSync(this.filePath)) {
                const stats = fs.statSync(this.filePath);
                this.offset = stats.size;
            }
        } catch (error) {
            console.error('Error initializing offset:', error);
        }
    }

    getUpdates() {
        try {
            if (!fs.existsSync(this.filePath)) {
                return [];
            }
            const stats = fs.statSync(this.filePath);
            const currentSize = stats.size;
            if (currentSize <= this.offset) {
                return [];
            }
            const fd = fs.openSync(this.filePath, 'r');
            const buffer = Buffer.alloc(currentSize - this.offset);
            fs.readSync(fd, buffer, 0, buffer.length, this.offset);
            fs.closeSync(fd);
            const newContent = buffer.toString('utf8');
            this.offset = currentSize;
            return newContent.split('\n').filter(line => line.length > 0);
        } catch (error) {
            console.error('Error reading updates:', error);
            return [];
        }
    }
}

const fileWatcher = new FileWatcher();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    const lastLines = fileWatcher.getLastNLines(10);
    console.log('Sending initial logs:', lastLines.length, 'lines');
    socket.emit('initial-logs', lastLines);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const watcher = fs.watch(LOG_FILE, (eventType, filename) => {
    if (eventType === 'change') {
        const updates = fileWatcher.getUpdates();
        if (updates.length > 0) {
            console.log('Sending updates:', updates.length, 'lines');
            io.emit('log-update', updates);
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/log', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Log watcher monitoring: ${LOG_FILE}`);
    console.log(`Access via: http://localhost:${PORT}/log`);
});
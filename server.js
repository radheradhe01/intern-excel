const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'timesheet.json');
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        entries: [],
        lastUpdated: new Date().toISOString()
    };
    fs.writeJsonSync(DATA_FILE, initialData, { spaces: 2 });
}

// Helper function to get today's entry
function getTodayEntry() {
    const data = fs.readJsonSync(DATA_FILE);
    const today = moment().format('YYYY-MM-DD');
    let todayEntry = data.entries.find(entry => entry.date === today);
    
    if (!todayEntry) {
        todayEntry = {
            date: today,
            inTime: null,
            startBreak: null,
            endBreak: null,
            outTime: null
        };
        data.entries.push(todayEntry);
        fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    }
    
    return todayEntry;
}

// Helper function to save entry
function saveEntry(updatedEntry) {
    const data = fs.readJsonSync(DATA_FILE);
    const today = moment().format('YYYY-MM-DD');
    const entryIndex = data.entries.findIndex(entry => entry.date === today);
    
    if (entryIndex !== -1) {
        data.entries[entryIndex] = updatedEntry;
    } else {
        data.entries.push(updatedEntry);
    }
    
    data.lastUpdated = new Date().toISOString();
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
}

// Routes
app.get('/api/today', (req, res) => {
    try {
        const todayEntry = getTodayEntry();
        res.json(todayEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch today\'s entry' });
    }
});

app.post('/api/update/:field', (req, res) => {
    try {
        const { field } = req.params;
        const validFields = ['inTime', 'startBreak', 'endBreak', 'outTime'];
        
        if (!validFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid field' });
        }
        
        const todayEntry = getTodayEntry();
        const currentTime = moment().format('HH:mm:ss');
        
        todayEntry[field] = currentTime;
        saveEntry(todayEntry);
        
        res.json({ success: true, entry: todayEntry });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

app.get('/api/preview', (req, res) => {
    try {
        const data = fs.readJsonSync(DATA_FILE);
        const recentEntries = data.entries.slice(-7); // Last 7 days
        
        res.json({
            today: getTodayEntry(),
            recent: recentEntries,
            totalEntries: data.entries.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch preview data' });
    }
});

app.get('/api/download', async (req, res) => {
    try {
        const data = fs.readJsonSync(DATA_FILE);
        
        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Timesheet');
        
        // Define columns
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'In Time', key: 'inTime', width: 15 },
            { header: 'Start Break', key: 'startBreak', width: 15 },
            { header: 'End Break', key: 'endBreak', width: 15 },
            { header: 'Out Time', key: 'outTime', width: 15 },
            { header: 'Total Hours', key: 'totalHours', width: 15 },
            { header: 'Break Duration', key: 'breakDuration', width: 15 }
        ];
        
        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        
        // Add data rows
        data.entries.forEach(entry => {
            const inTime = entry.inTime ? moment(entry.inTime, 'HH:mm:ss') : null;
            const outTime = entry.outTime ? moment(entry.outTime, 'HH:mm:ss') : null;
            const startBreak = entry.startBreak ? moment(entry.startBreak, 'HH:mm:ss') : null;
            const endBreak = entry.endBreak ? moment(entry.endBreak, 'HH:mm:ss') : null;
            
            let totalHours = '';
            let breakDuration = '';
            
            if (inTime && outTime) {
                const duration = moment.duration(outTime.diff(inTime));
                totalHours = `${Math.floor(duration.asHours())}:${String(duration.minutes()).padStart(2, '0')}`;
            }
            
            if (startBreak && endBreak) {
                const breakDur = moment.duration(endBreak.diff(startBreak));
                breakDuration = `${Math.floor(breakDur.asHours())}:${String(breakDur.minutes()).padStart(2, '0')}`;
            }
            
            worksheet.addRow({
                date: entry.date,
                inTime: entry.inTime || '',
                startBreak: entry.startBreak || '',
                endBreak: entry.endBreak || '',
                outTime: entry.outTime || '',
                totalHours: totalHours,
                breakDuration: breakDuration
            });
        });
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.alignment = { horizontal: 'center' };
        });
        
        // Set response headers
        const filename = `timesheet_${moment().format('YYYY-MM-DD')}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Write to response
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({ error: 'Failed to generate Excel file' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Time Tracker server running on http://localhost:${PORT}`);
    console.log(`📊 Data file: ${DATA_FILE}`);
});
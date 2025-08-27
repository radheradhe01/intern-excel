const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file path
const DATA_FILE = 'timeData.json';

// Initialize data file if it doesn't exist
function initializeDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            entries: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Load time data
function loadTimeData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading data:', error);
        return { entries: [] };
    }
}

// Save time data
function saveTimeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Get today's entry or create new one
function getTodayEntry() {
    const data = loadTimeData();
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
        saveTimeData(data);
    }
    
    return todayEntry;
}

// Routes
app.get('/api/today', (req, res) => {
    try {
        const todayEntry = getTodayEntry();
        res.json(todayEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load today\'s data' });
    }
});

app.post('/api/update/:field', (req, res) => {
    try {
        const { field } = req.params;
        const validFields = ['inTime', 'startBreak', 'endBreak', 'outTime'];
        
        if (!validFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid field' });
        }
        
        const data = loadTimeData();
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
        }
        
        todayEntry[field] = moment().format('HH:mm:ss');
        
        if (saveTimeData(data)) {
            res.json({ success: true, entry: todayEntry });
        } else {
            res.status(500).json({ error: 'Failed to save data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update time' });
    }
});

app.get('/api/preview', (req, res) => {
    try {
        const data = loadTimeData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load preview data' });
    }
});

app.get('/api/download', async (req, res) => {
    try {
        const data = loadTimeData();
        
        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Time Sheet');
        
        // Add headers
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'In Time', key: 'inTime', width: 15 },
            { header: 'Start Break', key: 'startBreak', width: 15 },
            { header: 'End Break', key: 'endBreak', width: 15 },
            { header: 'Out Time', key: 'outTime', width: 15 },
            { header: 'Total Hours', key: 'totalHours', width: 15 }
        ];
        
        // Add data rows
        data.entries.forEach(entry => {
            let totalHours = 'N/A';
            
            if (entry.inTime && entry.outTime) {
                const inTime = moment(entry.inTime, 'HH:mm:ss');
                const outTime = moment(entry.outTime, 'HH:mm:ss');
                
                if (entry.startBreak && entry.endBreak) {
                    const startBreak = moment(entry.startBreak, 'HH:mm:ss');
                    const endBreak = moment(entry.endBreak, 'HH:mm:ss');
                    const breakDuration = moment.duration(endBreak.diff(startBreak));
                    const workDuration = moment.duration(outTime.diff(inTime)).subtract(breakDuration);
                    totalHours = workDuration.asHours().toFixed(2) + ' hrs';
                } else {
                    const workDuration = moment.duration(outTime.diff(inTime));
                    totalHours = workDuration.asHours().toFixed(2) + ' hrs';
                }
            }
            
            worksheet.addRow({
                date: entry.date,
                inTime: entry.inTime || 'Not set',
                startBreak: entry.startBreak || 'Not set',
                endBreak: entry.endBreak || 'Not set',
                outTime: entry.outTime || 'Not set',
                totalHours: totalHours
            });
        });
        
        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="timesheet.xlsx"');
        
        // Write to response
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({ error: 'Failed to generate Excel file' });
    }
});

// Initialize data file on startup
initializeDataFile();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
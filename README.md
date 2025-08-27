# Work Time Tracker

A modern web application for tracking daily work hours with Excel export functionality. Perfect for remote workers and interns who need to maintain accurate time sheets.

## Features

- **4 Main Time Tracking Buttons**: In Time, Start Break, End Break, Out Time
- **Button Timeout Protection**: 5-second timeout after each button press to prevent accidental double-clicks
- **Real-time Clock Display**: Shows current time and date
- **Live Summary**: Displays today's work hours and break time
- **Preview Mode**: View all time entries in a table format
- **Excel Export**: Download complete time sheet as Excel file
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## System Architecture

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express.js
- **Data Storage**: JSON file-based storage
- **Excel Generation**: ExcelJS library
- **Time Handling**: Moment.js for accurate time calculations

## Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **For development with auto-restart**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Daily Time Tracking

1. **In Time**: Click when you start your work day
2. **Start Break**: Click when you begin your break
3. **End Break**: Click when you return from break
4. **Out Time**: Click when you finish your work day

### Features

- **Preview**: Click to view all your time entries
- **Download Excel**: Generate and download your complete time sheet
- **Auto-save**: All times are automatically saved to the server
- **Button Protection**: 5-second timeout prevents accidental double-clicks

### Data Storage

- All time entries are stored in `timeData.json`
- Data is automatically organized by date
- No database setup required

## API Endpoints

- `GET /api/today` - Get today's time entry
- `POST /api/update/:field` - Update a specific time field
- `GET /api/preview` - Get all time entries for preview
- `GET /api/download` - Download Excel file

## File Structure

```
work-time-tracker/
├── server.js          # Backend server
├── package.json       # Dependencies and scripts
├── public/            # Frontend files
│   ├── index.html     # Main HTML page
│   ├── styles.css     # CSS styling
│   └── script.js      # Frontend JavaScript
├── timeData.json      # Time data storage (auto-generated)
└── README.md          # This file
```

## Customization

### Button Timeout Duration
Change the timeout duration in `public/script.js`:
```javascript
setButtonTimeout(field, 5000); // 5 seconds
```

### Port Configuration
Change the server port in `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

### Excel File Name
Modify the download filename in `server.js`:
```javascript
res.setHeader('Content-Disposition', 'attachment; filename="timesheet.xlsx"');
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port number in `server.js`
2. **Excel download fails**: Ensure you have write permissions in the project directory
3. **Button not responding**: Wait for the 5-second timeout to complete

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Features

- Input validation on all API endpoints
- CORS enabled for local development
- No sensitive data exposure

## Future Enhancements

- User authentication system
- Multiple user support
- Database integration (MongoDB/PostgreSQL)
- Email notifications
- Mobile app version
- Time analytics and reports

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions, please check the troubleshooting section or create an issue in the project repository.

---

**Happy Time Tracking!** ⏰
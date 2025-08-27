# Work Time Tracker 🕐

A simple, intuitive web application for tracking your work hours with just one click. Perfect for remote workers and interns who need to maintain accurate timesheets.

## ✨ Features

- **One-Click Time Tracking**: 4 simple buttons for In Time, Start Break, End Break, and Out Time
- **Button Timeout Protection**: 3-second timeout after each button press to prevent accidental double-clicks
- **Real-Time Preview**: View today's summary and recent entries
- **Excel Export**: Download your complete timesheet as an Excel file
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Quick access with number keys (1-4) and letters (P for preview, D for download)
- **Beautiful UI**: Modern, intuitive interface that's hard to forget to use

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repo-url>
   cd work-time-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## 📱 How to Use

### Daily Workflow
1. **Start your day**: Click "In Time" when you begin work
2. **Take breaks**: Click "Start Break" when you start a break, then "End Break" when you return
3. **End your day**: Click "Out Time" when you finish work

### Additional Features
- **Preview**: Click "Preview" to see today's summary and recent entries
- **Download**: Click "Download Excel" to get your complete timesheet

### Keyboard Shortcuts
- `1` - In Time
- `2` - Start Break  
- `3` - End Break
- `4` - Out Time
- `P` - Preview
- `D` - Download Excel

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Server**: `server.js` - Main Express server with REST API endpoints
- **Data Storage**: JSON file-based storage in `data/timesheet.json`
- **Excel Generation**: Uses ExcelJS library for professional Excel output
- **Time Handling**: Moment.js for accurate time calculations

### Frontend (Vanilla JavaScript)
- **UI**: Modern, responsive design with CSS Grid and Flexbox
- **Interactions**: Real-time updates, button timeouts, and notifications
- **API Integration**: Fetch API for seamless server communication

### API Endpoints
- `GET /api/today` - Get today's time entry
- `POST /api/update/:field` - Update a specific time field
- `GET /api/preview` - Get preview data (today + recent entries)
- `GET /api/download` - Download Excel timesheet

## 📊 Data Structure

### Timesheet Entry
```json
{
  "date": "2024-01-15",
  "inTime": "09:00:00",
  "startBreak": "12:00:00",
  "endBreak": "13:00:00",
  "outTime": "17:00:00"
}
```

### Excel Output
The Excel file includes:
- Date
- In Time
- Start Break
- End Break
- Out Time
- Total Hours (calculated)
- Break Duration (calculated)

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Data File Location
- Timesheet data: `data/timesheet.json`
- Automatically created on first run

## 🎨 Customization

### Colors and Styling
Edit `public/index.html` to customize:
- Color schemes
- Button styles
- Layout and spacing
- Fonts and typography

### Button Timeout Duration
Modify the timeout duration in `public/script.js`:
```javascript
// Change from 3000ms (3 seconds) to your preferred duration
setTimeout(() => {
    button.disabled = false;
    button.style.opacity = '1';
}, 5000); // 5 seconds
```

## 📱 Mobile Optimization

The app is fully responsive and optimized for:
- **Desktop**: Full-featured interface with all buttons visible
- **Tablet**: Adaptive grid layout
- **Mobile**: Single-column layout with touch-friendly buttons

## 🔒 Security Features

- Input validation on all API endpoints
- CORS enabled for cross-origin requests
- Error handling and user feedback
- Button timeout protection against accidental clicks

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Future Enhancements

- [ ] User authentication and multiple user support
- [ ] Database integration (PostgreSQL, MongoDB)
- [ ] Email notifications and reminders
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Integration with calendar apps
- [ ] Export to other formats (PDF, CSV)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in server.js or set environment variable
   PORT=3001 npm start
   ```

2. **Excel download fails**
   - Check browser console for errors
   - Ensure all dependencies are installed
   - Verify write permissions in data directory

3. **Buttons not responding**
   - Check browser console for JavaScript errors
   - Ensure server is running
   - Clear browser cache

### Debug Mode
Enable detailed logging by adding to `server.js`:
```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Font Awesome** for beautiful icons
- **Google Fonts** for typography
- **ExcelJS** for Excel generation
- **Moment.js** for time handling

---

**Made with ❤️ for remote workers everywhere**

*Remember: The best time tracking system is the one you'll actually use!*
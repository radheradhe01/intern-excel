#!/bin/bash

echo "🚀 Starting Work Time Tracker..."
echo "📱 Opening in browser..."

# Start the server in the background
npm start &

# Wait a moment for the server to start
sleep 3

# Try to open the browser (works on most systems)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v start &> /dev/null; then
    start http://localhost:3000
else
    echo "🌐 Please open your browser and go to: http://localhost:3000"
fi

echo "✅ Server is running on http://localhost:3000"
echo "🛑 To stop the server, press Ctrl+C"
echo ""
echo "📋 Features:"
echo "   • 4 Time tracking buttons (In, Start Break, End Break, Out)"
echo "   • 5-second button timeout protection"
echo "   • Real-time clock display"
echo "   • Excel export functionality"
echo "   • Preview mode for all entries"
echo ""

# Keep the script running and show server logs
wait
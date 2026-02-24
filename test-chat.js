const { io } = require('socket.io-client');

const CLIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTljNjg3ODMwNGQzOGYxZTU2MTJkMzYiLCJlbWFpbCI6ImNsaWVudEB0ZXN0LmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NzE5MjU2MTgsImV4cCI6MTc3MTkyNjUxOH0.ubdtMdtIu2eGrJe2aOSbvk5LNtzD4DJrCiyV7NqyXIA';
const COACH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTljNmY0MzEwOGFmYWE4NjI3MDExMTYiLCJlbWFpbCI6ImNvYWNoQHRlc3QxLmNvbSIsInJvbGUiOiJjb2FjaCIsImlhdCI6MTc3MTkyNTgyOSwiZXhwIjoxNzcxOTI2NzI5fQ.JsBh_dwOWaYWOAPqIwq1yUHkZxOTTzvABBPGGRTQCp0';
const COACH_USER_ID = '699c6f43108afaa862701116';
const CLIENT_USER_ID = '699c6878304d38f1e5612d36';

// connect as client
const clientSocket = io('http://localhost:4000', {
  auth: { token: CLIENT_TOKEN },
});

// connect as coach
const coachSocket = io('http://localhost:4000', {
  auth: { token: COACH_TOKEN },
});

clientSocket.on('connect', () => {
  console.log('Client connected:', clientSocket.id);

  // send a message to the coach
  clientSocket.emit('sendMessage', {
    receiverId: COACH_USER_ID,
    content: 'Hey coach, ready for my workout!',
    type: 'text',
  });
});

// coach receives the message
coachSocket.on('newMessage', (message) => {
  console.log('Coach received message:', message);

  // coach replies
  coachSocket.emit('sendMessage', {
    receiverId: CLIENT_USER_ID,
    content: 'Great! Let us get started. Focus on form today.',
    type: 'text',
  });
});

// client receives the reply
clientSocket.on('newMessage', (message) => {
  console.log('Client received message:', message);
});

clientSocket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});
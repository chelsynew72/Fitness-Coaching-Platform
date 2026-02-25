const { io } = require('socket.io-client');

const CLIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTlkNmU2ZTY0MGUxNTgwYmI4NTlkZmEiLCJlbWFpbCI6InRlbWNoZWxzeUBnbWFpbC5jb20iLCJyb2xlIjoiY2xpZW50IiwiaWF0IjoxNzcyMDEyNjMxLCJleHAiOjE3NzIwMTM1MzF9.fYQpFPGUYyAQsQgHQBrKk-InYovzYs5aT9Vt8Z43Ic4';
const COACH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTljNmY0MzEwOGFmYWE4NjI3MDExMTYiLCJlbWFpbCI6ImNvYWNoQHRlc3QxLmNvbSIsInJvbGUiOiJjb2FjaCIsImlhdCI6MTc3MjAxMjU4NSwiZXhwIjoxNzcyMDEzNDg1fQ.c006Jg9mG1CAvNV2Bitwe_IPjUWS2gV1ICiL4CY_m4s';
const COACH_USER_ID = '699c6f43108afaa862701116';
const CLIENT_USER_ID = '699d6e6e640e1580bb859dfa';

const clientSocket = io('http://localhost:4000', {
  auth: { token: CLIENT_TOKEN },
});

const coachSocket = io('http://localhost:4000', {
  auth: { token: COACH_TOKEN },
});

let coachReplied = false;

clientSocket.on('connect', () => {
  console.log('Client connected:', clientSocket.id);
  clientSocket.emit('sendMessage', {
    receiverId: COACH_USER_ID,
    content: 'Hey coach, ready for my workout!',
    type: 'text',
  });
});

coachSocket.on('newMessage', (message) => {
  if (coachReplied) return;
  if (message.content === 'Hey coach, ready for my workout!') {
    console.log('Coach received:', message.content);
    coachReplied = true;
    coachSocket.emit('sendMessage', {
      receiverId: CLIENT_USER_ID,
      content: 'Great! Let us get started. Focus on form today.',
      type: 'text',
    });
  }
});

clientSocket.on('newMessage', (message) => {
  if (message.content === 'Great! Let us get started. Focus on form today.') {
    console.log('Client received:', message.content);
    console.log('✓ Chat test complete!');
    setTimeout(() => process.exit(0), 500);
  }
});

clientSocket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

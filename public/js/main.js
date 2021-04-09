const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
/* Get Our video Elements */
const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
// const ranges = player.querySelectorAll('.player__slider');


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

/* Build out video functions */

function updateButton() {
  const icon = this.paused ? '►' : '❚ ❚';
  console.log(icon);
  toggle.textContent = icon;
}
// function handleRangeUpdate() {
//   video[this.name] = this.value;
// }


/* Hook up the event listeners */
//toggle play pause button
video.addEventListener('click', ()=>{
  console.log(username, room );
  socket.emit('toogle_play_pause', { username, room });
});
toggle.addEventListener('click', ()=>{
  console.log(username, room );
  socket.emit('toogle_play_pause', { username, room });
});

socket.on('client_do_toogle_play_pause',(arg)=>{
  const method = video.paused ? 'play' : 'pause';
  video[method]();
});

//change play pause button icon
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);

//handle progress bar
video.addEventListener('timeupdate', ()=>{
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
});

//sync skip buttons
skipButtons.forEach(button => button.addEventListener('click', function() {
  let skip_value = parseFloat(this.dataset.skip);
  console.log(username, room, skip_value );
  socket.emit('skip',  skip_value);
}));

socket.on('client_do_skip',(skip_time)=>{
  console.log(skip_time);
  video.currentTime += parseFloat(skip_time);
});
// ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
// ranges.forEach(range => range.addEventListener('mousemove', handleRangeUpdate));

// let mousedown = false;
//sync progressbar
progress.addEventListener('click', (e)=>{
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  console.log(username, room, scrubTime );
  socket.emit('scrub', { username, room, scrubTime });
});

socket.on('client_do_scrub',(scrubTime)=>{
  video.currentTime = scrubTime;
});
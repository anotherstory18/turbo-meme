const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const appRoutes = require('./routes/appRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use('/', appRoutes(io));

io.on('connection', (socket) => {
  socket.emit('live:connected', { ok: true, message: 'Live MediFlow stream active' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MediFlow AI running on http://localhost:${PORT}`);
});

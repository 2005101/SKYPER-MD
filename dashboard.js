const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let usersDB = './users.json';
let statsDB = './stats.json';

// Init stats file
if(!fs.existsSync(statsDB)) fs.writeFileSync(statsDB, JSON.stringify({
    totalCommands: 0,
    groups: 0,
    uptimeStart: Date.now()
}));

app.use(express.static('public'));
app.use(express.json());

// 1. BOT SENDS USER DATA
app.post('/api/add-user', (req, res) => {
    const { number, name } = req.body;
    let users = fs.existsSync(usersDB)? JSON.parse(fs.readFileSync(usersDB)) : [];

    let user = users.find(u => u.number === number);
    if(!user){
        users.push({
            number, name,
            joinDate: new Date().toISOString(),
            lastSeen: Date.now(),
            status: "online"
        });
    } else {
        user.lastSeen = Date.now();
        user.status = "online";
    }
    fs.writeFileSync(usersDB, JSON.stringify(users, null, 2));
    res.json({status: "ok"});
});

// 2. BOT SENDS COMMAND STATS
app.post('/api/command', (req, res) => {
    let stats = JSON.parse(fs.readFileSync(statsDB));
    stats.totalCommands += 1;
    fs.writeFileSync(statsDB, JSON.stringify(stats));
    res.json({status: "ok"});
});

// 3. GET ALL DATA FOR DASHBOARD
app.get('/api/stats', (req, res) => {
    let users = fs.existsSync(usersDB)? JSON.parse(fs.readFileSync(usersDB)) : [];
    let stats = JSON.parse(fs.readFileSync(statsDB));

    // Check who is online: lastSeen < 5 mins
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    users.forEach(u => u.status = u.lastSeen > fiveMinAgo? "online" : "offline");

    let uptime = Date.now() - stats.uptimeStart;
    let uptimeHours = Math.floor(uptime / 1000 / 60 / 60);

    res.json({
        totalUsers: users.length,
        onlineUsers: users.filter(u => u.status === "online").length,
        offlineUsers: users.filter(u => u.status === "offline").length,
        totalCommands: stats.totalCommands,
        groups: stats.groups,
        uptime: `${uptimeHours}h`,
        users: users
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`INSIGHTS running on ${PORT}`));

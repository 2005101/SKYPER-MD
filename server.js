const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public'))

// Main dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'))
})

// Keep pair page separate
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pair.html'))
})

// API for insights
app.get('/api/insights', async (req, res) => {
    const fs = require('fs')
    let economy = {}
    if(fs.existsSync('./database/economy.json'))
        economy = JSON.parse(fs.readFileSync('./database/economy.json'))

    const stats = {
        users: Object.keys(economy).length,
        ttlBots: 1, // total bots connected. Change if you run multi bot
        onlineBots: sock.user? 1 : 0,
        speed: `${Math.floor(Math.random() * 50 + 50)}ms`, // fake ping. Replace with real
        ttlCmds: global.totalCommands || 0,
        uptime: process.uptime()
    }
    res.json(stats)
})

app.listen(3000, () => console.log('Server running'))

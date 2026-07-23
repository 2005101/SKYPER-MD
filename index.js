import express from 'express';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys'
import P from 'pino'

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 10000;

let sock;
let latestCode = "Waiting for bot to start...";

const config = {
  "prefix": ".",
  "ownerName": "DARK-EYE OFC DEV",
  "ownerNumber": "263783546271",
  "botName": "SKYPER-MD",
  "version": "2.0.0",
  "mode": "public"
}

const boxMenu = (title, lines) => {
    let text = `╭───❒「 *${title}* 」❒───╮\n`
    lines.forEach(line => text += `│≈♤ ${line}\n`)
    text += `╰────────────────────❒\n`
    return text
}

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>${config.botName} Pair Code</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:Arial;background:#0f0f0f;color:white;text-align:center;padding:20px}.box{background:#1a1a1a;padding:30px;border-radius:20px;max-width:400px;margin:auto}input{width:90%;padding:12px;margin:10px 0;border-radius:10px;border:none;background:#2a2a2a;color:white}button{width:95%;padding:12px;margin:10px 0;border-radius:10px;border:none;background:black;color:white;font-weight:bold;cursor:pointer}.code{background:#2a2a2a;padding:15px;border-radius:10px;margin:10px 0;font-size:20px}</style></head><body><div class="box"><h2>🤖 ${config.botName} Pair Code</h2><p>Link your WhatsApp device</p><form action="/pair" method="POST"><input type="text" name="number" placeholder="+263783546271" required><button type="submit">🔑 Generate Pair Code</button></form><div class="code">${latestCode}</div><button onclick="navigator.clipboard.writeText(document.querySelector('.code').innerText)">📋 Copy Code</button><p style="font-size:12px">© 2026 ${config.ownerName}</p></div></body></html>`)
})

app.post('/pair', async (req, res) => {
    let number = req.body.number.replace(/[^0-9]/g, '')
    if(!sock) return res.redirect('/')
    try {
        const code = await sock.requestPairingCode(number)
        latestCode = code.match(/.{1,4}/g)?.join('-')
        res.redirect('/')
    } catch(e) {
        latestCode = "Error: " + e.message
        res.redirect('/')
    }
})

app.listen(PORT, () => console.log(`Web server on port ${PORT}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const { version } = await fetchLatestBaileysVersion()
    sock = makeWASocket({ version, logger: P({ level: 'error' }), auth: state, browser: Browsers.ubuntu('Firefox') })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const statusCode = (lastDisconnect.error)?.output?.statusCode
            const shouldReconnect = statusCode!== DisconnectReason.loggedOut
            if(shouldReconnect) setTimeout(startBot, 3000)
        }
        else if(connection === 'open') console.log(`${config.botName} IS CONNECTED ✅`)
    })
    sock.ev.on('messages.upsert', async ({ messages }) => {
        if(!messages[0] ||!messages[0].message) return
        const m = messages[0]
        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
        if(!body.startsWith(config.prefix)) return
        const args = body.slice(config.prefix.length).trim().split(/ +/)
        const cmd = args.shift().toLowerCase()
        const reply = (text) => sock.sendMessage(from, { text }, { quoted: m })
        const header = `╭──❒「 *${config.botName}* 」❒──╮\n│≈□ *Version :* ${config.version}\n│≈□ *Prefix :* ${config.prefix}\n│≈□ *OWNER :* ${config.ownerName}\n╰────────────────────❒\n\n`;
        if (cmd === 'menu' || cmd === 'help') reply(header + boxMenu('COMMANDS', ['menu', 'alive', 'ping']) + `_More coming soon_`)
        if (cmd === 'alive') reply(boxMenu('BOT STATUS', [`Bot: ${config.botName} ✅`, `Version: ${config.version}`, `Runtime: ${Math.floor(process.uptime()/60)}m`]))
        if (cmd === 'ping') { const s = Date.now(); await reply('Pong...'); reply(`${Date.now() - s}ms`) }
      })
  }
startBot()

import fs from 'fs'
import os from 'os'
import { exec } from 'child_process'
import express from 'express';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys'
import P from 'pino'
import axios from 'axios' // <- ADD THIS

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 10000;

const DASHBOARD_URL = "https://skyper-md.onrender.com" // <- YOUR DASHBOARD URL

let sock;
let latestCode = "Waiting for bot to start...";

const config = {
  "prefix": ".",
  "ownerName": "DARK-EYE OFC DEV",
  "ownerNumber": "263783546271",
  "botName": "SKYPER-MD",
  "version": "2.0.0",
  "mode": "public",
  "watermark": "> *♤powered by DARK-EYE OFC DEV*"
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
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) setTimeout(startBot, 3000)
        }
        else if(connection === 'open') {
            console.log(`${config.botName} IS CONNECTED ✅`)
            
            // WHEN USER PAIRS - SEND TO DASHBOARD
            try {
                await axios.post(`${DASHBOARD_URL}/api/add-user`, {
                    number: sock.user.id.split(':')[0],
                    name: sock.user.name || "Unknown"
                });
                console.log("User data sent to dashboard")
            } catch(e) {
                console.log("Dashboard offline")
            }
        }
    })

    const VERSION = config.version
const PREFIX = config.prefix
const OWNER = config.ownerName
const OWNER_NUM = config.ownerNumber
const WM = config.watermark // watermark shortcut

sock.ev.on('messages.upsert', async ({ messages }) => {
    if(!messages[0] ||!messages[0].message) return
    const m = messages[0]
    const from = m.key.remoteJid
    const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
    if(!body.startsWith(PREFIX)) return

try {
            await axios.post(`${DASHBOARD_URL}/api/command`, {});
        } catch(e) {}
  
    const args = body.slice(PREFIX.length).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()
    const reply = (text) => sock.sendMessage(from, { text }, { quoted: m })

    // ============ MAIN MENU ============
    if (cmd === 'menu') {
        await reply('> *🔥DARK-EYE V2 MAIN MENU🇿🇼*');
        const header = `╭───❒「 *DARK-EYE V2* 」❒───╮
│≈♤ *Version:* ${VERSION}
│≈♤ *Prefix:* ${PREFIX}
│≈♤ *Owner:* ${OWNER}
╰────────────────────❒\n\n`;

        const general = boxMenu('GENERAL', ['menu','help','ping','owner','about','status','rules','donate','version','stats','github','report','suggest','runtime','language','feedback','blocklist','invite','speed','prefix']);
        const fun = boxMenu('FUN', ['joke','meme','quote','fact','8ball','roll','flip','truth','dare','roast','compliment','pickup','wouldyou','riddle','tictactoe','hangman','trivia','guessnum','emojigame','ship','rate','howgay','howcute','howdumb','kill','hug','slap','pat','kiss','cuddle']);
        const tools = boxMenu('TOOLS', ['s','sticker','simage','svid','sgif','attp','ttp','toimg','tovideo','tomp3','togif','removebg','blur','bright','invert','grayscale','circle','logo','quoteimg','picedit']);
        const download = boxMenu('DOWNLOAD', ['yt','ytmp3','tiktok','insta','fb','twitter','play','song','movie','series','video','apk']);
        const search = boxMenu('SEARCH', ['pinterest','google','img','wallpaper','news']);
        const utils = boxMenu('UTILS', ['date','time','weather','translate','lyrics','calculator','currency','timer','ssweb','qr','readqr','shorturl','ip','font','tovid']);
        const group = boxMenu('GROUP', ['kick','ban','unban','mute','unmute','promote','demote','add','tagall','hidetag','groupinfo','grouplink','revoke','setname','setdesc','setpp','closegc','opengc','antilink','antibadword','welcome','leave','warn','unwarn','warnings','kickall','promoteall','demoteall']);
        const ai = boxMenu('AI', ['ai','chatgpt','gpt3','gpt4','gpt5','gemini','claude','bard','copilot','beta','grok','grokbeta','deepseek','lovable','base44','perplexity','mistral','dolly','lumin','kimi','brain','meta','sora','suno','aisong','aivideo','story','write','essay','code','explain','summarize','rephrase','grammar','airoast','girlfriend','boyfriend','character','advice','motivate','therapist','study']);
        const economy = boxMenu('ECONOMY', ['balance','daily','work','rob','slot','bet','fish','hunt','weekly','beg','pay','shop','buy','sell','inventory','level','rank','xp','claim','gift']);
        const owner = boxMenu('OWNER', ['eval','exec','broadcast','banchat','unbanchat','setprefix','clearchat','restart','shutdown','join','leavegc','block','unblock','backup','restore','setbio','setnamebot','setbotpic','autojoin','autoleave','pair']);
        const religion = boxMenu('RELIGION', ['quran','bible','prayer'])
        const other = boxMenu('OTHER', ['afk','poll','mode','darkeye'])

        const fullMenu = header + general + fun + tools + download + search + utils + group + ai + economy + owner + religion + other + `_Type ${PREFIX}menu <cmd> for details_\n\n${WM}`

        await sock.sendMessage(from, {
            image: fs.readFileSync('./menu.jpg'),
            caption: fullMenu
        }, { quoted: m });
    }

    // ============ GENERAL COMMAND USAGE ============
    if (cmd === 'help') return reply(boxMenu('HELP', [`Usage: ${PREFIX}help`, `Shows this menu`]) + `\n${WM}`)

    if (cmd === 'ping') {
        const s = Date.now();
        await reply(boxMenu('PING', [`Testing...`]) + `\n${WM}`);
        reply(boxMenu('PING RESULT', [`Speed: ${Date.now() - s}ms`]) + `\n${WM}`)
    }

    if (cmd === 'owner') {
        reply(boxMenu('OWNER INFO', [`Name: ${OWNER}`, `Number: +${OWNER_NUM}`, `Country: Zimbabwe 🇿🇼`]) + `\n${WM}`)
    }

    if (cmd === 'about') {
        reply(boxMenu('ABOUT SKYPER-MD', [
            `Bot: ${config.botName}`,
            `Version: ${VERSION}`,
            `Developer: ${OWNER}`,
            `Prefix: ${PREFIX}`,
            `Mode: ${config.mode}`,
            `Library: Baileys MD`
        ]) + `\n${WM}`)
    }

    if (cmd === 'status' || cmd === 'stats') {
        const uptime = Math.floor(process.uptime()/60)
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        reply(boxMenu('BOT STATUS', [
            `Status: ONLINE ✅`,
            `Version: ${VERSION}`,
            `Uptime: ${uptime} minutes`,
            `RAM Usage: ${ram} MB`,
            `Platform: ${os.platform()}`
        ]) + `\n${WM}`)
    }

    if (cmd === 'rules') {
        reply(boxMenu('BOT RULES', [
            `1. No spam`,
            `2. No 18+ content`,
            `3. Respect the owner`,
            `4. Don't abuse commands`,
            `5. Have fun 😎`
        ]) + `\n${WM}`)
    }

    if (cmd === 'donate') {
        reply(boxMenu('SUPPORT DARK-EYE', [
            `EcoCash: +${OWNER_NUM}`,
            `USD: +${OWNER_NUM}`,
            `Thank you for supporting 🇿🇼`
        ]) + `\n${WM}`)
    }

    if (cmd === 'version') {
        reply(boxMenu('VERSION INFO', [`Current: ${VERSION}`, `Latest: ${VERSION}`, `Status: Up to date ✅`]) + `\n${WM}`)
    }

    if (cmd === 'github') {
        reply(boxMenu('GITHUB REPO', [`Repo: https://github.com/2005101/SKYPER-MD`, `Star the repo ⭐`, `Report bugs in Issues`]) + `\n${WM}`)
    }

    if (cmd === 'report') {
        const report = args.join(' ')
        if(!report) return reply(boxMenu('REPORT', [`Usage: ${PREFIX}report <bug/problem>`]) + `\n${WM}`)
        await sock.sendMessage(OWNER_NUM+'@s.whatsapp.net', {text: `*🚨 NEW REPORT*\nFrom: ${from}\nReport: ${report}`})
        reply(boxMenu('REPORT', [`✅ Report sent to owner`]) + `\n${WM}`)
    }

    if (cmd === 'suggest') {
        const suggest = args.join(' ')
        if(!suggest) return reply(boxMenu('SUGGEST', [`Usage: ${PREFIX}suggest <your idea>`]) + `\n${WM}`)
        await sock.sendMessage(OWNER_NUM+'@s.whatsapp.net', {text: `*💡 NEW SUGGESTION*\nFrom: ${from}\nIdea: ${suggest}`})
        reply(boxMenu('SUGGEST', [`✅ Suggestion sent to owner`]) + `\n${WM}`)
    }

    if (cmd === 'runtime' || cmd === 'uptime') {
        const uptime = process.uptime()
        const hours = Math.floor(uptime / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)
        reply(boxMenu('RUNTIME', [`${hours}h ${minutes}m ${seconds}s`]) + `\n${WM}`)
    }

    if (cmd === 'language' || cmd === 'lang') {
        reply(boxMenu('LANGUAGE', [`Current: English`, `More languages coming soon`]) + `\n${WM}`)
    }

    if (cmd === 'feedback') {
        const fb = args.join(' ')
        if(!fb) return reply(boxMenu('FEEDBACK', [`Usage: ${PREFIX}feedback <your feedback>`]) + `\n${WM}`)
        await sock.sendMessage(OWNER_NUM+'@s.whatsapp.net', {text: `*📝 NEW FEEDBACK*\nFrom: ${from}\nFeedback: ${fb}`})
        reply(boxMenu('FEEDBACK', [`✅ Feedback sent. Thank you!`]) + `\n${WM}`)
    }

    if (cmd === 'blocklist') {
        const blocklist = await sock.fetchBlocklist()
        if(blocklist.length === 0) return reply(boxMenu('BLOCKLIST', [`Blocklist is empty`]) + `\n${WM}`)
        reply(boxMenu('BLOCKED USERS', blocklist.map(n => '+'+n.split('@')[0])) + `\n${WM}`)
    }

    if (cmd === 'invite') {
        const link = args[0]
        if(!link) return reply(boxMenu('INVITE', [`Usage: ${PREFIX}invite <group link>`]) + `\n${WM}`)
        try {
            const code = link.split('https://chat.whatsapp.com/')[1]
            await sock.groupAcceptInvite(code)
            reply(boxMenu('INVITE', [`✅ Joined group successfully`]) + `\n${WM}`)
        } catch(e) { reply(boxMenu('INVITE', [`❌ Invalid link`]) + `\n${WM}`) }
    }

    if (cmd === 'speed') {
        const start = Date.now()
        await reply(boxMenu('SPEED TEST', [`Testing...`]) + `\n${WM}`);
        const end = Date.now()
        reply(boxMenu('SPEED RESULT', [`Response: ${end - start}ms`]) + `\n${WM}`)
    }

    if (cmd === 'prefix') {
        const newPrefix = args[0]
        if(!newPrefix) return reply(boxMenu('PREFIX', [`Current prefix: ${PREFIX}`]) + `\n${WM}`)
        if(from!== OWNER_NUM+'@s.whatsapp.net') return reply(boxMenu('PREFIX', [`❌ Owner only`]) + `\n${WM}`)
        config.prefix = newPrefix
        reply(boxMenu('PREFIX', [`✅ Prefix changed to: ${newPrefix}`]) + `\n${WM}`)
    }

})

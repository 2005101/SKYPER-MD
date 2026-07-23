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


                                                             import axios from 'axios' // make sure you have this

const WM = config.watermark
const RAPID = config.apiKeys.rapidapi

// ============ FUN COMMANDS ============
const jokes = ["Why don't skeletons fight each other? They don't have the guts.", "What do you call a bear with no teeth? A gummy bear.", "I'm reading a book about anti-gravity. It's impossible to put down."]
const quotes = ["The way to get started is to quit talking and begin doing.", "Life is what happens to you while you're busy making other plans.", "The future belongs to those who believe in their dreams."]
const facts = ["A group of flamingos is called a flamboyance.", "Octopuses have 3 hearts.", "Bananas are berries, but strawberries aren't."]

if (cmd === 'joke') {
    const joke = jokes[Math.floor(Math.random() * jokes.length)]
    reply(boxMenu('JOKE 😂', [joke]) + `\n${WM}`)
}

if (cmd === 'meme') {
    try {
        const res = await axios.get('https://meme-api.com/gimme')
        await sock.sendMessage(from, {
            image: { url: res.data.url },
            caption: boxMenu('MEME', [`Title: ${res.data.title}`]) + `\n${WM}`
        }, { quoted: m })
    } catch(e) { reply(boxMenu('MEME', [`API Error`]) + `\n${WM}`) }
}

if (cmd === 'quote') {
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    reply(boxMenu('QUOTE 💭', [quote]) + `\n${WM}`)
}

if (cmd === 'fact') {
    const fact = facts[Math.floor(Math.random() * facts.length)]
    reply(boxMenu('RANDOM FACT 🧠', [fact]) + `\n${WM}`)
}

if (cmd === '8ball') {
    const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Ask again later', 'I doubt it']
    const question = args.join(' ')
    if(!question) return reply(boxMenu('8BALL', [`Usage: ${PREFIX}8ball <question>`]) + `\n${WM}`)
    const ans = answers[Math.floor(Math.random() * answers.length)]
    reply(boxMenu('8BALL 🎱', [`Q: ${question}`, `A: ${ans}`]) + `\n${WM}`)
}

if (cmd === 'roll') {
    const num = Math.floor(Math.random() * 6) + 1
    reply(boxMenu('DICE ROLL 🎲', [`You rolled: ${num}`]) + `\n${WM}`)
}

if (cmd === 'flip') {
    const coin = Math.random() < 0.5? 'Heads' : 'Tails'
    reply(boxMenu('COIN FLIP 🪙', [`Result: ${coin}`]) + `\n${WM}`)
}

if (cmd === 'truth') {
    const truths = ['What is your biggest secret?', 'Who was your first crush?', 'Have you ever lied to get out of trouble?']
    reply(boxMenu('TRUTH', [truths[Math.floor(Math.random() * truths.length)]]) + `\n${WM}`)
}

if (cmd === 'dare') {
    const dares = ['Send a voice note singing', 'Change your DP to a meme', 'Text your crush "hi"']
    reply(boxMenu('DARE', [dares[Math.floor(Math.random() * dares.length)]]) + `\n${WM}`)
}

if (cmd === 'roast') {
    const target = args[0]? '@'+args[0] : 'you'
    const roasts = ['You have the personality of a wet sock', 'Your brain is 90% water and 10% useless', 'I’d agree with you but then we’d both be wrong']
    reply(boxMenu('ROAST 🔥', [`${target}: ${roasts[Math.floor(Math.random() * roasts.length)]}`]) + `\n${WM}`)
}

if (cmd === 'compliment') {
    const target = args[0]? '@'+args[0] : 'you'
    const comps = ['You have a beautiful soul', 'You light up the room', 'You are amazing']
    reply(boxMenu('COMPLIMENT ✨', [`${target}: ${comps[Math.floor(Math.random() * comps.length)]}`]) + `\n${WM}`)
}

if (cmd === 'pickup') {
    const lines = ['Are you a magician? Because whenever I look at you, everyone else disappears.', 'Do you have a map? I keep getting lost in your eyes.']
    reply(boxMenu('PICKUP LINE', [lines[Math.floor(Math.random() * lines.length)]]) + `\n${WM}`)
}

if (cmd === 'wouldyou') {
    const q = ['Would you rather fight 100 duck sized horses or 1 horse sized duck?', 'Would you rather have unlimited money or unlimited time?']
    reply(boxMenu('WOULD YOU RATHER', [q[Math.floor(Math.random() * q.length)]]) + `\n${WM}`)
}

if (cmd === 'riddle') {
    reply(boxMenu('RIDDLE 🤔', [`What has keys but can't open locks?`, `Answer: A piano`]) + `\n${WM}`)
}

if (cmd === 'tictactoe') {
    reply(boxMenu('TIC TAC TOE', [`Feature coming soon. Play with friends!`]) + `\n${WM}`)
}

if (cmd === 'hangman') {
    reply(boxMenu('HANGMAN', [`Feature coming soon. Guess the word!`]) + `\n${WM}`)
}

if (cmd === 'trivia') {
    reply(boxMenu('TRIVIA', [`Q: What is the capital of Zimbabwe?`, `A: Harare`]) + `\n${WM}`)
}

if (cmd === 'guessnum') {
    const num = Math.floor(Math.random() * 10) + 1
    reply(boxMenu('GUESS NUMBER', [`Guess a number between 1-10`, `I picked: ${num}`]) + `\n${WM}`)
}

if (cmd === 'emojigame') {
    reply(boxMenu('EMOJI GAME', [`Guess: 🐱 + 🏠 =?`, `Answer: Cat House`]) + `\n${WM}`)
}

if (cmd === 'ship') {
    const p1 = args[0] || 'You'
    const p2 = args[1] || 'Me'
    const percent = Math.floor(Math.random() * 100) + 1
    reply(boxMenu('SHIP 💘', [`${p1} + ${p2}`, `Love: ${percent}%`]) + `\n${WM}`)
}

if (cmd === 'rate') {
    const target = args[0] || 'you'
    const percent = Math.floor(Math.random() * 100) + 1
    reply(boxMenu('RATE', [`Rating ${target}: ${percent}/100`]) + `\n${WM}`)
}

if (cmd === 'howgay') {
    const percent = Math.floor(Math.random() * 100) + 1
    reply(boxMenu('HOW GAY 🏳️‍🌈', [`You are ${percent}% gay`]) + `\n${WM}`)
}

if (cmd === 'howcute') {
    const percent = Math.floor(Math.random() * 100) + 1
    reply(boxMenu('HOW CUTE 🥰', [`You are ${percent}% cute`]) + `\n${WM}`)
}

if (cmd === 'howdumb') {
    const percent = Math.floor(Math.random() * 100) + 1
    reply(boxMenu('HOW DUMB 🤡', [`You are ${percent}% dumb`]) + `\n${WM}`)
}

if (cmd === 'kill') {
    const target = args[0] || 'someone'
    reply(boxMenu('KILL', [`${m.pushName} killed ${target} with a banana 🔪🍌`]) + `\n${WM}`)
}

if (cmd === 'hug') {
    const target = args[0] || 'someone'
    reply(boxMenu('HUG 🤗', [`${m.pushName} hugged ${target}`]) + `\n${WM}`)
}

if (cmd === 'slap') {
    const target = args[0] || 'someone'
    reply(boxMenu('SLAP 👋', [`${m.pushName} slapped ${target}`]) + `\n${WM}`)
}

if (cmd === 'pat') {
    const target = args[0] || 'someone'
    reply(boxMenu('PAT', [`${m.pushName} patted ${target}`]) + `\n${WM}`)
}

if (cmd === 'kiss') {
    const target = args[0] || 'someone'
    reply(boxMenu('KISS 😘', [`${m.pushName} kissed ${target}`]) + `\n${WM}`)
}

if (cmd === 'cuddle') {
    const target = args[0] || 'someone'
    reply(boxMenu('CUDDLE 🥺', [`${m.pushName} cuddled ${target}`]) + `\n${WM}`)
      }

import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import axios from 'axios'
import { createCanvas, loadImage } from 'canvas'
import { removeBackgroundFromImageFile } from 'remove.bg'

const WM = config.watermark
const RBG = config.apiKeys.removebg

// Helper to download media
const downloadMedia = async (msg) => {
    const buffer = await sock.downloadMediaMessage(msg)
    return buffer
}

// ============ TOOLS COMMANDS ============
if (cmd === 's' || cmd === 'sticker') {
    if(!m.message.imageMessage && !m.quoted?.message?.imageMessage) return reply(boxMenu('STICKER', [`Reply to an image`]) + `\n${WM}`)
    const media = await downloadMedia(m.quoted || m)
    const sticker = new Sticker(media, {
        pack: 'DARK-EYE V2',
        author: OWNER,
        type: StickerTypes.FULL,
        quality: 50
    })
    await sock.sendMessage(from, await sticker.toMessage(), { quoted: m })
}

if (cmd === 'simage') {
    const text = args.join(' ')
    if(!text) return reply(boxMenu('SIMAGE', [`Usage: ${PREFIX}simage <text>`]) + `\n${WM}`)
    const canvas = createCanvas(512, 512)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 512, 512)
    ctx.fillStyle = '#FFF'
    ctx.font = '40px Arial'
    ctx.fillText(text, 50, 256)
    const buffer = canvas.toBuffer()
    const sticker = new Sticker(buffer, { pack: 'DARK-EYE', author: OWNER, type: StickerTypes.FULL })
    await sock.sendMessage(from, await sticker.toMessage(), { quoted: m })
}

if (cmd === 'svid' || cmd === 'sgif') {
    if(!m.message.videoMessage && !m.quoted?.message?.videoMessage) return reply(boxMenu('SVIDEO', [`Reply to a video/gif < 10s`]) + `\n${WM}`)
    const media = await downloadMedia(m.quoted || m)
    const sticker = new Sticker(media, {
        pack: 'DARK-EYE V2',
        author: OWNER,
        type: StickerTypes.FULL,
        quality: 50
    })
    await sock.sendMessage(from, await sticker.toMessage(), { quoted: m })
}

if (cmd === 'attp' || cmd === 'ttp') {
    const text = args.join(' ')
    if(!text) return reply(boxMenu('ATTP', [`Usage: ${PREFIX}attp <text>`]) + `\n${WM}`)
    const url = `https://api.popcat.xyz/attp?text=${encodeURIComponent(text)}`
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    const sticker = new Sticker(res.data, { pack: 'DARK-EYE', author: OWNER, type: StickerTypes.FULL })
    await sock.sendMessage(from, await sticker.toMessage(), { quoted: m })
}

if (cmd === 'toimg') {
    if(!m.message.stickerMessage && !m.quoted?.message?.stickerMessage) return reply(boxMenu('TOIMG', [`Reply to a sticker`]) + `\n${WM}`)
    const media = await downloadMedia(m.quoted || m)
    await sock.sendMessage(from, { image: media, caption: boxMenu('TOIMG', [`Converted`]) + `\n${WM}` }, { quoted: m })
}

if (cmd === 'tovideo') {
    reply(boxMenu('TOVIDEO', [`Feature coming soon`]) + `\n${WM}`)
}

if (cmd === 'tomp3') {
    if(!m.message.audioMessage && !m.quoted?.message?.audioMessage) return reply(boxMenu('TOMP3', [`Reply to a video`]) + `\n${WM}`)
    const media = await downloadMedia(m.quoted || m)
    await sock.sendMessage(from, { audio: media, mimetype: 'audio/mpeg' }, { quoted: m })
}

if (cmd === 'togif') {
    reply(boxMenu('TOGIF', [`Feature coming soon`]) + `\n${WM}`)
}

if (cmd === 'removebg') {
    if(!m.message.imageMessage && !m.quoted?.message?.imageMessage) return reply(boxMenu('REMOVEBG', [`Reply to an image`]) + `\n${WM}`)
    const media = await downloadMedia(m.quoted || m)
    fs.writeFileSync('./tmp.jpg', media)
    removeBackgroundFromImageFile({
        path: './tmp.jpg',
        apiKey: RBG,
        size: 'regular',
    }).then(async (result) => {
        await sock.sendMessage(from, { image: result.base64img, caption: boxMenu('REMOVEBG', [`Background Removed`]) + `\n${WM}` }, { quoted: m })
        fs.unlinkSync('./tmp.jpg')
    })
}

if (['blur','bright','invert','grayscale','circle'].includes(cmd)) {
    if(!m.message.imageMessage && !m.quoted?.message?.imageMessage) return reply(boxMenu('EDIT', [`Reply to an image`]) + `\n${WM}`)
    const media = await downloadMedia(m.quoted || m)
    const img = await loadImage(media)
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    
    if(cmd === 'grayscale') ctx.filter = 'grayscale(100%)'
    if(cmd === 'invert') ctx.filter = 'invert(100%)'
    if(cmd === 'bright') ctx.filter = 'brightness(150%)'
    if(cmd === 'blur') ctx.filter = 'blur(5px)'
    
    ctx.drawImage(img, 0, 0)
    if(cmd === 'circle') {
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.arc(img.width/2, img.height/2, img.width/2, 0, Math.PI*2)
        ctx.closePath()
        ctx.fill()
    }
    
    const buffer = canvas.toBuffer()
    await sock.sendMessage(from, { image: buffer, caption: boxMenu('EDIT', [`Filter: ${cmd}`]) + `\n${WM}` }, { quoted: m })
}

if (cmd === 'logo') {
    const text = args.join(' ')
    if(!text) return reply(boxMenu('LOGO', [`Usage: ${PREFIX}logo <text>`]) + `\n${WM}`)
    const url = `https://api.popcat.xyz/texttowall?text=${encodeURIComponent(text)}`
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    await sock.sendMessage(from, { image: res.data, caption: boxMenu('LOGO', [`Logo Generated`]) + `\n${WM}` }, { quoted: m })
}

if (cmd === 'quoteimg') {
    const text = args.join(' ')
    if(!text) return reply(boxMenu('QUOTEIMG', [`Usage: ${PREFIX}quoteimg <text>`]) + `\n${WM}`)
    const url = `https://api.popcat.xyz/quote?text=${encodeURIComponent(text)}`
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    await sock.sendMessage(from, { image: res.data, caption: boxMenu('QUOTEIMG', []) + `\n${WM}` }, { quoted: m })
}

if (cmd === 'picedit') {
    reply(boxMenu('PICEDIT', [`Usage: ${PREFIX}picedit blur|bright|invert|grayscale|circle`, `Reply to an image`]) + `\n${WM}`)
      }


import axios from 'axios'
import QRCode from 'qrcode'
import qrcodeReader from 'qrcode-reader'
import Jimp from 'jimp'
import moment from 'moment'
import translate from 'translate-google'

const WM = config.watermark
const WEATHER_KEY = config.apiKeys.openweather || "YOUR_OPENWEATHER_KEY"

// ============ DATE & TIME ============
if (cmd === 'date') {
    const date = moment().format('dddd, DD MMMM YYYY')
    reply(boxMenu('DATE', [`Today: ${date}`]) + `\n${WM}`)
}

if (cmd === 'time') {
    const time = moment().format('hh:mm:ss A')
    reply(boxMenu('TIME', [`Now: ${time}`]) + `\n${WM}`)
}

// ============ WEATHER <city> ============
if (cmd === 'weather') {
    const city = args.join(' ')
    if(!city) return reply(boxMenu('WEATHER', [`Usage: ${PREFIX}weather <city name>`]) + `\n${WM}`)

    try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_KEY}`)
        const data = res.data
        reply(boxMenu('WEATHER', [
            `City: ${data.name}`,
            `Temp: ${data.main.temp}°C`,
            `Feels: ${data.main.feels_like}°C`,
            `Weather: ${data.weather[0].description}`,
            `Humidity: ${data.main.humidity}%`,
            `Wind: ${data.wind.speed} m/s`
        ]) + `\n${WM}`)
    } catch(e) { reply(boxMenu('ERROR', [`City not found`]) + `\n${WM}`) }
}

// ============ TIMER - REMINDER AFTER X MINS ============
if (cmd === 'timer') {
    const mins = parseInt(args[0])
    const msg = args.slice(1).join(' ') || 'Time up!'
    if(!mins) return reply(boxMenu('TIMER', [`Usage: ${PREFIX}timer <minutes> <message>`]) + `\n${WM}`)

    reply(boxMenu('TIMER SET', [`I will remind you in ${mins} minutes`, `Message: ${msg}`]) + `\n${WM}`)

    setTimeout(async () => {
        await sock.sendMessage(from, {
            text: boxMenu('REMINDER', [`⏰ ${msg}`]) + `\n${WM}`,
            mentions: [sender]
        }, { quoted: m })
    }, mins * 60000)
}

// ============ SHORTURL ============
if (cmd === 'shorturl') {
    const url = args[0]
    if(!url) return reply(boxMenu('SHORTURL', [`Usage: ${PREFIX}shorturl <link>`]) + `\n${WM}`)

    try {
        const res = await axios.get(`https://api.tinyurl.com/create`, {
            headers: { 'Authorization': 'Bearer YOUR_TINYURL_TOKEN' },
            params: { url: url }
        })
        reply(boxMenu('SHORTURL', [`Original: ${url}`, `Short: ${res.data.tiny_url}`]) + `\n${WM}`)
    } catch(e) {
        // fallback
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
        reply(boxMenu('SHORTURL', [`Original: ${url}`, `Short: ${res.data}`]) + `\n${WM}`)
    }
}

// ============ READ / TTS VOICE NOTE ============
if (cmd === 'read') {
    const text = m.quoted? m.quoted.text : args.join(' ')
    if(!text) return reply(boxMenu('READ', [`Reply to a message or type: ${PREFIX}read <text>`]) + `\n${WM}`)

    // Using Google TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`
    await sock.sendMessage(from, {
        audio: { url: ttsUrl },
        mimetype: 'audio/mpeg',
        ptt: true
    }, { quoted: m })
}

// ============ QR GENERATOR ============
if (cmd === 'qr') {
    const text = args.join(' ')
    if(!text) return reply(boxMenu('QR', [`Usage: ${PREFIX}qr <text or link>`]) + `\n${WM}`)

    const qr = await QRCode.toBuffer(text)
    await sock.sendMessage(from, {
        image: qr,
        caption: boxMenu('QR CODE', [`Text: ${text}`]) + `\n${WM}`
    }, { quoted: m })
}

// ============ READ QR ============
if (cmd === 'readqr') {
    if(!m.quoted ||!m.quoted.imageMessage) return reply(boxMenu('READQR', [`Reply to a QR image`]) + `\n${WM}`)

    const buffer = await sock.downloadMediaMessage(m.quoted)
    const image = await Jimp.read(buffer)
    const qr = new qrcodeReader()
    qr.callback = (err, value) => {
        if(err) return reply(boxMenu('ERROR', [`No QR found`]) + `\n${WM}`)
        reply(boxMenu('QR RESULT', [`${value.result}`]) + `\n${WM}`)
    }
    qr.decode(image.bitmap)
}

// ============ TRANSLATE ============
if (cmd === 'translate') {
    const text = args.join(' ')
    if(!text) return reply(boxMenu('TRANSLATE', [`Usage: ${PREFIX}translate <text>`]) + `\n${WM}`)
    const res = await translate(text, { to: 'en' })
    reply(boxMenu('TRANSLATE', [`${text} → ${res}`]) + `\n${WM}`)
}

// ============ CALCULATOR ============
if (cmd === 'calculator' || cmd === 'calc') {
    const exp = args.join(' ')
    if(!exp) return reply(boxMenu('CALCULATOR', [`Usage: ${PREFIX}calc 2+2*5`]) + `\n${WM}`)
    try {
        const result = eval(exp)
        reply(boxMenu('CALCULATOR', [`${exp} = ${result}`]) + `\n${WM}`)
    } catch(e) { reply(boxMenu('ERROR', [`Invalid expression`]) + `\n${WM}`) }
}

// ============ CURRENCY ============
if (cmd === 'currency') {
    const [amount, fromCur, toCur] = args
    if(!amount) return reply(boxMenu('CURRENCY', [`Usage: ${PREFIX}currency 100 usd zwl`]) + `\n${WM}`)
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCur.toUpperCase()}`)
    const rate = res.data.rates[toCur.toUpperCase()]
    reply(boxMenu('CURRENCY', [`${amount} ${fromCur} = ${(amount*rate).toFixed(2)} ${toCur}`]) + `\n${WM}`)
}

// ============ IP ============
if (cmd === 'ip') {
    const ip = args[0]
    if(!ip) return reply(boxMenu('IP', [`Usage: ${PREFIX}ip 8.8.8.8`]) + `\n${WM}`)
    const res = await axios.get(`http://ip-api.com/json/${ip}`)
    reply(boxMenu('IP INFO', [`IP: ${res.data.query}`, `Country: ${res.data.country}`, `ISP: ${res.data.isp}`]) + `\n${WM}`)
}


const WM = config.watermark

// ============ PINTEREST ============
if (cmd === 'pinterest' || cmd === 'pin') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('PINTEREST', [`Usage: ${PREFIX}pinterest <search term>`]) + `\n${WM}`)
    
    reply(boxMenu('SEARCHING PINTEREST', [`Query: ${query}`]) + `\n${WM}`)
    
    try {
        const res = await axios.get(`https://api.unsplash.com/search/photos?query=${query}&per_page=5`, {
            headers: { Authorization: 'Client-ID YOUR_UNSPLASH_KEY' }
        })
        const imgs = res.data.results
        for(let img of imgs){
            await sock.sendMessage(from, {
                image: { url: img.urls.small },
                caption: boxMenu('PINTEREST', [`${query}`]) + `\n${WM}`
            }, { quoted: m })
        }
    } catch(e) { reply(boxMenu('ERROR', [`No results found`]) + `\n${WM}`) }
}

// ============ GOOGLE SEARCH ============
if (cmd === 'google') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('GOOGLE', [`Usage: ${PREFIX}google <search term>`]) + `\n${WM}`)
    
    // Using duckduckgo instant answer API - no key needed
    const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`)
    const data = res.data
    
    let result = boxMenu('GOOGLE', [
        `Query: ${query}`,
        `Answer: ${data.AbstractText || 'No direct answer'}`,
        `More: https://google.com/search?q=${encodeURIComponent(query)}`
    ]) + `\n${WM}`
    
    reply(result)
}

// ============ GOOGLE IMAGE ============
if (cmd === 'img' || cmd === 'image') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('IMAGE', [`Usage: ${PREFIX}img <search term>`]) + `\n${WM}`)
    
    reply(boxMenu('SEARCHING IMAGES', [`Query: ${query}`]) + `\n${WM}`)
    
    try {
        const res = await axios.get(`https://api.unsplash.com/search/photos?query=${query}&per_page=3`, {
            headers: { Authorization: 'Client-ID YOUR_UNSPLASH_KEY' }
        })
        for(let img of res.data.results){
            await sock.sendMessage(from, {
                image: { url: img.urls.regular },
                caption: boxMenu('IMAGE', [`${query}`]) + `\n${WM}`
            }, { quoted: m })
        }
    } catch(e) { reply(boxMenu('ERROR', [`Failed to fetch images`]) + `\n${WM}`) }
}

// ============ WALLPAPER ============
if (cmd === 'wallpaper' || cmd === 'wp') {
    const query = args[0] || 'nature'
    reply(boxMenu('WALLPAPER', [`Category: ${query}`]) + `\n${WM}`)
    
    try {
        const res = await axios.get(`https://api.unsplash.com/photos/random?query=${query}&orientation=portrait&count=3`, {
            headers: { Authorization: 'Client-ID YOUR_UNSPLASH_KEY' }
        })
        for(let img of res.data){
            await sock.sendMessage(from, {
                image: { url: img.urls.full },
                caption: boxMenu('WALLPAPER', [`${query} HD`]) + `\n${WM}`
            }, { quoted: m })
        }
    } catch(e) { reply(boxMenu('ERROR', [`Failed to fetch wallpaper`]) + `\n${WM}`) }
}

// ============ NEWS ============
if (cmd === 'news') {
    const query = args.join(' ') || 'world'
    reply(boxMenu('NEWS', [`Category: ${query}`]) + `\n${WM}`)
    
    try {
        // Using NewsAPI - get free key at newsapi.org
        const res = await axios.get(`https://newsapi.org/v2/top-headlines?category=${query}&country=us&apiKey=YOUR_NEWSAPI_KEY`)
        const articles = res.data.articles.slice(0,5)
        
        let news = boxMenu('TOP NEWS', [])
        articles.forEach((a,i) => {
            news += `\n${i+1}. *${a.title}*\n${a.url}\n`
        })
        reply(news + `\n${WM}`)
    } catch(e) { reply(boxMenu('ERROR', [`Failed to fetch news`]) + `\n${WM}`) }
}

import yts from 'yt-search'
import ytdl from 'ytdl-core'
import fs from 'fs'
import axios from 'axios'

const WM = config.watermark

// helper to check duration
function toSeconds(timestamp) {
    const parts = timestamp.split(':').map(Number)
    if(parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2]
    return parts[0]*60 + parts[1]
}

// ============ YT VIDEO ============
if (cmd === 'yt' || cmd === 'video' || cmd === 'vid') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('YOUTUBE', [`Usage: ${PREFIX}yt <name or link>`]) + `\n${WM}`)

    const search = await yts(query)
    const video = search.videos[0]
    const duration = toSeconds(video.timestamp)

    if(duration >= 3000){ // 50mins = 3000 seconds
        return reply(boxMenu('MOVIE LINK', [
            `Title: ${video.title}`,
            `Duration: ${video.timestamp}`,
            `Link: ${video.url}`,
            `Note: Too long to send. Watch on YouTube`
        ]) + `\n${WM}`)
    }

    reply(boxMenu('DOWNLOADING', [`${video.title}`]) + `\n${WM}`)
    const stream = ytdl(video.url, { quality: '18' })
    const file = `./tmp/${Date.now()}.mp4`
    stream.pipe(fs.createWriteStream(file))
    stream.on('end', async () => {
        await sock.sendMessage(from, { video: { url: file }, caption: video.title }, { quoted: m })
        fs.unlinkSync(file)
    })
}

// ============ PLAY AUDIO ============
if (cmd === 'play') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('PLAY', [`Usage: ${PREFIX}play <song name>`]) + `\n${WM}`)
    const search = await yts(query)
    const song = search.videos[0]
    const file = `./tmp/${Date.now()}.mp3`
    ytdl(song.url, { filter: 'audioonly' }).pipe(fs.createWriteStream(file))
   .on('finish', async () => {
        await sock.sendMessage(from, { audio: { url: file }, mimetype: 'audio/mp4' }, { quoted: m })
        fs.unlinkSync(file)
    })
    reply(boxMenu('DOWNLOADING AUDIO', [`${song.title}`]) + `\n${WM}`)
}

// ============ SONG AS DOCUMENT ============
if (cmd === 'song') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('SONG', [`Usage: ${PREFIX}song <song name>`]) + `\n${WM}`)
    const search = await yts(query)
    const song = search.videos[0]
    const file = `./tmp/${Date.now()}.mp3`
    ytdl(song.url, { filter: 'audioonly' }).pipe(fs.createWriteStream(file))
   .on('finish', async () => {
        await sock.sendMessage(from, { document: { url: file }, fileName: `${song.title}.mp3` }, { quoted: m })
        fs.unlinkSync(file)
    })
    reply(boxMenu('DOWNLOADING AS DOC', [`${song.title}`]) + `\n${WM}`)
}

// ============ TIKTOK/INSTA/FB/TWITTER ============
if (cmd === 'tiktok' || cmd === 'insta' || cmd === 'fb' || cmd === 'twitter') {
    const url = args[0]
    if(!url) return reply(boxMenu('DOWNLOAD', [`Usage: ${PREFIX}${cmd} <link>`]) + `\n${WM}`)
    reply(boxMenu('DOWNLOAD', [`Fetching ${cmd}...`, `Link: ${url}`]) + `\n${WM}`)
    // connect your RapidAPI here
}

// ============ MOVIE 50MINS+ ============
if (cmd === 'movie') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('MOVIE', [`Usage: ${PREFIX}movie <name>`]) + `\n${WM}`)

    const search = await yts(query + ' full movie')
    const video = search.videos[0]

    reply(boxMenu('MOVIE LINK', [
        `Title: ${query}`,
        `Duration: ${video.timestamp}`,
        `YouTube: ${video.url}`,
        `Note: Movies 50mins+ are sent as links only`
    ]) + `\n${WM}`)
}

// ============ SERIES ============
if (cmd === 'series') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('SERIES', [`Usage: ${PREFIX}series <name>`]) + `\n${WM}`)
    reply(boxMenu('SERIES', [
        `Searching: ${query}`,
        `Platform: MovieBox`,
        `Note: Episodes sent as links. Full seasons too big for WhatsApp`
    ]) + `\n${WM}`)
}

// ============ APK ============
if (cmd === 'apk') {
    const query = args.join(' ')
    if(!query) return reply(boxMenu('APK', [`Usage: ${PREFIX}apk <app name>`]) + `\n${WM}`)
    reply(boxMenu('APK', [
        `App: ${query}`,
        `Google Play: search ${query}`,
        `Apple Store: search ${query}`
    ]) + `\n${WM}`)
}


const group = boxMenu('GROUP', ['kick','ban','unban','mute','unmute','promote','demote','add','tagall','hidetag','groupinfo','grouplink','revoke','setname','setdesc','setpp','closegc','opengc','antilink','antibadword','welcome','leave','warn','unwarn','warnings','kickall','promoteall','demoteall']);
        const
const WM = config.watermark
let groupSettings = {} // store antilink, welcome, antibadword per group

// check if admin
const isAdmin = async (jid) => {
    const groupMetadata = await sock.groupMetadata(jid)
    const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
    return admins.includes(sender)
}

// ============ KICK ============
if (cmd === 'kick') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    const users = m.mentionedJid || []
    if(!users.length) return reply(boxMenu('KICK', [`Tag someone to kick`]) + `\n${WM}`)
    await sock.groupParticipantsUpdate(from, users, 'remove')
    reply(boxMenu('KICKED', [`Removed ${users.length} member(s)`]) + `\n${WM}`)
}

// ============ PROMOTE / DEMOTE ============
if (cmd === 'promote') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    const users = m.mentionedJid || []
    await sock.groupParticipantsUpdate(from, users, 'promote')
    reply(boxMenu('PROMOTED', [`Promoted ${users.length}`]) + `\n${WM}`)
}

if (cmd === 'demote') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    const users = m.mentionedJid || []
    await sock.groupParticipantsUpdate(from, users, 'demote')
    reply(boxMenu('DEMOTED', [`Demoted ${users.length}`]) + `\n${WM}`)
}

// ============ ADD ============
if (cmd === 'add') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    const num = args[0] + '@s.whatsapp.net'
    await sock.groupParticipantsUpdate(from, [num], 'add')
    reply(boxMenu('ADDED', [`Added ${args[0]}`]) + `\n${WM}`)
}

// ============ TAGALL / HIDETAG ============
if (cmd === 'tagall') {
    const groupMetadata = await sock.groupMetadata(from)
    const participants = groupMetadata.participants.map(p => p.id)
    let text = args.join(' ') || 'Tag All'
    let msg = boxMenu('TAGALL', [text]) + '\n\n'
    participants.forEach(p => msg += `@${p.split('@')[0]} `)
    await sock.sendMessage(from, { text: msg, mentions: participants }, { quoted: m })
}

if (cmd === 'hidetag') {
    const groupMetadata = await sock.groupMetadata(from)
    const participants = groupMetadata.participants.map(p => p.id)
    await sock.sendMessage(from, { text: args.join(' '), mentions: participants }, { quoted: m })
}

// ============ GROUPINFO ============
if (cmd === 'groupinfo') {
    const meta = await sock.groupMetadata(from)
    const admins = meta.participants.filter(p => p.admin).length
    const created = new Date(meta.creation * 1000).toDateString()
    const creator = meta.participants.find(p => p.admin && p.isSuperAdmin)?.id || 'Unknown'

    reply(boxMenu('GROUP INFO', [
        `Name: ${meta.subject}`,
        `Desc: ${meta.desc || 'No description'}`,
        `Creator: @${creator.split('@')[0]}`,
        `Created: ${created}`,
        `Members: ${meta.participants.length}`,
        `Admins: ${admins}`,
        `JID: ${meta.id}`
    ]) + `\n${WM}`, { mentions: [creator] })
}

// ============ GROUPLINK ============
if (cmd === 'grouplink' || cmd === 'revoke') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    const code = await sock.groupInviteCode(from)
    const meta = await sock.groupMetadata(from)
    reply(boxMenu('GROUP LINK', [
        `Name: ${meta.subject}`,
        `Desc: ${meta.desc || 'No description'}`,
        `Link: https://chat.whatsapp.com/${code}`
    ]) + `\n${WM}`)
}

// ============ CLOSEGC / OPENGC ============
if (cmd === 'closegc') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    await sock.groupSettingUpdate(from, 'announcement')
    reply(boxMenu('GROUP', [`Group closed. Only admins can send`]) + `\n${WM}`)
}

if (cmd === 'opengc') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    await sock.groupSettingUpdate(from, 'not_announcement')
    reply(boxMenu('GROUP', [`Group opened. Everyone can send`]) + `\n${WM}`)
}

// ============ SETGNAME / SETDESC / SETGPP ============
if (cmd === 'setgname') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    await sock.groupUpdateSubject(from, args.join(' '))
    reply(boxMenu('GROUP', [`Name changed`]) + `\n${WM}`)
}

if (cmd === 'setdesc') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    await sock.groupUpdateDescription(from, args.join(' '))
    reply(boxMenu('GROUP', [`Description changed`]) + `\n${WM}`)
}

// ============ ANTILINK ============
if (cmd === 'antilink') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    groupSettings[from] = groupSettings[from] || {}
    groupSettings[from].antilink =!groupSettings[from].antilink
    reply(boxMenu('ANTILINK', [`Antilink: ${groupSettings[from].antilink? 'ON' : 'OFF'}`]) + `\n${WM}`)
}

// delete WA links
if (groupSettings[from]?.antilink && text.includes('chat.whatsapp.com')) {
    await sock.sendMessage(from, { delete: m.key })
    reply(boxMenu('ANTILINK', [`Links not allowed`]) + `\n${WM}`)
}

// ============ WELCOME ============
if (cmd === 'welcome') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    groupSettings[from] = groupSettings[from] || {}
    groupSettings[from].welcome =!groupSettings[from].welcome
    reply(boxMenu('WELCOME', [`Welcome: ${groupSettings[from].welcome? 'ON' : 'OFF'}`]) + `\n${WM}`)
}

// auto welcome
sock.ev.on('group-participants.update', async (update) => {
    if(!groupSettings[update.id]?.welcome) return
    const meta = await sock.groupMetadata(update.id)
    for(let participant of update.participants){
        if(update.action === 'add'){
            const pp = await sock.profilePictureUrl(participant, 'image').catch(() => 'https://i.imgur.com/2WZl0Q3.png')
            const total = meta.participants.length
            const position = total
            await sock.sendMessage(update.id, {
                image: { url: pp },
                caption: boxMenu('WELCOME', [
                    `Welcome to ${meta.subject}`,
                    `You are member no: ${position} of ${total}`,
                    `Group Rules: Follow ${meta.subject} rules`,
                    `Enjoy your stay!`
                ]) + `\n${WM}`,
                mentions: [participant]
            })
        }
        if(update.action === 'remove'){
            const pp = await sock.profilePictureUrl(participant, 'image').catch(() => 'https://i.imgur.com/2WZl0Q3.png')
            await sock.sendMessage(update.id, {
                image: { url: pp },
                caption: boxMenu('GOODBYE', [
                    `Goodbye @${participant.split('@')[0]}`,
                    `We will miss you from ${meta.subject}`
                ]) + `\n${WM}`,
                mentions: [participant]
            })
        }
    }
})

// ============ WARN SYSTEM ============
let warns = {}
if (cmd === 'warn') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only admins`]) + `\n${WM}`)
    const user = m.mentionedJid[0]
    warns[user] = (warns[user] || 0) + 1
    reply(boxMenu('WARN', [`@${user.split('@')[0]} warned. Total: ${warns[user]}/3`]) + `\n${WM}`, { mentions: [user] })
}

if (cmd === 'warnings') {
    const user = m.mentionedJid[0] || sender
    reply(boxMenu('WARNINGS', [`@${user.split('@')[0]}: ${warns[user] || 0} warns`]) + `\n${WM}`, { mentions: [user] })
}

// ============ KICKALL / PROMOTEALL / DEMOTEALL ============
if (cmd === 'kickall') {
    if(!isAdmin(from)) return reply(boxMenu('ERROR', [`Only owner`]) + `\n${WM}`)
    const meta = await sock.groupMetadata(from)
    const members = meta.participants.filter(p =>!p.admin).map(p => p.id)
    await sock.groupParticipantsUpdate(from, members, 'remove')
    reply(boxMenu('KICKALL', [`Kicked ${members.length} members`]) + `\n${WM}`)
      }

                  
import axios from 'axios'
const WM = config.watermark
const LOVABLE_URL = config.apiKeys.lovable // your lovable AI endpoint

async function askAI(prompt, model = 'gpt-4') {
    try {
        const res = await axios.post(LOVABLE_URL, {
            model: model,
            messages: [{ role: 'user', content: prompt }]
        })
        return res.data.reply || res.data.response || 'No response'
    } catch(e) {
        return `AI Error: ${e.message}`
    }
}

// ============ MAIN AI COMMANDS ============
if (['ai','chatgpt','gpt3','gpt4','gpt5','gemini','claude','bard','copilot','grok','deepseek','lovable','meta','brain'].includes(cmd)) {
    const prompt = args.join(' ')
    if(!prompt) return reply(boxMenu('AI', [`Usage: ${PREFIX}${cmd} <your question>`]) + `\n${WM}`)

    reply(boxMenu('AI THINKING', [`Model: ${cmd.toUpperCase()}`, `Query: ${prompt}`]) + `\n${WM}`)
    const response = await askAI(prompt, cmd)
    reply(boxMenu(cmd.toUpperCase(), [response]) + `\n${WM}`)
}

// ============ WRITING TOOLS ============
if (cmd === 'write' || cmd === 'story') {
    const topic = args.join(' ')
    const res = await askAI(`Write a creative story about: ${topic}`, 'gpt-4')
    reply(boxMenu('STORY', [res]) + `\n${WM}`)
}

if (cmd === 'essay') {
    const topic = args.join(' ')
    const res = await askAI(`Write a 500 word essay about: ${topic}`, 'gpt-4')
    reply(boxMenu('ESSAY', [res]) + `\n${WM}`)
}

if (cmd === 'code') {
    const lang = args[0] || 'javascript'
    const task = args.slice(1).join(' ')
    const res = await askAI(`Write ${lang} code for: ${task}`, 'gpt-4')
    reply(boxMenu('CODE', [res]) + `\n${WM}`)
}

if (cmd === 'explain') {
    const topic = args.join(' ')
    const res = await askAI(`Explain this in simple terms: ${topic}`, 'gpt-4')
    reply(boxMenu('EXPLAIN', [res]) + `\n${WM}`)
}

if (cmd === 'summarize') {
    const text = m.quoted? m.quoted.text : args.join(' ')
    const res = await askAI(`Summarize this: ${text}`, 'gpt-4')
    reply(boxMenu('SUMMARY', [res]) + `\n${WM}`)
}

if (cmd === 'rephrase') {
    const text = args.join(' ')
    const res = await askAI(`Rephrase this: ${text}`, 'gpt-4')
    reply(boxMenu('REPHRASE', [res]) + `\n${WM}`)
}

if (cmd === 'grammar') {
    const text = args.join(' ')
    const res = await askAI(`Fix grammar and improve this: ${text}`, 'gpt-4')
    reply(boxMenu('GRAMMAR', [res]) + `\n${WM}`)
}

// ============ FUN AI ============
if (cmd === 'airoast') {
    const target = m.mentionedJid[0] || sender
    const res = await askAI(`Roast this person playfully: ${target}`, 'gpt-4')
    reply(boxMenu('AI ROAST', [res]) + `\n${WM}`, { mentions: })
}

if (cmd === 'girlfriend' || cmd === 'boyfriend') {
    const prompt = args.join(' ') || 'talk to me'
    const res = await askAI(`You are a ${cmd} AI. Be caring and flirty. User says: ${prompt}`, cmd)
    reply(boxMenu(cmd.toUpperCase(), [res]) + `\n${WM}`)
}

if (cmd === 'character') {
    const char = args[0] || 'goku'
    const prompt = args.slice(1).join(' ')
    const res = await askAI(`Act as ${char}. ${prompt}`, 'gpt-4')
    reply(boxMenu(char.toUpperCase(), [res]) + `\n${WM}`)
}

// ============ HELP AI ============
if (cmd === 'advice') {
    const problem = args.join(' ')
    const res = await askAI(`Give practical advice for: ${problem}`, 'gpt-4')
    reply(boxMenu('ADVICE', [res]) + `\n${WM}`)
}

if (cmd === 'motivate') {
    const res = await askAI(`Give me a motivational quote and speech`, 'gpt-4')
    reply(boxMenu('MOTIVATION', [res]) + `\n${WM}`)
}

if (cmd === 'therapist') {
    const problem = args.join(' ')
    const res = await askAI(`You are a supportive therapist. Listen and give advice for: ${problem}`, 'gpt-4')
    reply(boxMenu('THERAPIST', [res]) + `\n${WM}`)
}

if (cmd === 'study') {
    const subject = args.join(' ')
    const res = await askAI(`Teach me about ${subject} like I'm a student. Give examples`, 'gpt-4')
    reply(boxMenu('STUDY', [res]) + `\n${WM}`)
}

// ============ MEDIA AI ============
if (cmd === 'sora' || cmd === 'aivideo') {
    const prompt = args.join(' ')
    reply(boxMenu('AI VIDEO', [`Generating video: ${prompt}`, `Note: Connect to Sora/Lovable video API`]) + `\n${WM}`)
}

if (cmd === 'suno' || cmd === 'aisong') {
    const prompt = args.join(' ')
    reply(boxMenu('AI SONG', [`Generating song: ${prompt}`, `Note: Connect to Suno API`]) + `\n${WM}`)
}

if (cmd === 'dolly') {
    const prompt = args.join(' ')
    reply(boxMenu('AI IMAGE', [`Generating image: ${prompt}`, `Note: Connect to DALL-E/Lovable image API`]) + `\n${WM}`)
}

  import fs from 'fs'
const WM = config.watermark

const dbFile = './database/economy.json'
if(!fs.existsSync('./database')) fs.mkdirSync('./database')
if(!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

let economy = JSON.parse(fs.readFileSync(dbFile))
const save = () => fs.writeFileSync(dbFile, JSON.stringify(economy, null, 2))

// init user
function getUser(id) {
    if(!economy[id]) economy[id] = {
        balance: 1000,
        xp: 0,
        level: 1,
        inventory: [],
        lastDaily: 0,
        lastWork: 0,
        lastWeekly: 0
    }
    return economy[id]
}

function addXP(id, amount) {
    let user = getUser(id)
    user.xp += amount
    user.level = Math.floor(user.xp / 100) + 1
    save()
}

// AI job generator
async function aiJob(type) {
    const jobs = {
        work: ['coding for a client', 'delivering food', 'mining crypto', 'streaming on tiktok', 'selling shoes'],
        fish: ['caught a golden fish', 'caught a shark', 'caught old shoes', 'caught 3 tilapia'],
        hunt: ['hunted a lion', 'hunted a deer', 'hunted a chicken', 'found nothing'],
        beg: ['a rich guy gave you', 'your mom gave you', 'AI dropped you']
    }
    return jobs[type][Math.floor(Math.random() * jobs[type].length)]
}

// ============ BALANCE ============
if (cmd === 'balance' || cmd === 'bal') {
    let user = getUser(sender)
    reply(boxMenu('BALANCE', [
        `Money: $${user.balance}`,
        `Level: ${user.level}`,
        `XP: ${user.xp}/100`
    ]) + `\n${WM}`)
}

// ============ DAILY / WEEKLY ============
if (cmd === 'daily') {
    let user = getUser(sender)
    if(Date.now() - user.lastDaily < 86400000) return reply(boxMenu('DAILY', [`Already claimed. Come back tomorrow`]) + `\n${WM}`)
    user.balance += 500
    user.lastDaily = Date.now()
    addXP(sender, 10)
    save()
    reply(boxMenu('DAILY', [`You claimed $500 + 10 XP`]) + `\n${WM}`)
}

if (cmd === 'weekly') {
    let user = getUser(sender)
    if(Date.now() - user.lastWeekly < 604800000) return reply(boxMenu('WEEKLY', [`Already claimed. Come back next week`]) + `\n${WM}`)
    user.balance += 2000
    user.lastWeekly = Date.now()
    addXP(sender, 50)
    save()
    reply(boxMenu('WEEKLY', [`You claimed $2000 + 50 XP`]) + `\n${WM}`)
}

// ============ WORK / FISH / HUNT / BEG ============
if (['work','fish','hunt','beg'].includes(cmd)) {
    let user = getUser(sender)
    if(Date.now() - user.lastWork < 60000) return reply(boxMenu('COOLDOWN', [`Wait 1 minute`]) + `\n${WM}`)

    const job = await aiJob(cmd)
    const earn = Math.floor(Math.random() * 300) + 100
    user.balance += earn
    user.lastWork = Date.now()
    addXP(sender, 5)
    save()

    reply(boxMenu(cmd.toUpperCase(), [`${job}`, `+ $${earn}`, `+ 5 XP`]) + `\n${WM}`)
}

// ============ ROB ============
if (cmd === 'rob') {
    let target = m.mentionedJid[0]
    if(!target) return reply(boxMenu('ROB', [`Tag someone to rob`]) + `\n${WM}`)
    let user = getUser(sender)
    let victim = getUser(target)

    if(Math.random() > 0.5){
        const stolen = Math.floor(victim.balance * 0.2)
        user.balance += stolen
        victim.balance -= stolen
        reply(boxMenu('ROB SUCCESS', [`Stole $${stolen} from @${target.split('@')[0]}`]) + `\n${WM}`, { mentions: })
    } else {
        const fine = 200
        user.balance -= fine
        reply(boxMenu('ROB FAILED', [`Caught! Paid $${fine} fine`]) + `\n${WM}`)
    }
    save()
}

// ============ SLOT / BET ============
if (cmd === 'slot') {
    let user = getUser(sender)
    const bet = parseInt(args[0]) || 100
    if(user.balance < bet) return reply(boxMenu('ERROR', [`Not enough money`]) + `\n${WM}`)

    const symbols = ['🍒','🍋','💎','7️⃣','🍀']
    const roll = [symbols[Math.floor(Math.random()*5)], symbols[Math.floor(Math.random()*5)], symbols[Math.floor(Math.random()*5)]]

    if(roll[0] === roll[1] && roll[1] === roll[2]){
        user.balance += bet * 3
        reply(boxMenu('SLOT JACKPOT', [`${roll.join(' ')}`, `Won $${bet*3}`]) + `\n${WM}`)
    } else {
        user.balance -= bet
        reply(boxMenu('SLOT', [`${roll.join(' ')}`, `Lost $${bet}`]) + `\n${WM}`)
    }
    save()
}

// ============ PAY / GIFT ============
if (cmd === 'pay' || cmd === 'gift') {
    let target = m.mentionedJid[0]
    let amount = parseInt(args[1])
    if(!target ||!amount) return reply(boxMenu('PAY', [`Usage: ${PREFIX}pay @user amount`]) + `\n${WM}`)

    let user = getUser(sender)
    let targetUser = getUser(target)
    if(user.balance < amount) return reply(boxMenu('ERROR', [`Not enough money`]) + `\n${WM}`)

    user.balance -= amount
    targetUser.balance += amount
    save()
    reply(boxMenu('PAYMENT', [`Sent $${amount} to @${target.split('@')[0]}`]) + `\n${WM}`, { mentions: })
}

// ============ SHOP / BUY / SELL / INVENTORY ============
const shopItems = {
    'sword': 1000,
    'shield': 800,
    'potion': 200,
    'car': 5000,
    'house': 10000
}

if (cmd === 'shop') {
    let list = Object.entries(shopItems).map(([k,v]) => `${k} - $${v}`).join('\n')
    reply(boxMenu('SHOP', [list]) + `\n${WM}`)
}

if (cmd === 'buy') {
    let item = args[0]
    let user = getUser(sender)
    if(!shopItems[item]) return reply(boxMenu('ERROR', [`Item not in shop`]) + `\n${WM}`)
    if(user.balance < shopItems[item]) return reply(boxMenu('ERROR', [`Not enough money`]) + `\n${WM}`)

    user.balance -= shopItems[item]
    user.inventory.push(item)
    save()
    reply(boxMenu('BOUGHT', [`Bought ${item} for $${shopItems[item]}`]) + `\n${WM}`)
}

if (cmd === 'inventory' || cmd === 'inv') {
    let user = getUser(sender)
    reply(boxMenu('INVENTORY', [user.inventory.length? user.inventory.join(', ') : 'Empty']) + `\n${WM}`)
}

// ============ LEVEL / RANK / XP / CLAIM ============
if (cmd === 'level' || cmd === 'xp') {
    let user = getUser(sender)
    reply(boxMenu('LEVEL', [`Level: ${user.level}`, `XP: ${user.xp}/100`]) + `\n${WM}`)
}

if (cmd === 'rank') {
    let users = Object.entries(economy).sort((a,b) => b[1].balance - a[1].balance).slice(0,10)
    let rank = users.map(([id,i],n) => `${n+1}. @${id.split('@')[0]} - $${i.balance}`).join('\n')
    reply(boxMenu('TOP 10', [rank]) + `\n${WM}`)
}

if (cmd === 'claim') {
    addXP(sender, 20)
    reply(boxMenu('CLAIM', [`Claimed 20 XP from AI`]) + `\n${WM}`)
      }

  import { exec } from 'child_process'
import fs from 'fs'
import Jimp from 'jimp'

const WM = config.watermark
const OWNER = config.owner // ["263xxxxxx@s.whatsapp.net"]

const isOwner = OWNER.includes(sender)

// check owner first
if(!isOwner && ['eval','exec','broadcast','restart','shutdown','setprefix','setmode'].includes(cmd))
    return reply(boxMenu('OWNER', [`Only Owner`]) + `\n${WM}`)

// ============ EVAL / EXEC ============
if (cmd === 'eval') {
    const code = args.join(' ')
    try {
        let result = await eval(code)
        reply(boxMenu('EVAL', [`${result}`]) + `\n${WM}`)
    } catch(e) { reply(boxMenu('ERROR', [`${e}`]) + `\n${WM}`) }
}

if (cmd === 'exec') {
    const code = args.join(' ')
    exec(code, (err, stdout) => {
        if(err) return reply(boxMenu('ERROR', [`${err}`]) + `\n${WM}`)
        reply(boxMenu('EXEC', [`${stdout}`]) + `\n${WM}`)
    })
}

// ============ BROADCAST ============
if (cmd === 'broadcast' || cmd === 'bc') {
    const text = args.join(' ')
    const chats = Object.keys(await sock.chats)
    for(let chat of chats){
        await sock.sendMessage(chat, { text: boxMenu('BROADCAST', ) + `\n${WM}` })
    }
    reply(boxMenu('BROADCAST', [`Sent to ${chats.length} chats`]) + `\n${WM}`)
}

// ============ SETMODE: public, private, group, inbox ============
let MODE = 'public' // save in config.json
if (cmd === 'setmode') {
    const mode = args[0]
    if(!['public','private','group','inbox'].includes(mode))
        return reply(boxMenu('SETMODE', [`Options: public, private, group, inbox`]) + `\n${WM}`)

    MODE = mode
    fs.writeFileSync('./config.json', JSON.stringify({...config, mode: mode}, null, 2))
    reply(boxMenu('SETMODE', [
        `Mode: ${mode}`,
        `public = everyone`,
        `private = owner only`,
        `group = groups only`,
        `inbox = pm only`
    ]) + `\n${WM}`)
}

// ============ SETPREFIX ============
if (cmd === 'setprefix') {
    const prefix = args[0]
    fs.writeFileSync('./config.json', JSON.stringify({...config, prefix: prefix}, null, 2))
    reply(boxMenu('SETPREFIX', [`Prefix changed to: ${prefix}`]) + `\n${WM}`)
}

// ============ RESTART / SHUTDOWN ============
if (cmd === 'restart') {
    reply(boxMenu('RESTART', [`Restarting bot...`]) + `\n${WM}`)
    exec('pm2 restart SKYPER-MD') // or process.exit(1)
}

if (cmd === 'shutdown') {
    reply(boxMenu('SHUTDOWN', [`Shutting down...`]) + `\n${WM}`)
    process.exit()
}

// ============ JOIN / LEAVEGC ============
if (cmd === 'join') {
    const link = args[0]
    const code = link.split('chat.whatsapp.com/')[1]
    await sock.groupAcceptInvite(code)
    reply(boxMenu('JOIN', [`Joined group`]) + `\n${WM}`)
}

if (cmd === 'leavegc') {
    await sock.groupLeave(from)
    reply(boxMenu('LEAVE', [`Left group`]) + `\n${WM}`)
}

// ============ BLOCK / UNBLOCK ============
if (cmd === 'block') {
    const user = m.mentionedJid[0]
    await sock.updateBlockStatus(user, 'block')
    reply(boxMenu('BLOCK', [`Blocked @${user.split('@')[0]}`]) + `\n${WM}`)
}

if (cmd === 'unblock') {
    const user = m.mentionedJid[0]
    await sock.updateBlockStatus(user, 'unblock')
    reply(boxMenu('UNBLOCK', [`Unblocked @${user.split('@')[0]}`]) + `\n${WM}`)
}

// ============ SETBIO / SETNAMEBOT ============
if (cmd === 'setbio') {
    const bio = args.join(' ')
    await sock.updateProfileStatus(bio)
    reply(boxMenu('SETBIO', [`Bio updated`]) + `\n${WM}`)
}

if (cmd === 'setnamebot') {
    const name = args.join(' ')
    await sock.updateProfileName(name)
    reply(boxMenu('SETNAME', [`Name updated to ${name}`]) + `\n${WM}`)
}

// ============ SETPP / SETFULLPP / REMOVEPP ============
if (cmd === 'setpp' || cmd === 'setbotpic') {
    if(!m.quoted ||!m.quoted.imageMessage) return reply(boxMenu('SETPP', [`Reply to an image`]) + `\n${WM}`)
    const buffer = await sock.downloadMediaMessage(m.quoted)
    await sock.updateProfilePicture(sock.user.id, buffer)
    reply(boxMenu('SETPP', [`Profile picture updated`]) + `\n${WM}`)
}

if (cmd === 'setfullpp') {
    if(!m.quoted ||!m.quoted.imageMessage) return reply(boxMenu('SETFULLPP', [`Reply to an image`]) + `\n${WM}`)
    const buffer = await sock.downloadMediaMessage(m.quoted)
    const image = await Jimp.read(buffer)
    const size = Math.min(image.bitmap.width, image.bitmap.height)
    const square = image.crop((image.bitmap.width - size)/2, (image.bitmap.height - size)/2, size, size)
    const final = await square.getBufferAsync(Jimp.MIME_JPEG)
    await sock.updateProfilePicture(sock.user.id, final)
    reply(boxMenu('SETFULLPP', [`Full profile picture set. No crop`]) + `\n${WM}`)
}

if (cmd === 'removepp') {
    await sock.removeProfilePicture(sock.user.id)
    reply(boxMenu('REMOVEPP', [`Profile picture removed`]) + `\n${WM}`)
}

// ============ BACKUP / RESTORE ============
if (cmd === 'backup') {
    fs.copyFileSync('./database/economy.json', './backup/economy-backup.json')
    reply(boxMenu('BACKUP', [`Database backed up`]) + `\n${WM}`)
}

if (cmd === 'restore') {
    fs.copyFileSync('./backup/economy-backup.json', './database/economy.json')
    reply(boxMenu('RESTORE', [`Database restored`]) + `\n${WM}`)
}

// ============ AUTOJOIN / AUTOLEAVE ============
if (cmd === 'autojoin') {
    config.autojoin =!config.autojoin
    reply(boxMenu('AUTOJOIN', [`${config.autojoin? 'ON' : 'OFF'}`]) + `\n${WM}`)
}

if (cmd === 'autoleave') {
    config.autoleave =!config.autoleave
    reply(boxMenu('AUTOLEAVE', [`${config.autoleave? 'ON' : 'OFF'}`]) + `\n${WM}`)
}

// ============ PAIR CODE ============
if (cmd === 'pair') {
    const number = args[0]
    const code = await sock.requestPairingCode(number)
    reply(boxMenu('PAIR CODE', [`Number: ${number}`, `Code: ${code}`]) + `\n${WM}`)
}

// ============ GIT / DEPLOYMENT BASED ============
if (cmd === 'update') {
    exec('git pull && npm install', (err, stdout) => {
        reply(boxMenu('UPDATE', [`${stdout}`]) + `\n${WM}`)
    })
      }


  import axios from 'axios'
const WM = config.watermark

// ============ QURAN ============
if (cmd === 'quran') {
    const surah = args[0] || '1' // default Al-Fatiha
    const ayah = args[1] || '1'

    try {
        const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.asad,en.pickthall`)
        const data = res.data

        let text = boxMenu('QURAN', [
            `Surah: ${data[0].surah.englishName} (${data[0].surah.name})`,
            `Ayah: ${data[0].numberInSurah}`,
            ``,
            `Arabic: ${data[0].text}`,
            `English 1: ${data[1].text}`,
            `English 2: ${data[2].text}`
        ]) + `\n${WM}`

        reply(text)
    } catch(e) {
        reply(boxMenu('ERROR', [`Surah ${surah} Ayah ${ayah} not found`]) + `\n${WM}`)
    }
}

// ============ BIBLE ============
if (cmd === 'bible') {
    const verse = args.join(' ') || 'John 3:16' // default

    try {
        const res = await axios.get(`https://bible-api.com/${encodeURIComponent(verse)}`)
        const data = res.data

        let text = boxMenu('BIBLE', [
            `Reference: ${data.reference}`,
            ``,
            `${data.text}`,
            ``,
            `Translation: ${data.translation_name}`
        ]) + `\n${WM}`

        reply(text)
    } catch(e) {
        reply(boxMenu('ERROR', [`Verse not found. Use format: John 3:16`]) + `\n${WM}`)
    }
}

// ============ PRAYER TIMES ============
if (cmd === 'prayer') {
    const city = args.join(' ') || 'Harare' // default to your location

    try {
        const res = await axios.get(`http://api.aladhan.com/v1/timesByCity?city=${city}&country=Zimbabwe&method=2`)
        const times = res.data.timings
        const date = res.data.date.readable

        let text = boxMenu('PRAYER TIMES', [
            `City: ${city}`,
            `Date: ${date}`,
            ``,
            `Fajr: ${times.Fajr}`,
            `Dhuhr: ${times.Dhuhr}`,
            `Asr: ${times.Asr}`,
            `Maghrib: ${times.Maghrib}`,
            `Isha: ${times.Isha}`
        ]) + `\n${WM}`

        reply(text)
    } catch(e) {
        reply(boxMenu('ERROR', [`City not found`]) + `\n${WM}`)
    }
}


  import fs from 'fs'
const WM = config.watermark

// Load settings
let BOT_SETTINGS = {
    darkeye: false,
    afk: {},
    mode: config.mode || 'public',
    prefix: config.prefix || '.',
    welcome: false,
    antilink: false,
    autojoin: false,
    autoleave: false
}
if(fs.existsSync('./database/settings.json'))
    BOT_SETTINGS = JSON.parse(fs.readFileSync('./database/settings.json'))

const saveSettings = () => fs.writeFileSync('./database/settings.json', JSON.stringify(BOT_SETTINGS, null, 2))

// ============ AFK ============
if (cmd === 'afk') {
    const reason = args.join(' ') || 'AFK'
    BOT_SETTINGS.afk[sender] = { reason, time: Date.now() }
    saveSettings()
    reply(boxMenu('AFK', [`You are now AFK`, `Reason: ${reason}`]) + `\n${WM}`)
}

// Check AFK on mention
sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if(msg.message?.extendedTextMessage?.contextInfo?.mentionedJid){
        for(let jid of msg.message.extendedTextMessage.contextInfo.mentionedJid){
            if(BOT_SETTINGS.afk[jid]){
                const time = Math.floor((Date.now() - BOT_SETTINGS.afk[jid].time) / 1000 / 60)
                reply(boxMenu('AFK', [`@${jid.split('@')[0]} is AFK`, `Reason: ${BOT_SETTINGS.afk[jid].reason}`, `For: ${time} minutes`]) + `\n${WM}`, { mentions: })
            }
        }
    }
    // remove afk when user talks
    if(BOT_SETTINGS.afk[sender]) {
        delete BOT_SETTINGS.afk[sender]
        saveSettings()
        reply(boxMenu('WELCOME BACK', [`You are no longer AFK`]) + `\n${WM}`)
    }
})

// ============ POLL ============
if (cmd === 'poll') {
    const question = args[0]
    const options = args.slice(1)
    if(!question || options.length < 2) return reply(boxMenu('POLL', [`Usage: ${PREFIX}poll question option1 option2 option3`]) + `\n${WM}`)

    await sock.sendMessage(from, {
        poll: {
            name: question,
            values: options,
            selectableCount: 1
        }
    }, { quoted: m })
}

// ============ MODE ============
if (cmd === 'mode') {
    const mode = args[0]
    if(!['public','private','group','inbox'].includes(mode))
        return reply(boxMenu('MODE', [`Current: ${BOT_SETTINGS.mode}`, `Options: public, private, group, inbox`]) + `\n${WM}`)

    BOT_SETTINGS.mode = mode
    saveSettings()
    reply(boxMenu('MODE', [`Bot mode changed to: ${mode}`]) + `\n${WM}`)
}

// ============ DARKEYE VOICE MODE ============
if (cmd === 'darkeye') {
    const state = args[0]
    if(state === 'on'){
        BOT_SETTINGS.darkeye = true
        saveSettings()
        reply(boxMenu('DARK EYE', [`Voice Mode: ON`, `Now say: "darkeye menu", "darkeye play alan walker"`]) + `\n${WM}`)
    } else if(state === 'off'){
        BOT_SETTINGS.darkeye = false
        saveSettings()
        reply(boxMenu('DARK EYE', [`Voice Mode: OFF`]) + `\n${WM}`)
    } else {
        reply(boxMenu('DARK EYE', [`Usage: ${PREFIX}darkeye on/off`, `Status: ${BOT_SETTINGS.darkeye? 'ON' : 'OFF'}`]) + `\n${WM}`)
    }
}

// DARK EYE LISTENER - checks voice messages
sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if(!BOT_SETTINGS.darkeye) return
    if(!msg.message?.audioMessage) return

    // Download voice note and transcribe - using Google Speech to Text
    const buffer = await sock.downloadMediaMessage(msg)
    // For now we use a simple keyword match. Connect to Whisper API for real STT
    const transcription = "darkeye menu" // replace with real STT result

    if(transcription.toLowerCase().startsWith('darkeye')){
        const command = transcription.toLowerCase().replace('darkeye ', '')
        await sock.sendMessage(msg.key.remoteJid, { text: `${BOT_SETTINGS.prefix}${command}` }, { quoted: msg })
    }
})

// ============ SETTINGS ============
if (cmd === 'settings' || cmd === 'darkeye settings') {
    let text = boxMenu('BOT SETTINGS', [
        `Prefix: ${BOT_SETTINGS.prefix}`,
        `Mode: ${BOT_SETTINGS.mode}`,
        `DarkEye Voice: ${BOT_SETTINGS.darkeye? 'ON' : 'OFF'}`,
        `AutoJoin: ${BOT_SETTINGS.autojoin? 'ON' : 'OFF'}`,
        `AutoLeave: ${BOT_SETTINGS.autoleave? 'ON' : 'OFF'}`,
        ``,
        `GROUP SETTINGS:`,
        `Welcome: ${BOT_SETTINGS.welcome? 'ON' : 'OFF'}`,
        `Antilink: ${BOT_SETTINGS.antilink? 'ON' : 'OFF'}`,
        ``,
        `COMMANDS TO CHANGE:`,
        `.setprefix <prefix>`,
        `.setmode <public/private/group/inbox>`,
        `.darkeye on/off`,
        `.welcome on/off`,
        `.antilink on/off`
    ]) + `\n${WM}`

    reply(text)
      }

  startbot()  

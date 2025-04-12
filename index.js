{\rtf1\ansi\ansicpg1252\cocoartf2639
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;\f1\fnil\fcharset0 AppleColorEmoji;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const bodyParser = require('body-parser');\
const axios = require('axios');\
require('dotenv').config();\
\
const app = express();\
app.use(bodyParser.json());\
\
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;\
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;\
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;\
\
app.get('/', (req, res) => \{\
  res.send('IG Webhook is live 
\f1 \uc0\u9989 
\f0 ');\
\});\
\
app.get('/webhook', (req, res) => \{\
  const mode = req.query['hub.mode'];\
  const token = req.query['hub.verify_token'];\
  const challenge = req.query['hub.challenge'];\
\
  if (mode === 'subscribe' && token === VERIFY_TOKEN) \{\
    console.log('Webhook verified 
\f1 \uc0\u55357 \u56592 
\f0 ');\
    res.status(200).send(challenge);\
  \} else \{\
    res.sendStatus(403);\
  \}\
\});\
\
app.post('/webhook', async (req, res) => \{\
  try \{\
    const entry = req.body.entry[0];\
    const messaging = entry.messaging || entry.changes?.[0]?.value;\
\
    const senderId = messaging?.sender?.id || messaging?.from?.id;\
    const messageText = messaging?.message?.text || messaging?.messages?.[0]?.text;\
\
    if (senderId && messageText) \{\
      const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', \{\
        model: 'gpt-3.5-turbo',\
        messages: [\{ role: 'user', content: messageText \}]\
      \}, \{\
        headers: \{\
          Authorization: `Bearer $\{OPENAI_API_KEY\}`\
        \}\
      \});\
\
      const reply = gptRes.data.choices[0].message.content;\
\
      await axios.post(`https://graph.facebook.com/v18.0/me/messages`, \{\
        recipient: \{ id: senderId \},\
        message: \{ text: reply \}\
      \}, \{\
        params: \{ access_token: PAGE_ACCESS_TOKEN \}\
      \});\
\
      res.sendStatus(200);\
    \} else \{\
      res.sendStatus(200);\
    \}\
  \} catch (error) \{\
    console.error('Webhook Error:', error.message);\
    res.sendStatus(500);\
  \}\
\});\
\
const PORT = process.env.PORT || 3000;\
app.listen(PORT, () => console.log(`Webhook server running on port $\{PORT\}`));\
}

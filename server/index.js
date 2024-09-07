const express = require('express');
const path = require('path');
const dotenv = require('dotenv'); 
dotenv.config();
const session = require('express-session');
// var cookies = require("cookie-parser");
const axios = require('axios');
const bodyParser = require('body-parser');
const { Readable } = require('stream');
const MODEL_NAME = "gemini-1.0-pro";

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_KEY;
const app = express();


// app.use(bodyParser.json());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'client')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow these HTTP methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow these headers
  next();
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
})

app.get('/testing', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'amongus.html'));
})

const cors = require('cors');
app.use(cors());

const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

const ping = (req, resp) => {
  resp.send({message: 'pong'});
}

app.options('*', cors());
app.get('/ping', nocache, ping)

// app.post('/generate-text', async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     const response = await model.generateContent(prompt);
//     console.log(response);
//     res.json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error generating text' });
//   }
// });

app.post('/generate-text', async (req, res) => {
  console.log("generate text");
  try {
    const { prompt } = req.body;
    const response = await runChat();
    console.log(response);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errror generating text' });
  }
});

async function runChat() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
    ],
  });

  const result = await chat.sendMessage("give me a fantasy picture story on a boy and a dragon");
  const response = result.response;
  console.log(response.text());
}



app.get('*', function(req, res){
    res.status(404).sendFile(path.join(__dirname, '..', 'client', 'error.html'));
});


module.exports = app
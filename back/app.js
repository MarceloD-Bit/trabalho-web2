const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // permite JSON no body das requisições

// Conexão com MongoDB
const uri = "mongodb+srv://carlos:6wwZ.xRVCCpkemk@web.xkpyt8m.mongodb.net/?retryWrites=true&w=majority&appName=Web";
const client = new MongoClient(uri);
let gamesCollection;

async function conectarMongo() {
  try {
    await client.connect();
    const db = client.db('edugames'); // você pode mudar o nome do banco
    gamesCollection = db.collection('games'); // coleção onde os jogos serão salvos
    console.log('✅ Conectado ao MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error);
  }
}
conectarMongo();

// Rota POST para salvar o jogo
app.post('/api/games', async (req, res) => {
  try {
    const novoJogo = req.body;

    if (!novoJogo || !novoJogo.title || !novoJogo.type || !novoJogo.data) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Gerar código de compartilhamento simples (ex: 6 letras aleatórias)
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    novoJogo.shareCode = shareCode;
    novoJogo.createdAt = new Date();

    const resultado = await gamesCollection.insertOne(novoJogo);
    res.status(201).json({ message: 'Jogo salvo com sucesso', shareCode, id: resultado.insertedId });
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota GET para retornar todos os jogos
app.get('/api/games', async (req, res) => {
  try {
    const allGames = await gamesCollection.find().toArray();
    // Mapear _id para id (string)
    const games = allGames.map(g => ({
      ...g,
      id: g._id.toString(),
    }));
    res.json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

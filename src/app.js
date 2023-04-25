import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import userRouter from './routes/user.routes.js'
import walletRouter from './routes/wallet.routes.js'



// Criação do servidor
const app = express()

// Configurações
app.use(express.json())
app.use(cors())
app.use(userRouter)
app.use(walletRouter)
dotenv.config()

// Setup do Banco de Dados (Comando para rodar mongo = mongod --dbpath ~/.mongo)
const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
    await mongoClient.connect();
    console.log("MongoDB conectado");
} catch (err) {
    console.log(err.message);
}

const db = mongoClient.db();
export default db

// Deixa o app escutando, à espera de requisições
app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
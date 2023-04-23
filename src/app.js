import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from 'joi'
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs"


// Criação do servidor
const app = express()

// Configurações
app.use(express.json())
app.use(cors())
dotenv.config()

// Setup do Banco de Dados (Comando para rodar mongo = mongod --dbpath ~/.mongo)
let db
const mongoClient = new MongoClient(process.env.DATABASE_URL)
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))

// Endpoints
app.post("/cadastro", async (req, res) => {
    const {name,email,password} = req.body
    // Schema 
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(3).required()
      });

    const hash = bcrypt.hashSync(password, 10);
    const user = {name,email,password:hash}
    
    // Validacao JOI  
    const validation = userSchema.validate(user, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try{
    const seek = await db.collection("cadastro").findOne({email:email})
    if (seek) return res.status(409).send("Este email ja foi cadastrado")
    await db.collection("cadastro").insertOne(user)
    res.sendStatus(201)
    } catch (err) {
    return res.status(500).send(err.message);
    }
})
app.get("/cadastro", async (req, res) => {
            
    try{
        const lista = await db.collection("cadastro").find().toArray()
        res.status(200).send(lista)
    } catch (err) {
        return res.status(500).send(err.message);
    }
})

app.post("/", async (req, res) => {
    const {email,password} = req.body
    
    // Schema  
    const loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(3).required()
      });
    const login = {email,password}

    // Validacao JOI 
    const validation = loginSchema.validate(login, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try{
       const user = await db.collection("cadastro").findOne({email:email})
       if (!user) return res.status(404).send("Email nao cadastrado")
       if (!bcrypt.compareSync(password, user.password)) return res.status(401).send("Senha incorreta, verifique sua senha")
       const token = uuid();
       await db.collection("logins").insertOne({id:user._id,token:token}) 
       res.status(200).send(token)
    } catch (err) {
    return res.status(500).send(err.message);
    }
})
app.post("/nova-transacao/:tipo", async (req, res) => {
    const { authorization } = req.headers
    const {valor,descricao,data} = req.body
    const tipo = req.params.tipo;
    const token = authorization?.replace('Bearer ', '');
    if(!token) return res.sendStatus(401);
    
    // Schema
    const tarefaSchema = joi.object({
        valor: joi.number().required(),
        descricao: joi.string().required(), 
        tipo:joi.string().valid('entrada','saida').required(),
        data: joi.required() 
    });
    const tarefa = {valor,descricao,tipo,data:dayjs().format("DD/MM")}

    // Validacao JOI 
    const validation = tarefaSchema.validate(tarefa, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try{
        const valida = await db.collection("logins").findOne({token:token})
        if (!valida) return res.status(422).send("Token errado")
        const seekname = await db.collection("cadastro").findOne({_id:valida.id})
        console.log(seekname)
        await db.collection("tabela").insertOne({email:seekname.email,name:seekname.name,tipo,data:dayjs().format("DD/MM"),descricao,valor})
        res.status(200).send("OK");
    } catch (err) {
    return res.status(500).send(err.message);
    }
})

app.get("/home", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    if(!token) return res.sendStatus(401);
    try{
        const valida = await db.collection("logins").findOne({token:token})
        if (!valida) return res.status(422).send("Token errado")
        const lista = await db.collection("tabela").find().toArray()
        const seekemail = await db.collection("cadastro").findOne({_id:valida.id})
        const listafilter = lista.filter(lista => (lista.email === seekemail.email));
        console.log(listafilter)

        
        res.status(200).send(lista)
    } catch (err) {
        return res.status(500).send(err.message);
    }
})

// Deixa o app escutando, à espera de requisições
const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
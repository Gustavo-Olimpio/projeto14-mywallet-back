import bcrypt  from 'bcrypt'
import db from '../app.js'
import { v4 as uuid } from 'uuid';

export async function signUp(req,res){

    const {name,email,password} = req.body
    const hash = bcrypt.hashSync(password, 10);
    try{
    await db.collection("cadastro").insertOne({name,email,password:hash})
    res.sendStatus(201)
    } catch (err) {
    return res.status(500).send(err.message);
    }
}

export async function signIn(req,res){
    const {email} = req.body
    try{
        const user = await db.collection("cadastro").findOne({email:email})
        const token = uuid();
        await db.collection("logins").insertOne({id:user._id,token:token}) 
        const objeto = {token,nome:user.name}
        res.status(200).send(objeto)
     } catch (err) {
     return res.status(500).send(err.message);
     }

}





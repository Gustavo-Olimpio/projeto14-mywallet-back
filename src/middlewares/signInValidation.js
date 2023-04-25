import { loginSchema } from "../schemas/user.schema.js";
import db from "../app.js";
import bcrypt from 'bcrypt'

export default async function signInValidation(req, res, next) {
    const { email, password } = req.body
    // Validacao JOI 
    const validation = loginSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try {
        const user = await db.collection("cadastro").findOne({ email: email })
        if (!user) return res.status(404).send("Email nao cadastrado")
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).send("Senha incorreta, verifique sua senha")

    } catch (err) {
        return res.status(500).send(err.message);
    }
    next()
}
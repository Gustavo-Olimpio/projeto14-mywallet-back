import { userSchema } from "../schemas/user.schema.js";
import db from "../app.js";

export default async function signUpValidation(req, res, next) {
    const {email} = req.body
    const validation = userSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try {
        const seek = await db.collection("cadastro").findOne({ email: email })
        if (seek) return res.status(409).send("Este email ja foi cadastrado")
    } catch (err) {
        return res.status(500).send(err.message);
    }
    next()
}
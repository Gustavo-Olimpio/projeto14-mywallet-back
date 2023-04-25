import { walletSchema } from "../schemas/wallet.schema.js";
import dayjs from "dayjs";
import db from "../app.js";

export default async function walletValidation(req, res, next) {
    const { valor, descricao } = req.body
    const tipo = req.params.tipo;
    const tarefa = { valor, descricao, tipo, data: dayjs().format("DD/MM") }
    const validation = walletSchema.validate(tarefa, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    next()
}
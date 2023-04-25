import db from "../app.js";
import dayjs from "dayjs";

export async function wallet(req, res) {
    const { authorization } = req.headers
    const { valor, descricao } = req.body
    const tipo = req.params.tipo;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    try {
        const valida = await db.collection("logins").findOne({ token: token })
        if (!valida) return res.status(422).send("Token errado")
        const seekname = await db.collection("cadastro").findOne({ _id: valida.id })
        await db.collection("tabela").insertOne({ email: seekname.email, name: seekname.name, tipo, data: dayjs().format("DD/MM"), descricao, valor })
        res.status(200).send("OK");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function showWallet(req, res) {

    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);
    try {
        const valida = await db.collection("logins").findOne({ token: token })
        if (!valida) return res.status(422).send("Token errado")
        const lista = await db.collection("tabela").find().toArray()
        const seekemail = await db.collection("cadastro").findOne({ _id: valida.id })
        const listafilter = lista.filter(lista => (lista.email === seekemail.email));



        res.status(200).send(listafilter.reverse())
    } catch (err) {
        return res.status(500).send(err.message);
    }

}
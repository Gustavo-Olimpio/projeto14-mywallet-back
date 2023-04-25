import joi from 'joi'

export const walletSchema = joi.object({
    valor: joi.number().required(),
    descricao: joi.string().required(), 
    tipo:joi.string().valid('entrada','saida').required(),
    data: joi.required() 
});
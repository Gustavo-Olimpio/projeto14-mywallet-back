import { Router } from "express";
import walletValidation from "../middlewares/walletValidation.js";
import { showWallet, wallet } from "../controllers/wallet.controller.js";

const router= Router()

router.post("/nova-transacao/:tipo",walletValidation,wallet)
router.get("/home",showWallet)
export default router
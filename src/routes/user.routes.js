import { Router } from "express";
import { signIn, signUp } from "../controllers/user.controller.js";
import signUpValidation from "../middlewares/signUpValidation.js";
import signInValidation from "../middlewares/signInValidation.js";

const router = Router()

router.post("/cadastro",signUpValidation,signUp)
router.post("/",signInValidation,signIn)
export default router
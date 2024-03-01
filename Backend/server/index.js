const express = require("express")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const { registrarUsuario, verificarCredenciales, obtenerUsuario } = require("../utils/consultas")

const app = express()

app.use(express.json())
app.use(cors())

app.post('/usuarios', async (req, res) => {
    try {
        const usuario = req.body
        await registrarUsuario(usuario)
        console.log("Usuario registrado:", usuario.email)
        res.sendStatus(201)
    } catch (error) {
        console.error("Error al registrar usuario:", error)
        res.status(error.code || 500).send(error)
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        await verificarCredenciales(email, password)
        const token = jwt.sign({ email }, "az_AZ")
        console.log("Inicio de sesión exitoso para:", email)
        res.json({token})
    } catch (error) {
        console.error("Error al iniciar sesión:", error)
        res.status(error.code || 500).send(error)
    }
})

app.get("/usuarios", async (req, res) => {
    const token = req.headers.authorization
    if (!token) {
        return res.status(401).json({ error: "Token de autorización no proporcionado" })
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], "az_AZ")
        const { password, ...usuario } = await obtenerUsuario(decoded.email)

        if (usuario.error) {
            res.status(404).json({ error: "Usuario no encontrado" })
        } else {
            res.json(usuario)
        }
    } catch (error) {
        console.error("Error al obtener usuario:", error)
        res.status(500).json({ error: "Error interno del servidor" })
    }
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})

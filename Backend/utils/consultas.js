const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

dotenv.config()

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    allowExitOnIdle: true
})

const obtenerRegistroId = async () => {
    const consulta = "SELECT * FROM usuarios;"
    const { rows } = await pool.query(consulta)
    return rows
};

const registrarUsuario = async (usuario) => {
    try {
        let { email, password, rol, lenguage } = usuario
        const passwordEncriptada = bcrypt.hashSync(password)
        password = passwordEncriptada;
        const values = [email, passwordEncriptada, rol, lenguage]
        const consulta = "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING *;"
        await pool.query(consulta, values)
        console.log("Usuario registrado:", email)
    } catch (error) {
        console.log(error)
        return { code: 500, error }
    }
}

const verificarCredenciales = async (email, password) => {
    const values = [email]
    const consulta = "SELECT * FROM usuarios WHERE email = $1"
    const { rows: [usuario], rowCount } = await pool.query(consulta, values)

    if (rowCount === 0) {
        console.log('No se encontró registro con estos datos')
        throw { code: 401, message: "Email o contraseña incorrecta" }
    }

    const { password: passwordEncriptada } = usuario
    const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada)

    if (!passwordEsCorrecta) {
        throw { code: 401, message: "Email o contraseña incorrecta" }
    }
}

const obtenerUsuario = async (email) => {
    try {
        const consulta = "SELECT * FROM usuarios WHERE email = $1"
        const { rows } = await pool.query(consulta, [email])
        const usuario = rows[0]
        console.log('Usuario encontrado:', usuario)
        return usuario
    } catch (error) {
        console.error("Error al obtener usuario por Email:", error)
        throw error
    }
}

module.exports = { registrarUsuario, obtenerRegistroId, verificarCredenciales, obtenerUsuario };

import { Router } from "express";
import { Usuario } from "../../models/user.js";
import { encriptedString } from "../../config.js";

export const sessionRouterWeb = Router()

sessionRouterWeb.get('/login', (req, res) => {
    res.render('login', { titulo: 'Inicio de Sesión' })
})

sessionRouterWeb.post('/login', async (req, res) => {
    const { email, password } = req.body
    const usuario = await Usuario.findOne({ email }).lean()
    if (!usuario) { 
        const retryLogin = true
        return res.render('login', {retryLogin})
    }
    const chkPwd = encriptedString(usuario.salt, password)
    if (usuario.password != chkPwd) {
        const retryLogin = true
        return res.render('login', {retryLogin})
    }

    const userInfo = {
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        level: usuario.level
    }
    const isAdmin = (usuario.level === 'admin') ? true : false

    req.session['user'] = userInfo
    res.render('index', {titulo: 'Home', user: req.session['user'], isAdmin})
})

sessionRouterWeb.post('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.send('Algo salio mal')
        }
        res.redirect('/')
    })
})
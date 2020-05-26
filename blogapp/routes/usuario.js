const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', function(req, res){
    res.render('usuarios/registro')
})

router.post('/registro', function(req, res){
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome invalido'})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome pequeno'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email invalido'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha invalida'})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha pequena'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'As senhas nao correspondem'})
    }

    if(erros.length > 0){

        res.render('usuarios/registro', {erros: erros})

    }else{

        Usuario.findOne({email: req.body.email}).then(function(usuario){
            if(usuario){
                req.flash('error_msg', 'Ja existe uma conta com esse email no nosso sistema')
                res.redirect('/usuarios/registro')
            }else{
                
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, function(erro, salt){
                    bcrypt.hash(novoUsuario.senha, salt, function(erro, hash){
                        if(erro){
                            req.flash('error_msg', 'Houve um erro ao salvar o usuario')
                            res.redirect('/')
                        }else{

                            novoUsuario.senha = hash

                            novoUsuario.save().then(function(){
                                req.flash('success_msg', 'Usuario criado com sucesso')
                                res.redirect('/')
                            }).catch(function(erro){
                                req.flash('error_msg', 'Houve um erro ao criar o usuario')
                                res.redirect('/usuarios/registro')
                            })
                        }
                    })
                })
            }
        }).catch(function(erro){
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }
})

router.get('/login', function(req, res){
    res.render('usuarios/login')
})

router.post('/login', function(req, res, next){

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', function(req, res){
    req.logOut()
    req.flash('success', 'Deslogado com sucesso')
    res.redirect('/')
})

module.exports = router
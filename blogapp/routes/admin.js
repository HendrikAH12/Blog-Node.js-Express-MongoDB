const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, function(req, res){
    res.render('admin/index')
})

router.get('/posts', eAdmin, function(req, res){
    res.send('Pagina de posts')
})

router.get('/categorias', eAdmin, function(req, res){
    Categoria.find().lean().sort({date: 'desc'}).then(function(categorias){
        res.render('admin/categorias', {categorias: categorias})
    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, function(req, res){
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, function(req, res){
    
    var erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome invalido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome da categoria e muito pequeno'})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug invalido'})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(function(){
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect('/admin/categorias')
        }).catch(function(erro){
            req.flash('error_msg', 'Houve um erro ao salvar a categoria')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', eAdmin, function(req, res){
    Categoria.findOne({_id:req.params.id}).lean().then(function(categoria){
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch(function(erro){
        req.flash('error_msg', 'Essa categoria nao existe')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, function(req, res){
    Categoria.findOne({_id: req.body.id}).then(function(categoria){
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(function(){
            req.flash('success_msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')
        }).catch(function(erro){
            req.flash('error_msg', 'Houve um erro ao editar a categoria')
            res.redirect('/admin/categorias')
        })

    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', eAdmin, function(req, res){
    Categoria.remove({_id: req.body.id}).then(function(){
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, function(req, res){
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then(function(postagens){
        res.render('admin/postagens', {postagens: postagens})
    }).catch(function(erro){
        req.flash('error_msg', 'Erro ao listar as postagens')
        res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, function(req, res){
    Categoria.find().lean().then(function(categorias){
        res.render('admin/addpostagens', {categorias: categorias})
    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao carregar o formulario')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, function(req, res){
    var erros = []
    
    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria invalida, registre uma categoria primeiro'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagens', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(function(){
            req.flash('success_msg', 'Postagem criada com sucesso')
            res.redirect('/admin/postagens')
        }).catch(function(erro){
            req.flash('error_msg', 'Houve um erro ao salvar a postagem')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, function(req, res){
    
    Postagem.findOne({_id: req.params.id}).lean().then(function(postagem){

        Categoria.find().lean().then(function(categorias){
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch(function(erro){
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })


    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao carregar o formulario de edicao')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', eAdmin, function(req, res){

    Postagem.findOne({_id: req.body.id}).then(function(postagem){

        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(function(){
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch(function(erro){
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
        })

    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro ao salvar a edicao')
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar/:id', eAdmin, function(req, res){
    Postagem.remove({_id: req.params.id}).then(function(){
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch(function(erro){
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/admin/postagens')
    })
})

module.exports = router
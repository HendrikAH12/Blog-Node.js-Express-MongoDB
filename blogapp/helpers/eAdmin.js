module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }
        req.flash('error_msg', 'Voce precisa ser um Admin para acessar essa rota')
        res.redirect('/')
    }
}
module.exports = app => {  
    require('./utilisateur.routes')(app)
    require('./pollution.routes')(app)
}

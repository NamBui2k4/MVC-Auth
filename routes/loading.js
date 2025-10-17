const express = require('express')
const router = express.Router()

router.get('/loading', (req, res) =>{
    res.render('loading')
})

router.get('/', (req, res) =>{
    res.redirect('/loading')
})


// router.get('/home', () => {
//     res.render('index')
// })

module.exports = router

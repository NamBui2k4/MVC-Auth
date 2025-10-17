const User = require("../model/User");

const moveToLogin = (req, res) =>{
    res.render('loginView', {error: ""})
}

const handleLogin = (req, res) =>{
    const {email, pass} = req.body

    const user = User.getUser(email, pass)

    if (user){
        res.render('profile', {user})
    }else{
        res.render('loginView', {error : "thông tin đăng nhập không đúng"})
    }

}

const moveToSignin = (req, res) =>{
    res.render('signin')
}

module.exports = {
    moveToLogin,
    handleLogin,
    moveToSignin
}
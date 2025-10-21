const User = require("../model/User");

const moveToLogin = (req, res) =>{
    res.render('loginView', {error: ""})
}

const handleLogin = (req, res) =>{
    const {email, pass} = req.body

    const user = User.getUser(email, pass)

    if (user){
        req.session.user = user;  
        const sessionTTL = req.session.cookie.maxAge;  // Lấy thời gian còn lại trong session (ms)

        return res.render('profile', { user, sessionTTL });
    }else{
        res.render('loginView', {error : "thông tin đăng nhập không đúng"})

    }

}

const moveToSignin = (req, res) =>{
    res.render('signin')
}

const hangleSignin = (req, res) =>{
    
}

module.exports = {
    moveToLogin,
    handleLogin,
    moveToSignin
}
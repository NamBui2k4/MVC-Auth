const User = [
    {
        "email": "abc@gmail.com",
        "password": '123456'
    },
    {
        "email": "tri@gmail.com",
        "password": '123456'
    },
    {
        "email": "asz@gmail.com",
        "password": '123456'
    }
]

const getUser = (email, password) => {
    user = User.find(u => u.email === email && u.password === password);
    return user || null;
}

module.exports = { getUser }
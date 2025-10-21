# 🔐 Authentication with Express

Trong quá trình build một web application, authentication là rất quan trọng nhưng nếu tính năng này chỉ sơ sài ở mức độ password thì sẽ có rủi ro sẽ cũng như trải nghiệm người dung không mấy mượt mà. Sau đây mình xin trình bày một số cơ chế của Express bổ sung cho authentication.

## 🔶 1. Session & cookie

Cookie và Session là 2 cơ chế bổ sung xác thực người dùng khá quen thuộc. 

Nếu password dùng để xác thực danh tính một lần thì session & cookie sẽ giúp server nhận biết người dùng đã được xác thực trước đó. Điều này rất có lợi khi truy cập một trang web vì họ có thể duy trì trạng thái ghé thăm trang web mà không cần phải nhập lại nhiều lần.

|             |      <div style="display:flex; justify-content:center"> Đặc điểm chính <div>               |
| ----------- | ------------------------------------------------------------------------------------------ |
| **Cookie**  | Lưu ở phía **client** (trình duyệt). <br>Tự động gửi kèm mỗi request. <br> Có thể xem và chỉnh sửa. <br>|
| **Session** | Lưu ở **server** (RAM hoặc DB). <br> Có thời hạn nhất định cho một người dùng request.   |

- Session ở server sẽ nâng cao trải nghiệm người dùng (thông qua việc duy trì đăng nhập một lần, ghé thăm nhiều lần)

- Trong khi đó cookie sẽ giải quyết tình trạng server bị gánh nặng lưu trữ dữ liệu người dùng khổng lồ. Khi người dùng đăng nhập thành công, server sẽ tạo một Session và gửi lại Cookie chứa sessionID cho trình duyệt. Từ đó về sau, mỗi request tiếp theo đều tự động gửi cookie này để duy trì trạng thái đăng nhập.

## 🔷 2. Triển khai với Express

Cấu trúc dự án:

```
D:.
├── app.js
├── package.json
├── controllers/
│   └── authController.js
├── middlewares/
│   └── auth.js
├── model/
│   └── User.js
├── routes/
│   ├── loading.js
│   ├── login.js
│   ├── sigin.js
│   └── user.js
└── views/
    ├── loginView.ejs
    ├── profile.ejs
    ├── signin.ejs
    ├── loading.ejs
    └── error.ejs
```

Sơ đồ luồng dữ liệu:

```
                                  ┌────────────────────────────┐
                                  │      Browser (Client)      │
                                  │   http://localhost:3000    │
                                  │         http POST          │
                                  │     Login/signin form      │
                                  └─────────────┬──────────────┘
                                                │
                                                ▼
                              ┌────────────────────────────────────┐
                              │               app.js               │
                              │------------------------------------│
                              │  + express-session                 │
                              │  + cookie-parser                   │
                              │  + routing                         │
                              │        ↳ routes/login              │
                              │        ↳ routes/signin             │
                              │        ↳ routes/user               │
                              └─────────────────┬──────────────────┘
                                                │
                ┌───────────────────────────────┼────────────────────────────────┐
                ▼                               ▼                                ▼
        ┌────────────────┐              ┌───────────────────┐            ┌────────────────────┐
        │ (routes/login) │              │ (routes/signin)   │            │ (routes/user)      │
        └───────┬────────┘              └───────┬───────────┘            └─────────┬──────────┘
                │                               │                                  │
                ▼                               ▼                                  ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌──────────────────────────────┐
│ controller/authController.js|   │ controller/authController.js│   │    middleware/auth.js        |        
│-----------------------------│   │-----------------------------│   │------------------------------│
│ - moveToLogin()             │   │ - moveToSignin()            │   │ -  requireLogin()            │
│ - handleLogin()             │   │ - hangleSignin() (chờ)      │   │     ↳ Kiểm tra req session   │
│    ↳ Gọi model getUser      │   │    ↳ Render views\signin.ejs│   │     ↳ Redirect nếu chưa login│
│    ↳ Tạo req.session        │   └─────────────────────────────┘   └──────────────┬───────────────┘
│    ↳ Render profile.ejs     │                                                    ▼
│                             │                                         ┌─────────────────────┐
└───────────┬─────────────────┘                                         │ View (EJS Templates)│
            │                                                           │ - loginView.ejs     │
            ▼                                                           │ - profile.ejs       │  (2)
      ┌─────────────────────┐                                           │ - signin.ejs        │
      │ model/User.js       │                                           └─────────────────────┘
      │---------------------│
      │ - getUser(email, pw)│  (1)
      │   → return user/null│
      └─────────────────────┘
``` 

Code cơ bản:
```js
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

// --- Middlewares --- 
app.use(cookieParser()); // đọc và phân tích cookie gửi kèm trong mỗi request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ // khởi tạo phiên làm việc (session) cho từng người dùng
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // thời hạn cho phiên làm việc là 1h
  }
}));
```
Nhiều người có thể nghĩ rằng đoạn mã trên tự động đưa người dùng về /login khi kết thúc phiên nhưng không phải như vậy. Vì đó là logic được thực hiện bởi controller (hoặc middleware) chứ không phải của express-session. 

express-session chỉ làm 3 việc:
- Tạo session ID
- Lưu dữ liệu session (user, token, v.v.)
- Gắn lại session vào req.session mỗi lần client gửi request có cookie

Vậy controller sẽ làm gì ?

```js
// controller/authController.js
const handleLogin = (req, res) =>{
    const {email, pass} = req.body
    const user = User.getUser(email, pass)
    if (user){
        req.session.user = user;  
        const sessionTTL = req.session.cookie.maxAge;  // Lấy thời gian còn lại trong session (ms)
        return res.render('profile', { user, sessionTTL }); // xuất thời gian lên views
    }else{
        res.render('loginView', {error : "thông tin đăng nhập không đúng"})
    }
}
```

```html
<!-- views\profile.ejs -->
</script>
        const timeLimit = <%= sessionTTL %>; // 1 giờ
        <!-- chỗ này ngắn hơn file thực tế để dễ đọc code :v -->
        setTimeout(() =>{
            window.location.href = '/login'
        }, timeLimit + 2 * 1000)
</script>
```

- Controller sẽ nhúng thẳng biến `sessionTTL` lên views/profile.ejs
và nó chính là thời hạn còn lại trong phiên đăng nhập. Sau đó, script trong
view này được định nghĩa sao cho ngay khi người dùng hết phiên thì họ sẽ điều
hướng sang route '/login' để đăng nhập lại.

- Note: Ở đây mình truyền `timeLimit + 2 * 1000` thay vì `timeLimit` vì mình còn 2s cho hiệu ứng
  css với dòng chữ thông báo để người dùng biết. Đây là một cách để enhance trải nghiệm người dùng

Ở trường hợp khác, nếu người dùng chưa đăng nhập thì lúc này sẽ không có session được lưu lại.
Nhưng vấn đề là nếu họ truy cập http://localhost:3000/profiles thì lập tức vẫn sẽ vào được ngay
dữ liệu của server.

Đây là một rủi ro bảo mật. Và ta cần có cơ chế bảo vệ route. Ở đây ta sẽ kiểm tra session trước khi cho họ vào.

```js
// middlewares/auth.js
const requireLogin = (req, res, next) =>{
    if(req.session.user){
        return next(); //  ✅ Nếu user đã đăng nhập → cho phép đi tiếp tới controller
    }
    res.redirect("/login") // 🚫 Nếu chưa đăng nhập → quay lại /login
}
```

```js
// routes\user.js
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware.requireLogin, function(req, res, next) {
  res.render('profile')
});
```
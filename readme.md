# 🔶 1. Tổng quan về Cookie & Session

Session và Cookie là hai cơ chế quản lý trạng thái người dùng web app trong môi trường HTTP vốn "stateless" (Server không thể biết được 2 request có tới từ cùng 1 client hay không). Dù đều phục vụ mục đích lưu trữ thông tin tạm thời, chúng hoạt động ở hai tầng khác nhau: một bên là server, một bên là client. Dưới đây là cách hiểu dễ hình dung:


|             |                                Đặc điểm                            |
| ------------| ------------------------------------------------------------------ |
| **Cookie**  | - Lưu trữ ở phía client (browser) <br> - Lưu trữ dữ liệu nhỏ (thường là token hoặc sessionID) <br> - Client có thể xem và chỉnh sửa được (không an toàn cho dữ liệu nhạy cảm) <br> - Có thể tồn tại lâu dài tùy cấu hình <br> Tự động đính kèm trong mỗi HTTP request|
| **Session** | - Lưu trữ ở Server (RAM, Redis, MongoDB, …) <br> - Lưu trữ dữ liệu lớn (phiên người dùng, userID, role, giỏ hàng,...) <br> - Client không thấy dữ liệu thật <br> - Kết thúc khi timeout hoặc đóng trình duyệt |

# 🔷 2. Mô hình hoạt động cơ bản
```pgsql
               ┌─────────────────────────────┐
               │         Browser             │
               │ (Client - Người dùng)       │
               └────────────┬────────────────┘
                            │   ① Gửi request đăng nhập
                            ▼
             ┌──────────────────────────────┐
             │          Express App         │
             │ (Controller + Middleware)    │
             └────────────────┬─────────────┘
                              │
       ┌──────────────────────┼──────────────────────────┐
       │                      │                          │
       ▼                      ▼                          ▼
┌─────────────┐     ┌────────────────────┐     ┌──────────────────┐
│ cookieParser│     │ express-session    │     │  Database (User) │
│ middleware  │     │ middleware         │     │  hoặc Redis       │
└─────────────┘     └────────────────────┘     └──────────────────┘
```


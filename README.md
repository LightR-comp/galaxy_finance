# Galaxy Finance 🌌

Ứng dụng quản lý chi tiêu cá nhân với kiến trúc Frontend và Backend tách biệt, sử dụng Firebase Authentication để xác thực người dùng.

## 🎬 Video Demo
'NONE'

---

## 🛠 Hướng dẫn cài đặt môi trường (Environment Setup)

Dự án được chia thành 2 phần độc lập: `frontend` và `backend`. 

### Yêu cầu hệ thống:
- **Node.js** (Phiên bản 18.x trở lên)
- **Python** (Phiên bản 3.9 trở lên)
- Git

Clone dự án về máy:
```bash
git clone <Link_Repository_Của_Bạn>
cd galaxy-finance
```

---

## ⚙️ Hướng dẫn chạy Backend (FastAPI)

Backend sử dụng FastAPI và Firebase Admin SDK để xử lý API và xác thực.

**Bước 1:** Cài đặt các thư viện cần thiết
```bash
pip install -r requirements.txt
```

**Bước 2:** Khởi chạy server
```bash
cd backend
uvicorn main:app --reload --port 8000
```
*Backend sẽ chạy tại địa chỉ: `http://localhost:8000`*

---

## 💻 Hướng dẫn chạy Frontend (Next.js)

Frontend sử dụng React/Next.js để hiển thị giao diện tương tác với người dùng.

**Bước 1:** Mở một terminal mới và di chuyển vào thư mục frontend
```bash
cd frontend
```

**Bước 2:** Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

**Bước 3:** Cấu hình môi trường Firebase (Nếu có)
- Tạo file `.env` hoặc `.env.local` trong thư mục `frontend`.
- Thêm các cấu hình Firebase (API Key, Auth Domain, Project ID...) mà bạn sử dụng bên phía Client.

**Bước 4:** Khởi chạy ứng dụng
```bash
npm run dev
```
*Frontend sẽ chạy tại địa chỉ: `http://localhost:3000`*

---

## 🌟 Tính năng (Features)
- **Xác thực:** Đăng nhập/Đăng xuất bảo mật thông qua Firebase Authentication.
- **Quản lý giao dịch:** Thêm, xem và xóa các khoản thu/chi cá nhân.
- **Phân tích (Analytics):** Tự động thống kê tổng thu, tổng chi và số dư.
- **Ngân sách (Budgets):** Thiết lập ngân sách cho từng danh mục và theo dõi tiến độ chi tiêu.
```

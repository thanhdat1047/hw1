-- Tạo database (chạy lần đầu)
CREATE DATABASE IF NOT EXISTS userdb;
USE userdb;

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'User',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu
INSERT INTO users (name, email, role) VALUES
('Nguyễn Văn A', 'vana@example.com', 'Admin'),
('Trần Thị B', 'thib@example.com', 'User'),
('Lê Văn C', 'vanc@example.com', 'User'),
('Phạm Thị D', 'thid@example.com', 'Moderator'),
('Hoàng Văn E', 'vane@example.com', 'User'),
('Võ Thị F', 'thif@example.com', 'User'),
('Đặng Văn G', 'vang@example.com', 'Moderator'),
('Bùi Thị H', 'thih@example.com', 'User');

-- Kiểm tra dữ liệu
SELECT * FROM users;
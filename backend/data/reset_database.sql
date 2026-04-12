-- Script SQL Server để reset database
-- Chạy script này để xóa và tạo lại tất cả bảng với data mới

USE QuanLyThueTrangPhuc;
GO

-- Xóa bảng nếu tồn tại (thực hiện theo thứ tự phụ thuộc)
IF OBJECT_ID('DonThue', 'U') IS NOT NULL DROP TABLE DonThue;
IF OBJECT_ID('CauHinhPhat', 'U') IS NOT NULL DROP TABLE CauHinhPhat;
IF OBJECT_ID('NguoiDung', 'U') IS NOT NULL DROP TABLE NguoiDung;
IF OBJECT_ID('TrangPhuc', 'U') IS NOT NULL DROP TABLE TrangPhuc;
IF OBJECT_ID('KhachHang', 'U') IS NOT NULL DROP TABLE KhachHang;
GO

-- Bảng khách hàng
CREATE TABLE KhachHang (
  maKH NVARCHAR(20) PRIMARY KEY,
  tenKH NVARCHAR(100) NOT NULL,
  soDienThoai NVARCHAR(15) NOT NULL UNIQUE,
  diaChi NVARCHAR(255) DEFAULT ''
);
GO

-- Bảng trang phục
CREATE TABLE TrangPhuc (
  maTP NVARCHAR(20) PRIMARY KEY,
  tenTP NVARCHAR(100) NOT NULL,
  loaiTP NVARCHAR(50) DEFAULT '',
  giaThue DECIMAL(10,2) NOT NULL DEFAULT 0,
  size NVARCHAR(10) DEFAULT '',
  moTa NVARCHAR(500) DEFAULT '',
  hinhAnh NVARCHAR(255) DEFAULT '',
  trangThai NVARCHAR(20) DEFAULT N'Sẵn sàng'
);
GO

-- Bảng đơn thuê
CREATE TABLE DonThue (
  id NVARCHAR(20) PRIMARY KEY,
  invoiceNo NVARCHAR(20) NOT NULL UNIQUE,
  customer NVARCHAR(100) NOT NULL,
  phone NVARCHAR(15) NOT NULL,
  item NVARCHAR(100) NOT NULL,
  rentedAt NVARCHAR(20) NOT NULL,
  dueDate NVARCHAR(20) NOT NULL,
  status NVARCHAR(30) NOT NULL DEFAULT N'Chưa cọc đơn',
  deposit NVARCHAR(20) DEFAULT N'0đ',
  total NVARCHAR(20) DEFAULT N'0đ',
  hinhThucCoc NVARCHAR(50) DEFAULT '',
  chiTietCoc NVARCHAR(100) DEFAULT '',
  ghiChuGiayTo NVARCHAR(255) DEFAULT ''
);
GO

-- Bảng cấu hình phạt
CREATE TABLE CauHinhPhat (
  id INT PRIMARY KEY DEFAULT 1,
  tyLePhatQuaHan DECIMAL(5,2) DEFAULT 10,
  moTaQuyDinh NVARCHAR(500) DEFAULT '',
  trangThaiApDung BIT DEFAULT 1
);
GO

-- Bảng người dùng
CREATE TABLE NguoiDung (
  taiKhoan NVARCHAR(50) PRIMARY KEY,
  matKhau NVARCHAR(255) NOT NULL,
  vaiTro NVARCHAR(20) NOT NULL DEFAULT 'nhanvien'
);
GO

-- Seed data mới và sạch
INSERT INTO KhachHang (maKH, tenKH, soDienThoai, diaChi) VALUES
  (N'KH000001', N'Nguyễn Văn An', N'0912345678', N'123 Lê Lợi, TP.HCM'),
  (N'KH000002', N'Trần Thị Bình', N'0987654321', N'45 Nguyễn Huệ, Hà Nội'),
  (N'KH000003', N'Lê Minh Châu', N'0909111222', N'78 Trần Phú, Đà Nẵng'),
  (N'KH000004', N'Phạm Ngọc Ánh', N'0933222111', N''),
  (N'KH000005', N'Trần Minh Tuấn', N'0988776655', N'256 Võ Văn Tần, TP.HCM');
GO

INSERT INTO TrangPhuc (maTP, tenTP, loaiTP, giaThue, size, moTa, hinhAnh, trangThai) VALUES
  (N'TP000001', N'Áo dài truyền thống', N'Áo dài', 150000, N'M', N'Áo dài lụa cao cấp', N'/images/ao_dai.png', N'Sẵn sàng'),
  (N'TP000002', N'Vest nam lịch lãm', N'Vest', 200000, N'L', N'Vest đen sang trọng', N'/images/vest.jpeg', N'Sẵn sàng'),
  (N'TP000003', N'Váy dạ hội đỏ', N'Váy dạ hội', 300000, N'S', N'Váy dạ hội đỏ rực', N'/images/vay_da_hoi.jpg', N'Sẵn sàng'),
  (N'TP000004', N'Hanbok Hàn Quốc', N'Cosplay', 250000, N'M', N'Hanbok truyền thống', N'/images/hanbok.jpg', N'Sẵn sàng'),
  (N'TP000005', N'Áo dài cách tân xanh', N'Áo dài', 180000, N'S', N'Áo dài cách tân màu xanh lá', N'/images/ao_dai_xanh.png', N'Sẵn sàng'),
  (N'TP000006', N'Vest nữ trắng', N'Vest', 220000, N'M', N'Vest nữ màu trắng thanh lịch', N'/images/vest_nu.jpg', N'Sẵn sàng'),
  (N'TP000007', N'Đầm dự tiệc đen', N'Đầm', 280000, N'M', N'Đầm dự tiệc màu đen sang trọng', N'/images/dam_den.jpg', N'Sẵn sàng'),
  (N'TP000008', N'Áo khoác nam', N'Áo khoác', 190000, N'L', N'Áo khoác nam màu xám', N'/images/ao_khoac.jpg', N'Sẵn sàng');
GO

INSERT INTO DonThue (id, invoiceNo, customer, phone, item, rentedAt, dueDate, status, deposit, total, hinhThucCoc, chiTietCoc, ghiChuGiayTo) VALUES
  (N'1', N'HDT000001', N'Nguyễn Văn An', N'0912345678', N'Vest nam lịch lãm', N'13/04/2026', N'20/04/2026', N'Đang thuê', N'200.000đ', N'600.000đ', N'', N'', N''),
  (N'2', N'HDT000002', N'Trần Thị Bình', N'0987654321', N'Áo dài truyền thống', N'18/04/2026', N'26/04/2026', N'Chưa cọc đơn', N'0đ', N'450.000đ', N'', N'', N''),
  (N'3', N'HDT000003', N'Lê Minh Châu', N'0909111222', N'Váy dạ hội đỏ', N'01/04/2026', N'08/04/2026', N'Trễ hạn', N'300.000đ', N'900.000đ', N'', N'', N''),
  (N'4', N'HDT000004', N'Phạm Ngọc Ánh', N'0933222111', N'Vest nữ trắng', N'13/04/2026', N'22/04/2026', N'Đang thuê', N'0đ', N'440.000đ', N'Giấy tờ tùy thân', N'CCCD - 079204012345', N'CCCD - 079204012345');
GO

INSERT INTO CauHinhPhat (id, tyLePhatQuaHan, moTaQuyDinh, trangThaiApDung) VALUES
  (1, 10, N'Phí phạt 10%/ngày trên tổng giá trị đơn thuê.', 1);
GO

INSERT INTO NguoiDung (taiKhoan, matKhau, vaiTro) VALUES
  (N'admin', N'123456', N'chucuahang'),
  (N'nhanvien', N'123456', N'nhanvien'),
  (N'staff', N'123456', N'nhanvien');
GO

PRINT 'Database reset completed successfully!';
GO
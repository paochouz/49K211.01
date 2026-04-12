-- Xóa bảng nếu tồn tại (thực hiện theo thứ tự phụ thuộc)
DROP TABLE IF EXISTS DonThue;
DROP TABLE IF EXISTS CauHinhPhat;
DROP TABLE IF EXISTS NguoiDung;
DROP TABLE IF EXISTS TrangPhuc;
DROP TABLE IF EXISTS KhachHang;

-- Bảng khách hàng
CREATE TABLE KhachHang (
  maKH TEXT PRIMARY KEY,
  tenKH TEXT NOT NULL,
  soDienThoai TEXT NOT NULL UNIQUE,
  diaChi TEXT DEFAULT ''
);

-- Bảng trang phục
CREATE TABLE TrangPhuc (
  maTP TEXT PRIMARY KEY,
  tenTP TEXT NOT NULL,
  loaiTP TEXT DEFAULT '',
  giaThue NUMERIC NOT NULL DEFAULT 0,
  size TEXT DEFAULT '',
  moTa TEXT DEFAULT '',
  hinhAnh TEXT DEFAULT '',
  trangThai TEXT DEFAULT 'Sẵn sàng'
);

-- Bảng đơn thuê
CREATE TABLE DonThue (
  id TEXT PRIMARY KEY,
  invoiceNo TEXT NOT NULL UNIQUE,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  item TEXT NOT NULL,
  rentedAt TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Chưa cọc đơn',
  deposit TEXT DEFAULT '0đ',
  total TEXT DEFAULT '0đ',
  hinhThucCoc TEXT DEFAULT '',
  chiTietCoc TEXT DEFAULT '',
  ghiChuGiayTo TEXT DEFAULT ''
);

-- Bảng cấu hình phạt
CREATE TABLE CauHinhPhat (
  id INTEGER PRIMARY KEY DEFAULT 1,
  tyLePhatQuaHan NUMERIC DEFAULT 10,
  moTaQuyDinh TEXT DEFAULT '',
  trangThaiApDung BOOLEAN DEFAULT TRUE
);

-- Bảng người dùng
CREATE TABLE NguoiDung (
  taiKhoan TEXT PRIMARY KEY,
  matKhau TEXT NOT NULL,
  vaiTro TEXT NOT NULL DEFAULT 'nhanvien'
);

-- Seed data mới và sạch
INSERT INTO KhachHang (maKH, tenKH, soDienThoai, diaChi) VALUES
  ('KH000001','Nguyễn Văn An','0912345678','123 Lê Lợi, TP.HCM'),
  ('KH000002','Trần Thị Bình','0987654321','45 Nguyễn Huệ, Hà Nội'),
  ('KH000003','Lê Minh Châu','0909111222','78 Trần Phú, Đà Nẵng'),
  ('KH000004','Phạm Ngọc Ánh','0933222111',''),
  ('KH000005','Trần Minh Tuấn','0988776655','256 Võ Văn Tần, TP.HCM');

INSERT INTO TrangPhuc (maTP, tenTP, loaiTP, giaThue, size, moTa, hinhAnh, trangThai) VALUES
  ('TP000001','Áo dài truyền thống','Áo dài',150000,'M','Áo dài lụa cao cấp','/images/ao_dai.png','Sẵn sàng'),
  ('TP000002','Vest nam lịch lãm','Vest',200000,'L','Vest đen sang trọng','/images/vest.jpeg','Sẵn sàng'),
  ('TP000003','Váy dạ hội đỏ','Váy dạ hội',300000,'S','Váy dạ hội đỏ rực','/images/vay_da_hoi.jpg','Sẵn sàng'),
  ('TP000004','Hanbok Hàn Quốc','Cosplay',250000,'M','Hanbok truyền thống','/images/hanbok.jpg','Sẵn sàng'),
  ('TP000005','Áo dài cách tân xanh','Áo dài',180000,'S','Áo dài cách tân màu xanh lá','/images/ao_dai_xanh.png','Sẵn sàng'),
  ('TP000006','Vest nữ trắng','Vest',220000,'M','Vest nữ màu trắng thanh lịch','/images/vest_nu.jpg','Sẵn sàng'),
  ('TP000007','Đầm dự tiệc đen','Đầm',280000,'M','Đầm dự tiệc màu đen sang trọng','/images/dam_den.jpg','Sẵn sàng'),
  ('TP000008','Áo khoác nam','Áo khoác',190000,'L','Áo khoác nam màu xám','/images/ao_khoac.jpg','Sẵn sàng');

INSERT INTO DonThue (id, invoiceNo, customer, phone, item, rentedAt, dueDate, status, deposit, total, hinhThucCoc, chiTietCoc, ghiChuGiayTo) VALUES
  ('1','HDT000001','Nguyễn Văn An','0912345678','Vest nam lịch lãm','13/04/2026','20/04/2026','Đang thuê','200.000đ','600.000đ','','',''),
  ('2','HDT000002','Trần Thị Bình','0987654321','Áo dài truyền thống','18/04/2026','26/04/2026','Chưa cọc đơn','0đ','450.000đ','','',''),
  ('3','HDT000003','Lê Minh Châu','0909111222','Váy dạ hội đỏ','01/04/2026','08/04/2026','Trễ hạn','300.000đ','900.000đ','','',''),
  ('4','HDT000004','Phạm Ngọc Ánh','0933222111','Vest nữ trắng','13/04/2026','22/04/2026','Đang thuê','0đ','440.000đ','Giấy tờ tùy thân','CCCD - 079204012345','CCCD - 079204012345');

INSERT INTO CauHinhPhat (id, tyLePhatQuaHan, moTaQuyDinh, trangThaiApDung) VALUES
  (1, 10, 'Phí phạt 10%/ngày trên tổng giá trị đơn thuê.', TRUE);

INSERT INTO NguoiDung (taiKhoan, matKhau, vaiTro) VALUES
  ('admin','123456','chucuahang'),
  ('nhanvien','123456','nhanvien');

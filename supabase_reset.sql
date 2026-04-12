-- Migration: Reset database schema and data theo cấu trúc frontend cũ
-- Run this in Supabase SQL Editor

-- Xóa bảng nếu tồn tại (thực hiện theo thứ tự phụ thuộc)
DROP TABLE IF EXISTS chitietdonthue;
DROP TABLE IF EXISTS donthue;
DROP TABLE IF EXISTS cauhinhphat;
DROP TABLE IF EXISTS nguoidung;
DROP TABLE IF EXISTS trangphuc;
DROP TABLE IF EXISTS khachhang;

-- Bảng khách hàng
CREATE TABLE khachhang (
  makh TEXT PRIMARY KEY,
  tenkh TEXT NOT NULL,
  sodienthoai TEXT NOT NULL UNIQUE,
  diachi TEXT DEFAULT ''
);

-- Bảng trang phục
CREATE TABLE trangphuc (
  matp TEXT PRIMARY KEY,
  tentp TEXT NOT NULL,
  loaitp TEXT DEFAULT '',
  giathue NUMERIC NOT NULL DEFAULT 0,
  size TEXT DEFAULT '',
  mota TEXT DEFAULT '',
  hinhanh TEXT DEFAULT '',
  trangthai TEXT DEFAULT 'Sẵn sàng'
);

-- Bảng đơn thuê
CREATE TABLE donthue (
  madon TEXT PRIMARY KEY,
  sohoadon TEXT NOT NULL UNIQUE,
  makh TEXT NOT NULL,
  sodienthoai TEXT NOT NULL,
  taikhoannhanvien TEXT DEFAULT 'admin',
  hinhthuccoc TEXT DEFAULT '',
  ghichugiayto TEXT DEFAULT '',
  tiencoc NUMERIC DEFAULT 0,
  tongtienthue NUMERIC DEFAULT 0,
  phitratre NUMERIC DEFAULT 0,
  tongphatsinh NUMERIC DEFAULT 0,
  tienphaithutra NUMERIC DEFAULT 0,
  trangthaidon TEXT NOT NULL DEFAULT 'Chưa cọc',
  ngaytao TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết đơn thuê
CREATE TABLE chitietdonthue (
  id SERIAL PRIMARY KEY,
  madon TEXT NOT NULL,
  matp TEXT NOT NULL,
  ngaythue TEXT NOT NULL,
  ngaytradukien TEXT NOT NULL,
  trangthaitra TEXT DEFAULT 'Bình thường',
  phihuhong NUMERIC DEFAULT 0,
  FOREIGN KEY (madon) REFERENCES donthue(madon) ON DELETE CASCADE,
  FOREIGN KEY (matp) REFERENCES trangphuc(matp) ON DELETE CASCADE
);

-- Bảng cấu hình phạt
CREATE TABLE cauhinhphat (
  id INTEGER PRIMARY KEY DEFAULT 1,
  tylephatquahan NUMERIC DEFAULT 10,
  motaquydinh TEXT DEFAULT '',
  trangthaiapdung BOOLEAN DEFAULT TRUE
);

-- Bảng người dùng
CREATE TABLE nguoidung (
  taikhoan TEXT PRIMARY KEY,
  matkhau TEXT NOT NULL,
  vaitro TEXT NOT NULL DEFAULT 'nhanvien'
);

-- Seed data mới và sạch
INSERT INTO khachhang (makh, tenkh, sodienthoai, diachi) VALUES
  ('KH000001','Nguyễn Văn An','0912345678','123 Lê Lợi, TP.HCM'),
  ('KH000002','Trần Thị Bình','0987654321','45 Nguyễn Huệ, Hà Nội'),
  ('KH000003','Lê Minh Châu','0909111222','78 Trần Phú, Đà Nẵng'),
  ('KH000004','Phạm Ngọc Ánh','0933222111',''),
  ('KH000005','Trần Minh Tuấn','0988776655','256 Võ Văn Tần, TP.HCM');

INSERT INTO trangphuc (matp, tentp, loaitp, giathue, size, mota, hinhanh, trangthai) VALUES
  ('TP000001','Áo dài truyền thống','Áo dài',150000,'M','Áo dài lụa cao cấp','/images/ao_dai.png','Sẵn sàng'),
  ('TP000002','Vest nam lịch lãm','Vest',200000,'L','Vest đen sang trọng','/images/vest.jpeg','Sẵn sàng'),
  ('TP000003','Váy dạ hội đỏ','Váy dạ hội',300000,'S','Váy dạ hội đỏ rực','/images/vay_da_hoi.jpg','Sẵn sàng'),
  ('TP000004','Hanbok Hàn Quốc','Cosplay',250000,'M','Hanbok truyền thống','/images/hanbok.jpg','Sẵn sàng'),
  ('TP000005','Áo dài cách tân xanh','Áo dài',180000,'S','Áo dài cách tân màu xanh lá','/images/ao_dai_xanh.png','Sẵn sàng'),
  ('TP000006','Vest nữ trắng','Vest',220000,'M','Vest nữ màu trắng thanh lịch','/images/vest_nu.jpg','Sẵn sàng'),
  ('TP000007','Đầm dự tiệc đen','Đầm',280000,'M','Đầm dự tiệc màu đen sang trọng','/images/dam_den.jpg','Sẵn sàng'),
  ('TP000008','Áo khoác nam','Áo khoác',190000,'L','Áo khoác nam màu xám','/images/ao_khoac.jpg','Sẵn sàng');

INSERT INTO donthue (madon, sohoadon, makh, sodienthoai, taikhoannhanvien, hinhthuccoc, ghichugiayto, tiencoc, tongtienthue, phitratre, tongphatsinh, tienphaithutra, trangthaidon) VALUES
  ('HDT000001','HDT000001','KH000001','0912345678','admin','Tiền mặt/chuyển khoản',NULL,200000,600000,0,0,400000,'Đang thuê'),
  ('HDT000002','HDT000002','KH000002','0987654321','admin','Tiền mặt/chuyển khoản',NULL,0,450000,0,0,450000,'Chưa cọc'),
  ('HDT000003','HDT000003','KH000003','0909111222','admin','Tiền mặt/chuyển khoản',NULL,300000,900000,0,0,600000,'Trễ hạn'),
  ('HDT000004','HDT000004','KH000004','0933222111','admin','Giấy tờ tùy thân','CCCD - 079204012345',0,440000,0,0,440000,'Đang thuê');

INSERT INTO chitietdonthue (madon, matp, ngaythue, ngaytradukien, trangthaitra, phihuhong) VALUES
  ('HDT000001','TP000002','2026-04-13','2026-04-20','Bình thường',0),
  ('HDT000002','TP000001','2026-04-18','2026-04-26','Bình thường',0),
  ('HDT000003','TP000003','2026-04-01','2026-04-08','Bình thường',0),
  ('HDT000004','TP000006','2026-04-13','2026-04-22','Bình thường',0);

INSERT INTO cauhinhphat (id, tylephatquahan, motaquydinh, trangthaiapdung) VALUES
  (1, 10, 'Phí phạt 10%/ngày trên tổng giá trị đơn thuê.', TRUE);

INSERT INTO nguoidung (taikhoan, matkhau, vaitro) VALUES
  ('admin','123456','chucuahang'),
  ('nhanvien','123456','nhanvien'),
  ('staff','123456','nhanvien');

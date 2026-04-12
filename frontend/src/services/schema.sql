-- Bảng khách hàng
create table if not exists KhachHang (
  maKH text primary key,
  tenKH text not null,
  soDienThoai text not null unique,
  diaChi text default ''
);

-- Bảng trang phục
create table if not exists TrangPhuc (
  maTP text primary key,
  tenTP text not null,
  loaiTP text default '',
  giaThue numeric not null default 0,
  size text default '',
  moTa text default '',
  hinhAnh text default '',
  trangThai text default 'Sẵn sàng'
);

-- Bảng đơn thuê
create table if not exists DonThue (
  id text primary key,
  invoiceNo text not null unique,
  customer text not null,
  phone text not null,
  item text not null,
  rentedAt text not null,
  dueDate text not null,
  status text not null default 'Chưa cọc đơn',
  deposit text default '0đ',
  total text default '0đ',
  hinhThucCoc text default '',
  chiTietCoc text default '',
  ghiChuGiayTo text default ''
);

-- Bảng cấu hình phạt
create table if not exists CauHinhPhat (
  id int primary key default 1,
  tyLePhatQuaHan numeric default 10,
  moTaQuyDinh text default '',
  trangThaiApDung boolean default true
);

-- Bảng người dùng
create table if not exists NguoiDung (
  taiKhoan text primary key,
  matKhau text not null,
  vaiTro text not null default 'nhanvien'
);

-- Seed data
insert into KhachHang values
  ('KH000001','Nguyễn Văn An','0912345678','123 Lê Lợi, TP.HCM'),
  ('KH000002','Trần Thị Bình','0987654321','45 Nguyễn Huệ, Hà Nội'),
  ('KH000003','Lê Minh Châu','0909111222','78 Trần Phú, Đà Nẵng'),
  ('KH000004','Phạm Ngọc Ánh','0933222111','')
on conflict do nothing;

insert into TrangPhuc values
  ('TP000001','Áo dài truyền thống','Áo dài',150000,'M','Áo dài lụa cao cấp','/images/ao_dai.png','Sẵn sàng'),
  ('TP000002','Vest nam lịch lãm','Vest',200000,'L','Vest đen sang trọng','/images/vest.jpeg','Đang thuê'),
  ('TP000003','Váy dạ hội đỏ','Váy dạ hội',300000,'S','Váy dạ hội đỏ rực','/images/vay_da_hoi.jpg','Đang thuê'),
  ('TP000004','Hanbok Hàn Quốc','Cosplay',250000,'M','Hanbok truyền thống','/images/hanbok.jpg','Hư hỏng'),
  ('TP000005','Áo dài cách tân xanh','Áo dài',180000,'S','Áo dài cách tân màu xanh lá','/images/ao_dai_xanh.png','Sẵn sàng'),
  ('TP000006','Vest nữ trắng','Vest',220000,'M','Vest nữ màu trắng thanh lịch','/images/vest_nu.jpg','Đang thuê')
on conflict do nothing;

insert into DonThue values
  ('1','HDT000001','Nguyễn Văn An','0912345678','Vest nam lịch lãm','13/04/2026','20/04/2026','Đang thuê','200.000đ','600.000đ','','',''),
  ('2','HDT000002','Trần Thị Bình','0987654321','Áo dài truyền thống','18/04/2026','26/04/2026','Chưa cọc đơn','0đ','450.000đ','','',''),
  ('3','HDT000003','Lê Minh Châu','0909111222','Váy dạ hội đỏ','01/04/2026','08/04/2026','Trễ hạn','300.000đ','900.000đ','','',''),
  ('4','HDT000004','Phạm Ngọc Ánh','0933222111','Vest nữ trắng','13/04/2026','22/04/2026','Đang thuê','0đ','440.000đ','Giấy tờ tùy thân','CCCD - 079204012345','CCCD - 079204012345')
on conflict do nothing;

insert into CauHinhPhat values (1, 10, 'Phí phạt 10%/ngày trên tổng giá trị đơn thuê.', true)
on conflict do nothing;

insert into NguoiDung values
  ('admin','123456','chucuahang'),
  ('nhanvien','123456','nhanvien')
on conflict do nothing;

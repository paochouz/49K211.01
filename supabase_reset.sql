-- 1. XÓA CÁC BẢNG CŨ (Để tránh xung đột tên bảng cũ và mới)
DROP TABLE IF EXISTS chitietdonthue CASCADE;
DROP TABLE IF EXISTS donthue CASCADE;
DROP TABLE IF EXISTS trangphuc CASCADE;
DROP TABLE IF EXISTS khachhang CASCADE;
DROP TABLE IF EXISTS cauhinhphat CASCADE;
DROP TABLE IF EXISTS nguoidung CASCADE;

-- 2. TẠO CÁC BẢNG VỚI TÊN IN THƯỜNG (LOWERCASE)

-- Bảng người dùng
CREATE TABLE nguoidung (
    taikhoan text PRIMARY KEY,
    matkhau text NOT NULL,
    vaitro text NOT NULL DEFAULT 'nhanvien'
        CHECK (vaitro IN ('nhanvien', 'chucuahang'))
);

-- Bảng khách hàng
CREATE TABLE khachhang (
    makh text PRIMARY KEY,
    tenkh text NOT NULL,
    sodienthoai text NOT NULL UNIQUE,
    diachi text DEFAULT ''
);

-- Bảng trang phục
CREATE TABLE trangphuc (
    matp text PRIMARY KEY,
    tentp text NOT NULL,
    loaitp text DEFAULT '',
    giathue numeric NOT NULL DEFAULT 0 CHECK (giathue >= 0),
    size text DEFAULT '',
    mota text DEFAULT '',
    hinhanh text DEFAULT '',
    trangthai text DEFAULT 'Sẵn sàng'
        CHECK (trangthai IN ('Sẵn sàng', 'Đang thuê', 'Hư hỏng', 'Bảo trì', 'Ngưng sử dụng'))
);

-- Bảng cấu hình phạt
CREATE TABLE cauhinhphat (
    id serial PRIMARY KEY,
    tylephatphantram numeric NOT NULL CHECK (tylephatphantram > 0 AND tylephatphantram <= 100),
    motaquydinh text DEFAULT '',
    trangthaiapdung boolean NOT NULL DEFAULT true
);

-- Bảng đơn thuê
CREATE TABLE donthue (
    id text PRIMARY KEY, -- Cột ID vật lý để quản lý
    madon text NOT NULL UNIQUE, -- Mã đơn (InvoiceNo)
    makh text NOT NULL REFERENCES khachhang(makh),
    taikhoannhanvien text NOT NULL REFERENCES nguoidung(taikhoan),
    hinhthuccoc text NOT NULL DEFAULT 'Tien'
        CHECK (hinhthuccoc IN ('Tien', 'GiayTo')),
    tiencoc numeric NOT NULL DEFAULT 0,
    ghichugiayto text DEFAULT '',
    tongtienthue numeric NOT NULL DEFAULT 0,
    phitratre numeric NOT NULL DEFAULT 0,
    tongphatsinh numeric NOT NULL DEFAULT 0,
    tienphaithutra numeric NOT NULL DEFAULT 0,
    trangthaidon text NOT NULL DEFAULT 'Chua coc'
        CHECK (trangthaidon IN ('Chua coc', 'Dang thue', 'Da tra', 'Tre han')),
    ngaytao timestamp with time zone DEFAULT now(),
    ngaytrathucte date NULL
);

-- Bảng chi tiết đơn thuê
CREATE TABLE chitietdonthue (
    machitiet serial PRIMARY KEY,
    madon text NOT NULL REFERENCES donthue(madon) ON DELETE CASCADE,
    matp text NOT NULL REFERENCES trangphuc(matp),
    ngaythue date NOT NULL,
    ngaytradukien date NOT NULL,
    trangthaitra text NOT NULL DEFAULT 'Binh thuong'
        CHECK (trangthaitra IN ('Binh thuong', 'Hu hong', 'Mat')),
    phihuhong numeric NOT NULL DEFAULT 0,
    ghichuloi text DEFAULT ''
);

-- 3. CHÈN DỮ LIỆU MẪU (SEED DATA)

-- Chèn người dùng
INSERT INTO nguoidung (taikhoan, matkhau, vaitro) VALUES
('admin', '123456', 'chucuahang'),
('nhanvien', '123456', 'nhanvien');

-- Chèn khách hàng
INSERT INTO khachhang (makh, tenkh, sodienthoai, diachi) VALUES
('KH000001', 'Nguyễn Văn An', '0912345678', '123 Lê Lợi, TP.HCM'),
('KH000002', 'Trần Thị Bình', '0987654321', '45 Nguyễn Huệ, Hà Nội'),
('KH000003', 'Lê Minh Châu', '0909111222', '78 Trần Phú, Đà Nẵng'),
('KH000004', 'Phạm Ngọc Ánh', '0933222111', '');

-- Chèn trang phục
INSERT INTO trangphuc (matp, tentp, loaitp, giathue, size, mota, hinhanh, trangthai) VALUES
('TP000001', 'Áo dài truyền thống', 'Áo dài', 150000, 'M', 'Áo dài lụa cao cấp', '/images/ao_dai.png', 'Sẵn sàng'),
('TP000002', 'Vest nam lịch lãm', 'Vest', 200000, 'L', 'Vest đen sang trọng', '/images/vest.jpeg', 'Đang thuê'),
('TP000003', 'Váy dạ hội đỏ', 'Váy dạ hội', 300000, 'S', 'Váy dạ hội đỏ rực', '/images/vay_da_hoi.jpg', 'Đang thuê'),
('TP000004', 'Hanbok Hàn Quốc', 'Cosplay', 250000, 'M', 'Hanbok truyền thống', '/images/hanbok.jpg', 'Hư hỏng'),
('TP000005', 'Áo dài cách tân xanh', 'Áo dài', 180000, 'S', 'Áo dài cách tân màu xanh lá', '/images/ao_dai_xanh.png', 'Sẵn sàng'),
('TP000006', 'Vest nữ trắng', 'Vest', 220000, 'M', 'Vest nữ màu trắng thanh lịch', '/images/vest_nu.jpg', 'Đang thuê');

-- Chèn cấu hình phạt
INSERT INTO cauhinhphat (tylephatphantram, motaquydinh, trangthaiapdung) VALUES 
(10, 'Phí phạt 10%/ngày trên tổng giá trị đơn thuê.', true);

-- Chèn đơn thuê (Lưu ý: Trạng thái dùng giá trị không dấu để khớp ràng buộc CHECK)
INSERT INTO donthue (id, madon, makh, taikhoannhanvien, hinhthuccoc, tiencoc, tongtienthue, trangthaidon, ngaytao) VALUES
('1', 'HDT000001', 'KH000001', 'admin', 'Tien', 200000, 600000, 'Dang thue', '2026-04-13'),
('2', 'HDT000002', 'KH000002', 'admin', 'Tien', 0, 450000, 'Chua coc', '2026-04-18'),
('3', 'HDT000003', 'KH000003', 'admin', 'Tien', 300000, 900000, 'Tre han', '2026-04-01'),
('4', 'HDT000004', 'KH000004', 'admin', 'GiayTo', 0, 440000, 'Dang thue', '2026-04-13');

-- Chèn CHI TIẾT ĐƠN THUÊ (Dữ liệu Thư cần bổ sung)
INSERT INTO chitietdonthue (madon, matp, ngaythue, ngaytradukien, trangthaitra, phihuhong, ghichuloi) VALUES
('HDT000001', 'TP000002', '2026-04-13', '2026-04-20', 'Binh thuong', 0, ''),
('HDT000002', 'TP000001', '2026-04-18', '2026-04-26', 'Binh thuong', 0, ''),
('HDT000003', 'TP000003', '2026-04-01', '2026-04-08', 'Binh thuong', 0, ''),
('HDT000004', 'TP000006', '2026-04-13', '2026-04-22', 'Binh thuong', 0, '');

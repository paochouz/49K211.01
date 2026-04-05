import * as sql from 'mssql';
import { Request, Response } from 'express';
import { getDb } from '../config/db';

export const createDonThue = async (req: Request, res: Response) => {
    // 1. Lấy đúng tên các biến từ Frontend gửi lên (Payload)
    const { 
        MaDon, MaKH, TaiKhoanNhanVien, HinhThucCoc, TienCoc, 
        GhiChuGiayTo, TongTienThue, PhiTraTre, TongPhatSinh, 
        TienPhaiThuTra, TrangThaiDon, Items 
    } = req.body;

    console.log("Dữ liệu nhận được:", JSON.stringify(req.body, null, 2));

    let transaction: sql.Transaction | null = null;

    try {
        const pool = getDb();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request = new sql.Request(transaction);

        // 2. VALIDATE cơ bản
        if (!MaDon || !MaKH) {
            throw new Error("thiếu Mã đơn hoặc Mã khách hàng rồi!");
        }

        // 3. INSERT vào bảng DonThue (Khớp 100% script SQL của bạn)
        await request
            .input('maDon', sql.VarChar(10), MaDon)
            .input('maKH', sql.VarChar(10), MaKH)
            .input('taiKhoanNV', sql.VarChar(50), TaiKhoanNhanVien || 'NV1') 
            .input('hinhThucCoc', sql.NVarChar(20), HinhThucCoc) // 'Tien' hoặc 'GiayTo'
            .input('tienCoc', sql.Decimal(12, 2), Number(TienCoc) || 0)
            .input('ghiChuGiayTo', sql.NVarChar(255), GhiChuGiayTo || '')
            .input('tongTienThue', sql.Decimal(14, 2), Number(TongTienThue) || 0)
            .input('phiTraTre', sql.Decimal(14, 2), Number(PhiTraTre) || 0)
            .input('tongPhatSinh', sql.Decimal(14, 2), Number(TongPhatSinh) || 0)
            .input('tienPhaiThuTra', sql.Decimal(14, 2), Number(TienPhaiThuTra) || 0)
            .input('trangThaiDon', sql.NVarChar(50), TrangThaiDon) // 'Chua coc', 'Dang thue'...
            .query(`
                INSERT INTO DonThue (
                    MaDon, MaKH, TaiKhoanNhanVien, HinhThucCoc, TienCoc, 
                    GhiChuGiayTo, TongTienThue, PhiTraTre, TongPhatSinh, 
                    TienPhaiThuTra, TrangThaiDon, NgayTao
                )
                VALUES (
                    @maDon, @maKH, @taiKhoanNV, @hinhThucCoc, @tienCoc, 
                    @ghiChuGiayTo, @tongTienThue, @phiTraTre, @tongPhatSinh, 
                    @tienPhaiThuTra, @trangThaiDon, GETDATE()
                )
            `);

        // 4. INSERT vào bảng ChiTietDonThue
        for (const item of Items) {
            const detailRequest = new sql.Request(transaction);
            
            // Ép kiểu ngày tháng về đúng định dạng DATE của SQL
            const ngayThue = new Date(item.NgayThue);
            const ngayTraDuKien = new Date(item.NgayTraDuKien);

            await detailRequest
                .input('maDon', sql.VarChar(10), MaDon)
                .input('maTP', sql.VarChar(10), item.MaTP)
                .input('ngayThue', sql.Date, ngayThue)
                .input('ngayTraDuKien', sql.Date, ngayTraDuKien)
                .input('trangThaiTra', sql.NVarChar(20), item.TrangThaiTra || 'Binh thuong')
                .input('phiHuHong', sql.Decimal(12, 2), Number(item.PhiHuHong) || 0)
                .query(`
                    INSERT INTO ChiTietDonThue 
                    (MaDon, MaTP, NgayThue, NgayTraDuKien, TrangThaiTra, PhiHuHong)
                    VALUES 
                    (@maDon, @maTP, @ngayThue, @ngayTraDuKien, @trangThaiTra, @phiHuHong)
                `);
        }

        await transaction.commit();
        console.log("Đã lưu đơn thành công:", MaDon);
        res.status(201).json({ message: "Lưu Database thành công!", MaDon });

    } catch (err: any) {
        console.error("❌ LỖI SQL:", err.message);
        if (transaction) await transaction.rollback();

        res.status(500).json({ 
            message: "Lỗi SQL: " + err.message,
            detail: "Kiểm tra lại xem MaKH/MaTP/TaiKhoan đã tồn tại trong DB chưa nhé!"
        });
    }
};

export const createKhachHang = async (req: Request, res: Response) => {
    // 1. Nhận đúng tên biến VIẾT HOA từ Frontend gửi qua
    const { MaKH, TenKH, SoDienThoai, DiaChi } = req.body; 

    try {
        const pool = getDb();
        const request = new sql.Request(pool);

        // 2. Khớp chính xác kiểu dữ liệu với SQL Gốc của Hiền
        await request
            .input('maKH', sql.VarChar(10), MaKH)       // Khớp VARCHAR(10)
            .input('tenKH', sql.NVarChar(100), TenKH)   // Khớp NVARCHAR(100)
            .input('sdt', sql.VarChar(10), SoDienThoai) // Khớp VARCHAR(10)
            .input('diaChi', sql.NVarChar(255), DiaChi || null) // Khớp NVARCHAR(255)
            .query(`
                INSERT INTO KhachHang (MaKH, TenKH, SoDienThoai, DiaChi)
                VALUES (@maKH, @tenKH, @sdt, @diaChi)
            `);

        res.status(201).json({ message: "Thành công rồi Hiền ơi!" });
    } catch (err: any) {
        // Dòng này sẽ hiện ĐÍCH DANH lỗi gì ở Terminal (ví dụ: Trùng khóa, quá dài...)
        console.error("❌ LỖI SQL THỰC TẾ:", err.message);
        res.status(500).json({ message: err.message });
    }
};
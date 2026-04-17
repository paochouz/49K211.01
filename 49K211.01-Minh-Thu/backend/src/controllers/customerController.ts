import { Request, Response } from 'express';
import { poolPromise } from '../config/db';
import sql from 'mssql';

// Lấy danh sách khách hàng từ SQL Server
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM KhachHang');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách", error });
    }
};

// Thêm khách hàng mới (Hiện thực US-06)
export const createCustomer = async (req: Request, res: Response) => {
    const { tenKH, soDienThoai, diaChi } = req.body;

    try {
        const pool = await poolPromise;

        // 1. Tự động tạo mã KH (Lấy số lớn nhất trong DB + 1)
        const lastKH = await pool.request().query('SELECT TOP 1 MaKH FROM KhachHang ORDER BY MaKH DESC');
        let newMaKH = 'KH000001';
        if (lastKH.recordset.length > 0) {
            const lastId = lastKH.recordset[0].MaKH;
            const nextNum = parseInt(lastId.replace('KH', '')) + 1;
            newMaKH = 'KH' + nextNum.toString().padStart(6, '0');
        }

        // 2. Kiểm tra trùng số điện thoại (Yêu cầu bắt buộc của US-06)
        const checkPhone = await pool.request()
            .input('sdt', sql.VarChar, soDienThoai)
            .query('SELECT MaKH FROM KhachHang WHERE SoDienThoai = @sdt');
        
        if (checkPhone.recordset.length > 0) {
            return res.status(400).json({ message: "Số điện thoại này đã tồn tại!" });
        }

        // 3. Thực hiện chèn dữ liệu vào bảng KhachHang [cite: 25-30]
        await pool.request()
            .input('MaKH', sql.VarChar, newMaKH)
            .input('TenKH', sql.NVarChar, tenKH)
            .input('SDT', sql.VarChar, soDienThoai)
            .input('DiaChi', sql.NVarChar, diaChi)
            .query('INSERT INTO KhachHang (MaKH, TenKH, SoDienThoai, DiaChi) VALUES (@MaKH, @TenKH, @SDT, @DiaChi)');

        res.status(201).json({ message: "Thêm thành công", maKH: newMaKH });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lưu khách hàng", error });
    }
};
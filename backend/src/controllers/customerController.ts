import type { Request, Response } from "express";
import { getDb } from "../config/db";
import sql from "mssql";

// 1. LẤY DANH SÁCH KHÁCH HÀNG (Giữ nguyên)
export async function listCustomers(_req: Request, res: Response) {
  try {
    const pool = getDb();
    const result = await pool.request().query('SELECT * FROM KhachHang ORDER BY MaKH DESC');
    
    const data = result.recordset.map((item: any) => ({
      maKH: item.MaKH,
      tenKH: item.TenKH,
      soDienThoai: item.SoDienThoai,
      diaChi: item.DiaChi || ''
    }));

    res.json(data); 
  } catch (error: any) {
    res.status(500).json({ error: 'Lấy danh sách KH thất bại', message: error.message });
  }
}

// 2. API MỚI: LẤY MÃ KẾ TIẾP (Để đồng bộ với Frontend)
export async function getNextCustomerCode(_req: Request, res: Response) {
  try {
    const pool = getDb();
    const result = await pool.request().query('SELECT TOP 1 MaKH FROM KhachHang ORDER BY MaKH DESC');
    
    let nextCode = "KH000001"; 
    if (result.recordset.length > 0) {
      const lastId = result.recordset[0].MaKH; 
      const currentNumber = parseInt(lastId.replace('KH', ''));
      nextCode = `KH${(currentNumber + 1).toString().padStart(6, '0')}`;
    }
    
    res.json({ nextCode });
  } catch (error: any) {
    res.status(500).json({ error: 'Không lấy được mã mới' });
  }
}

// 3. TẠO KHÁCH HÀNG (SỬA: Nhận maKH từ Frontend gửi lên)
export async function createCustomer(req: Request, res: Response) {
  try {
    const { maKH, tenKH, soDienThoai, diaChi } = req.body; // Lấy maKH từ frontend
    const pool = getDb();

    // Kiểm tra trùng SĐT
    const checkPhone = await pool.request()
      .input('SĐT', sql.VarChar(10), soDienThoai)
      .query('SELECT MaKH FROM KhachHang WHERE SoDienThoai = @SĐT');
    
    if (checkPhone.recordset.length > 0) {
      return res.status(400).json({ message: "Số điện thoại này đã tồn tại trong hệ thống!" });
    }

    // Insert với đúng mã maKH đã hiển thị ở Frontend
    await pool.request()
      .input('MaKH', sql.VarChar(10), maKH)
      .input('TenKH', sql.NVarChar(100), tenKH)
      .input('SoDienThoai', sql.VarChar(10), soDienThoai)
      .input('DiaChi', sql.NVarChar(255), diaChi || '')
      .query(`
        INSERT INTO KhachHang (MaKH, TenKH, SoDienThoai, DiaChi) 
        VALUES (@MaKH, @TenKH, @SoDienThoai, @DiaChi)
      `);
    
    res.status(201).json({
      message: "Thêm thành công!",
      data: { maKH, tenKH, soDienThoai, diaChi }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Thêm KH thất bại', message: error.message });
  }
}

// 4. XÓA KHÁCH HÀNG (Giữ nguyên)
export async function deleteCustomer(req: Request, res: Response) {
  try {
    const { maKH } = req.params;
    const pool = getDb();
    await pool.request()
      .input('MaKH', sql.VarChar(10), maKH)
      .query('DELETE FROM KhachHang WHERE MaKH = @MaKH');
    
    res.json({ message: "Xóa thành công" });
  } catch (error: any) {
    res.status(500).json({ error: 'Xóa thất bại', message: error.message });
  }
}
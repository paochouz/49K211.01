import { Request, Response } from "express";
import { getDb } from "../config/db";

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const db = getDb();
    
    const [donHomNay, doanhThu, dangThue, quaHan] = await Promise.all([
      // 1. Đơn thuê hôm nay (Dựa trên NgayTao)
      db.request().query<{val: number}>("SELECT COUNT(MaDon) as val FROM DonThue WHERE CAST(NgayTao AS DATE) = CAST(GETDATE() AS DATE)"),
      // 2. Doanh thu hôm nay (Tổng tiền các đơn tạo hôm nay)
      db.request().query<{val: number}>("SELECT SUM(TongTienThue) as val FROM DonThue WHERE CAST(NgayTao AS DATE) = CAST(GETDATE() AS DATE)"),
      // 3. Đơn đang thuê: Phải dùng N'Đang thuê' (có dấu) mới khớp với lệnh UPDATE của bạn
      db.request().query<{val: number}>("SELECT COUNT(MaDon) as val FROM DonThue WHERE TrangThaiDon = N'Dang thue' OR TrangThaiDon = N'Đang thuê'") ,
      // 4. Đơn quá hạn: Dựa trên cột TrangThaiDon bạn đã nhập là N'Trễ hạn'
      db.request().query<{val: number}>("SELECT COUNT(MaDon) as val FROM DonThue WHERE TrangThaiDon = N'Trễ hạn' OR TrangThaiDon = N'Tre han'")
    ]);

    return res.json({
      donThueHomNay: donHomNay.recordset[0]?.val ?? 0,
      doanhThuHomNay: doanhThu.recordset[0]?.val ?? 0,
      donDangThue: dangThue.recordset[0]?.val ?? 0,
      donQuaHan: quaHan.recordset[0]?.val ?? 0
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ 
      message: "Lỗi lấy dữ liệu Dashboard", 
      donThueHomNay: 0,
      doanhThuHomNay: 0,
      donDangThue: 0,
      donQuaHan: 0
    });
  }
}
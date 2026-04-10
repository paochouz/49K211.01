import { Request, Response } from "express";
import { getDb } from "../config/db";
import sql from "mssql";

// 1. API: Lấy thông tin chi tiết đơn hàng để hiển thị lên trang trả đồ
export async function getReturnDetails(req: Request, res: Response) {
  try {
    const { maDon } = req.params;
    const pool = getDb();

    // Lấy thông tin đơn hàng và khách hàng
    const orderResult = await pool.request()
      .input("maDon", sql.VarChar, maDon)
      .query(`
        SELECT dt.*, kh.TenKH, kh.SoDienThoai 
        FROM DonThue dt 
        JOIN KhachHang kh ON dt.MaKH = kh.MaKH 
        WHERE dt.MaDon = @maDon
      `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng này trong hệ thống!" });
    }

    // Lấy danh sách trang phục trong đơn đó (bao gồm cả ngày trả dự kiến từ bảng chi tiết)
    const itemsResult = await pool.request()
      .input("maDon", sql.VarChar, maDon)
      .query(`
        SELECT ct.*, tp.TenTP, tp.HinhAnh 
        FROM ChiTietDonThue ct 
        JOIN TrangPhuc tp ON ct.MaTP = tp.MaTP 
        WHERE ct.MaDon = @maDon
      `);

    return res.status(200).json({
      order: orderResult.recordset[0],
      items: itemsResult.recordset
    });

  } catch (error: any) {
    console.error("Get Return Details Error:", error);
    return res.status(500).json({ message: "Lỗi khi lấy thông tin đơn hàng", error: error.message });
  }
}

// 2. API: Xử lý quyết toán đơn hàng (Hàm bạn đã viết, tối ưu thêm một chút)
export async function processReturn(req: Request, res: Response) {
  try {
    const { maDon, ngayTraThucTe, phiTraTre, tongPhatSinh, ketQua, trangPhuc } = req.body;
    const pool = getDb();

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Cập nhật trạng thái và phí phạt cho Đơn Thuê
      await transaction.request()
        .input("maDon", sql.VarChar, maDon)
        .input("ngayTra", sql.Date, ngayTraThucTe)
        .input("phiTre", sql.Decimal(14, 2), phiTraTre)
        .input("tongPhat", sql.Decimal(14, 2), tongPhatSinh)
        .input("tienThuTra", sql.Decimal(14, 2), ketQua)
        .query(`
          UPDATE DonThue 
          SET NgayTraThucTe = @ngayTra, 
              PhiTraTre = @phiTre, 
              TongPhatSinh = @tongPhat, 
              TienPhaiThuTra = @tienThuTra,
              TrangThaiDon = N'Da tra'
          WHERE MaDon = @maDon
        `);

      // Duyệt qua từng trang phục
      for (const item of trangPhuc) {
        await transaction.request()
          .input("maDon", sql.VarChar, maDon)
          .input("maTP", sql.VarChar, item.id.toString()) 
          .input("status", sql.NVarChar, item.status)
          .input("phiLoi", sql.Decimal(12, 2), item.phiHuHong)
          .input("ghiChu", sql.NVarChar, item.moTaLoi || "")
          .query(`
            UPDATE ChiTietDonThue 
            SET TrangThaiTra = @status, PhiHuHong = @phiLoi, GhiChuLoi = @ghiChu
            WHERE MaDon = @maDon AND MaTP = @maTP;

            UPDATE TrangPhuc 
            SET TrangThai = CASE 
                WHEN @status = N'Bình thường' THEN N'Sẵn sàng' 
                WHEN @status = N'Mất' THEN N'Ngưng sử dụng'
                ELSE N'Hư hỏng' END
            WHERE MaTP = @maTP;
          `);
      }

      await transaction.commit();
      res.status(200).json({ message: "Quyết toán đơn hàng thành công!" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error: any) {
    console.error("Return Process Error:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xử lý trả đồ", error: error.message });
  }
}
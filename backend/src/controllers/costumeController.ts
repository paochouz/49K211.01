import { Request, Response } from "express";
import sql from "mssql";
import { getDb } from "../config/db";

// =========================
// US10 - Thêm trang phục
// =========================
export async function createCostume(req: Request, res: Response) {
  try {
    const { tenTP, loaiTP, giaThue, size, moTa } = req.body;

    const hinhAnh = (req as any).file ? (req as any).file.filename : null;

    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT TOP 1 MaTP FROM TrangPhuc ORDER BY MaTP DESC
    `);

    let newMaTP = "TP000001";

    if (result.recordset.length > 0) {
      const lastMa = result.recordset[0].MaTP;
      const number = parseInt(lastMa.replace("TP", "")) + 1;
      newMaTP = "TP" + number.toString().padStart(6, "0");
    }

    await pool
      .request()
      .input("MaTP", sql.VarChar(10), newMaTP)
      .input("TenTP", sql.NVarChar(200), tenTP)
      .input("LoaiTP", sql.NVarChar(100), loaiTP)
      .input("GiaThue", sql.Decimal(12, 2), Number(giaThue))
      .input("Size", sql.NVarChar(10), size || null)
      .input("MoTa", sql.NVarChar(500), moTa || null)
      .input("HinhAnh", sql.NVarChar(255), hinhAnh)
      .input("TrangThai", sql.NVarChar(50), "Sẵn sàng")
      .query(`
        INSERT INTO TrangPhuc
        (MaTP, TenTP, LoaiTP, GiaThue, Size, MoTa, HinhAnh, TrangThai)
        VALUES
        (@MaTP, @TenTP, @LoaiTP, @GiaThue, @Size, @MoTa, @HinhAnh, @TrangThai)
      `);

    res.status(200).json({
      message: "Thêm trang phục thành công",
      maTP: newMaTP,
    });
  } catch (error) {
    console.error("createCostume error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

// =========================
// US11 - Lấy chi tiết trang phục để sửa
// =========================
export async function getCostumeById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const pool = await getDb();
    const result = await pool
      .request()
      .input("MaTP", sql.VarChar(10), id)
      .query(`
        SELECT 
          MaTP,
          TenTP,
          LoaiTP,
          GiaThue,
          Size,
          HinhAnh,
          MoTa,
          TrangThai
        FROM TrangPhuc
        WHERE MaTP = @MaTP
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy trang phục",
      });
    }

    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("getCostumeById error:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy chi tiết trang phục",
    });
  }
}

// =========================
// US11 - Cập nhật trang phục
// =========================
export async function updateCostume(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { tenTP, loaiTP, giaThue, size, moTa, trangThai } = req.body;

    if (!tenTP || tenTP.trim() === "") {
      return res.status(400).json({
        message: "Tên trang phục không được để trống",
      });
    }

    if (!loaiTP || loaiTP.trim() === "") {
      return res.status(400).json({
        message: "Loại trang phục không được để trống",
      });
    }

    if (!giaThue || Number(giaThue) <= 0) {
      return res.status(400).json({
        message: "Giá thuê phải lớn hơn 0",
      });
    }

    if (trangThai === "Đang thuê") {
      return res.status(400).json({
        message: "Không thể cập nhật trạng thái là Đang thuê",
      });
    }

    const pool = await getDb();

    const check = await pool
      .request()
      .input("MaTP", sql.VarChar(10), id)
      .query(`
        SELECT MaTP FROM TrangPhuc WHERE MaTP = @MaTP
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy trang phục để cập nhật",
      });
    }

    await pool
      .request()
      .input("MaTP", sql.VarChar(10), id)
      .input("TenTP", sql.NVarChar(200), tenTP)
      .input("LoaiTP", sql.NVarChar(100), loaiTP)
      .input("GiaThue", sql.Decimal(12, 2), Number(giaThue))
      .input("Size", sql.NVarChar(10), size || null)
      .input("MoTa", sql.NVarChar(500), moTa || null)
      .input("TrangThai", sql.NVarChar(50), trangThai)
      .query(`
        UPDATE TrangPhuc
        SET
          TenTP = @TenTP,
          LoaiTP = @LoaiTP,
          GiaThue = @GiaThue,
          Size = @Size,
          MoTa = @MoTa,
          TrangThai = @TrangThai
        WHERE MaTP = @MaTP
      `);

    return res.status(200).json({
      message: "Cập nhật trang phục thành công",
    });
  } catch (error) {
    console.error("updateCostume error:", error);
    return res.status(500).json({
      message: "Lỗi server khi cập nhật trang phục",
    });
  }
}

// =========================
// US12 - Xóa trang phục
// =========================
export async function deleteCostume(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const pool = await getDb();

    const check = await pool
      .request()
      .input("MaTP", sql.VarChar(10), id)
      .query(`
        SELECT MaTP FROM TrangPhuc WHERE MaTP = @MaTP
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy trang phục để xóa",
      });
    }

    // Không cho xóa nếu đang nằm trong đơn thuê hoạt động
    const checkUsing = await pool
      .request()
      .input("MaTP", sql.VarChar(10), id)
      .query(`
        SELECT TOP 1 ct.MaTP
        FROM ChiTietDonThue ct
        INNER JOIN DonThue d ON ct.MaDon = d.MaDon
        WHERE ct.MaTP = @MaTP
          AND d.TrangThaiDon IN (N'Dang thue', N'Tre han')
      `);

    if (checkUsing.recordset.length > 0) {
      return res.status(400).json({
        message: "Không thể xóa vì trang phục đang nằm trong đơn thuê hoạt động",
      });
    }

    await pool
      .request()
      .input("MaTP", sql.VarChar(10), id)
      .query(`
        DELETE FROM TrangPhuc
        WHERE MaTP = @MaTP
      `);

    return res.status(200).json({
      message: "Xóa trang phục thành công",
    });
  } catch (error) {
    console.error("deleteCostume error:", error);
    return res.status(500).json({
      message: "Lỗi server khi xóa trang phục",
    });
  }
}
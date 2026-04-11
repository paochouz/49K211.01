import { Request, Response } from "express";
import sql from "mssql";
import { getDb } from "../config/db";

export const updateRental = async (req: Request, res: Response) => {
  const { maDon } = req.params;
  const { MaKH, HinhThucCoc, TienCoc, GhiChuGiayTo } = req.body;

  try {
    const pool = await getDb();

    // 1. Kiểm tra đơn tồn tại
    const order = await pool
      .request()
      .input("MaDon", sql.VarChar, maDon)
      .query(`
        SELECT TrangThaiDon
        FROM DonThue
        WHERE MaDon = @MaDon
      `);

    if (order.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn thuê" });
    }

    const trangThai = order.recordset[0].TrangThaiDon;

    // ❌ Không cho sửa nếu không phải "Chua coc"
    if (trangThai !== "Chua coc") {
      return res.status(400).json({
        message: "Chỉ được cập nhật khi đơn ở trạng thái 'Chưa cọc'",
      });
    }

    // 2. Validate hình thức cọc
    if (!["Tien", "GiayTo"].includes(HinhThucCoc)) {
      return res.status(400).json({
        message: "Hình thức cọc không hợp lệ",
      });
    }

    // 3. Validate tiền cọc
    if (HinhThucCoc === "Tien" && (!TienCoc || TienCoc < 0)) {
      return res.status(400).json({
        message: "Tiền cọc không hợp lệ",
      });
    }

    if (HinhThucCoc === "GiayTo" && !GhiChuGiayTo) {
      return res.status(400).json({
        message: "Phải nhập ghi chú giấy tờ",
      });
    }

    // 4. Update
    await pool
      .request()
      .input("MaDon", sql.VarChar, maDon)
      .input("MaKH", sql.VarChar, MaKH)
      .input("HinhThucCoc", sql.NVarChar, HinhThucCoc)
      .input("TienCoc", sql.Decimal(12, 2), HinhThucCoc === "Tien" ? TienCoc : 0)
      .input("GhiChuGiayTo", sql.NVarChar, HinhThucCoc === "GiayTo" ? GhiChuGiayTo : null)
      .query(`
        UPDATE DonThue
        SET 
          MaKH = @MaKH,
          HinhThucCoc = @HinhThucCoc,
          TienCoc = @TienCoc,
          GhiChuGiayTo = @GhiChuGiayTo
        WHERE MaDon = @MaDon
      `);

    return res.status(200).json({
      message: "Cập nhật đơn thuê thành công",
    });
  } catch (error) {
    console.error("Lỗi update:", error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};
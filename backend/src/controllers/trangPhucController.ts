import { Request, Response } from "express";
import sql from "mssql";
import { getDb } from "../config/db";
import { formatTrangPhucCode } from "../utils/generateMaTP";
import { validateCreateTrangPhuc } from "../validators/trangPhucValidator";

export async function createTrangPhuc(req: Request, res: Response) {
  try {
    const errors = validateCreateTrangPhuc(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ.",
        errors,
      });
    }

    const { tenTP, loaiTP, giaThue, size, hinhAnh, moTa } = req.body;
    const pool = getDb();

    const codeResult = await pool.request().query(`
      SELECT TOP 1 MaTP
      FROM TrangPhuc
      WHERE MaTP LIKE 'TP%'
      ORDER BY MaTP DESC
    `);

    let nextNumber = 1;

    if (codeResult.recordset.length > 0) {
      const lastCode: string = codeResult.recordset[0].MaTP;
      const numericPart = parseInt(lastCode.replace("TP", ""), 10);
      nextNumber = numericPart + 1;
    }

    const maTP = formatTrangPhucCode(nextNumber);

    await pool
      .request()
      .input("MaTP", sql.VarChar(10), maTP)
      .input("TenTP", sql.NVarChar(200), tenTP.trim())
      .input("LoaiTP", sql.NVarChar(100), loaiTP.trim())
      .input("GiaThue", sql.Decimal(12, 2), Number(giaThue))
      .input("Size", sql.NVarChar(20), size?.trim() || null)
      .input("HinhAnh", sql.NVarChar(255), hinhAnh?.trim() || null)
      .input("MoTa", sql.NVarChar(sql.MAX), moTa?.trim() || null)
      .input("TrangThai", sql.NVarChar(50), "Sẵn sàng")
      .query(`
        INSERT INTO TrangPhuc (
          MaTP, TenTP, LoaiTP, GiaThue, Size, HinhAnh, MoTa, TrangThai
        )
        VALUES (
          @MaTP, @TenTP, @LoaiTP, @GiaThue, @Size, @HinhAnh, @MoTa, @TrangThai
        )
      `);

    return res.status(201).json({
      message: "Thêm mới trang phục thành công.",
      data: {
        maTP,
        tenTP,
        loaiTP,
        giaThue: Number(giaThue),
        size: size || null,
        hinhAnh: hinhAnh || null,
        moTa: moTa || null,
        trangThai: "Sẵn sàng",
      },
    });
  } catch (error) {
    console.error("createTrangPhuc error:", error);
    return res.status(500).json({
      message: "Lỗi server khi thêm mới trang phục.",
    });
  }
}
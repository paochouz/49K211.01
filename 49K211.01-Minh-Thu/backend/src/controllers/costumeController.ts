import { Request, Response } from "express";
import { getDb } from "../config/db";

export async function createCostume(req: Request, res: Response) {
  try {
    const { tenTP, loaiTP, giaThue, size, moTa } = req.body;

    // ảnh
    const hinhAnh = req.file ? req.file.filename : null;

    const pool = await getDb();

    // 🔥 Tạo mã TP tự động
    const result = await pool.request().query(`
      SELECT TOP 1 maTP FROM TrangPhuc ORDER BY maTP DESC
    `);

    let newMaTP = "TP000001";

    if (result.recordset.length > 0) {
      const lastMa = result.recordset[0].maTP;
      const number = parseInt(lastMa.replace("TP", "")) + 1;
      newMaTP = "TP" + number.toString().padStart(6, "0");
    }

    // 👉 Insert
    await pool.request()
      .input("maTP", newMaTP)
      .input("tenTP", tenTP)
      .input("loaiTP", loaiTP)
      .input("giaThue", giaThue)
      .input("size", size)
      .input("moTa", moTa)
      .input("hinhAnh", hinhAnh)
      .input("trangThai", "Sẵn sàng")
      .query(`
        INSERT INTO TrangPhuc 
        (maTP, tenTP, loaiTP, giaThue, size, moTa, hinhAnh, trangThai)
        VALUES (@maTP, @tenTP, @loaiTP, @giaThue, @size, @moTa, @hinhAnh, @trangThai)
      `);

    res.status(200).json({ message: "Thêm thành công" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server" });
  }
}
export async function listCostumes(req: Request, res: Response) {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT * FROM TrangPhuc ORDER BY maTP DESC
    `);

    res.json(result.recordset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server" });
  }
}


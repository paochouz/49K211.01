import type { Request, Response } from "express";
import sql, { getDb } from "../config/db";

export async function getPenaltyConfig(_req: Request, res: Response) {
  try {
    const db = getDb();
    const result = await db.request().query(`
      SELECT TOP 1 
        TyLePhatPhanTram as tyLePhatQuaHan, 
        MoTaQuyDinh as moTaQuyDinh, 
        TrangThaiApDung as trangThaiApDung
      FROM CauHinhPhat
    `);

    if (result.recordset.length > 0) {
      return res.json({ data: result.recordset[0] });
    }
    return res.json({ data: { tyLePhatQuaHan: 0, moTaQuyDinh: "", trangThaiApDung: false } });
  } catch (error: any) {
    console.error("SQL Get Error:", error.message);
    return res.status(500).json({ message: "Lỗi SQL: " + error.message });
  }
}

export async function updatePenaltyConfig(req: Request, res: Response) {
  try {
    const { tyLePhatQuaHan, moTaQuyDinh, trangThaiApDung } = req.body;
    const db = getDb();

    if (typeof tyLePhatQuaHan !== "number" || tyLePhatQuaHan <= 0 || tyLePhatQuaHan > 100) {
      return res.status(400).json({ message: "Tỷ lệ phạt phải > 0 và <= 100%" });
    }

    const check = await db.request().query("SELECT COUNT(*) as count FROM CauHinhPhat");
    
    if (check.recordset[0].count > 0) {
      await db.request()
        .input("tyLe", sql.Float, tyLePhatQuaHan)
        .input("moTa", sql.NVarChar, moTaQuyDinh)
        .input("status", sql.Bit, trangThaiApDung)
        .query(`
          UPDATE CauHinhPhat 
          SET TyLePhatPhanTram = @tyLe, 
              MoTaQuyDinh = @moTa, 
              TrangThaiApDung = @status
        `);
    } else {
      await db.request()
        .input("tyLe", sql.Float, tyLePhatQuaHan)
        .input("moTa", sql.NVarChar, moTaQuyDinh)
        .input("status", sql.Bit, trangThaiApDung)
        .query(`
          INSERT INTO CauHinhPhat (TyLePhatPhanTram, MoTaQuyDinh, TrangThaiApDung)
          VALUES (@tyLe, @moTa, @status)
        `);
    }

    return res.json({
      message: "Lưu cấu hình thành công",
      data: { tyLePhatQuaHan, moTaQuyDinh, trangThaiApDung },
    });
  } catch (error: any) {
    console.error("SQL Update Error:", error.message);
    return res.status(500).json({ message: "Lỗi lưu Database" });
  }
}
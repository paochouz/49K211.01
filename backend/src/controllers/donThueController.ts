import { Request, Response } from "express";
import { getDb } from "../config/db";
import sql from "mssql";

export async function listDonThue(_req: Request, res: Response) {
  try {
    const pool = getDb();
    const result = await pool.request().query(`
      SELECT 
        dt.MaDon,
        dt.MaKH,
        kh.TenKH,
        kh.SoDienThoai,
        dt.TrangThaiDon,
        dt.TienCoc,
        dt.TongTienThue,
        dt.HinhThucCoc,
        dt.GhiChuGiayTo,
        MIN(ct.NgayThue) AS NgayThue,
        MAX(ct.NgayTraDuKien) AS NgayTraDuKien,
        STRING_AGG(tp.TenTP, ', ') AS DanhSachTP
      FROM DonThue dt
      JOIN KhachHang kh ON dt.MaKH = kh.MaKH
      LEFT JOIN ChiTietDonThue ct ON dt.MaDon = ct.MaDon
      LEFT JOIN TrangPhuc tp ON ct.MaTP = tp.MaTP
      GROUP BY dt.MaDon, dt.MaKH, kh.TenKH, kh.SoDienThoai,
               dt.TrangThaiDon, dt.TienCoc, dt.TongTienThue,
               dt.HinhThucCoc, dt.GhiChuGiayTo
      ORDER BY dt.MaDon DESC
    `);

    const data = result.recordset.map((row: any) => ({
      id: row.MaDon,
      invoiceNo: row.MaDon,
      customer: row.TenKH,
      phone: row.SoDienThoai,
      item: row.DanhSachTP || "",
      rentedAt: row.NgayThue ? formatDate(row.NgayThue) : "",
      dueDate: row.NgayTraDuKien ? formatDate(row.NgayTraDuKien) : "",
      status: mapStatus(row.TrangThaiDon),
      deposit: row.TienCoc ? `${Number(row.TienCoc).toLocaleString("vi-VN")}đ` : "0đ",
      total: row.TongTienThue ? `${Number(row.TongTienThue).toLocaleString("vi-VN")}đ` : "0đ",
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn thuê", error: error.message });
  }
}

function formatDate(d: Date | string): string {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapStatus(raw: string): string {
  if (!raw) return "Chưa cọc đơn";
  const v = raw.trim().toLowerCase();
  if (v === "dang thue" || v === "đang thuê") return "Đang thuê";
  if (v === "da tra" || v === "đã trả") return "Đã trả";
  if (v === "tre han" || v === "trễ hạn") return "Trễ hạn";
  return "Chưa cọc đơn";
}

export async function getNextDonThueCode(_req: Request, res: Response) {
  try {
    const pool = getDb();
    const result = await pool.request().query(`
      SELECT TOP 1 MaDon FROM DonThue ORDER BY MaDon DESC
    `);

    let nextCode = "HDT000001";
    if (result.recordset.length > 0) {
      const last = result.recordset[0].MaDon as string;
      const num = parseInt(last.replace("HDT", "")) + 1;
      nextCode = "HDT" + String(num).padStart(6, "0");
    }

    res.json({ nextCode });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy mã đơn", error: error.message });
  }
}

export async function createDonThue(req: Request, res: Response) {
  try {
    const { maDon, maKH, hinhThucCoc, tienCoc, trangThai, ghiChuGiayTo, items } = req.body;
    const pool = getDb();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Tính tổng tiền
      const tongTienThue = items.reduce((sum: number, it: any) => {
        const days = Math.max(1, Math.ceil((new Date(it.ngayTra).getTime() - new Date(it.ngayThue).getTime()) / 86400000) + 1);
        return sum + (Number(it.donGia) * days);
      }, 0);

      // Insert DonThue
      await transaction.request()
        .input("maDon", sql.VarChar, maDon)
        .input("maKH", sql.VarChar, maKH)
        .input("hinhThucCoc", sql.NVarChar, hinhThucCoc)
        .input("tienCoc", sql.Decimal(14, 2), tienCoc)
        .input("tongTienThue", sql.Decimal(14, 2), tongTienThue)
        .input("trangThai", sql.NVarChar, trangThai || "Chua coc don")
        .input("ghiChu", sql.NVarChar, ghiChuGiayTo || "")
        .query(`
          INSERT INTO DonThue (MaDon, MaKH, HinhThucCoc, TienCoc, TongTienThue, TrangThaiDon, GhiChuGiayTo)
          VALUES (@maDon, @maKH, @hinhThucCoc, @tienCoc, @tongTienThue, @trangThai, @ghiChu)
        `);

      // Insert ChiTietDonThue + update TrangPhuc
      for (const it of items) {
        const days = Math.max(1, Math.ceil((new Date(it.ngayTra).getTime() - new Date(it.ngayThue).getTime()) / 86400000) + 1);
        const thanhTien = Number(it.donGia) * days;

        await transaction.request()
          .input("maDon", sql.VarChar, maDon)
          .input("maTP", sql.VarChar, it.costumeId)
          .input("ngayThue", sql.Date, it.ngayThue)
          .input("ngayTra", sql.Date, it.ngayTra)
          .input("donGia", sql.Decimal(14, 2), it.donGia)
          .input("thanhTien", sql.Decimal(14, 2), thanhTien)
          .query(`
            INSERT INTO ChiTietDonThue (MaDon, MaTP, NgayThue, NgayTraDuKien, DonGia, ThanhTien)
            VALUES (@maDon, @maTP, @ngayThue, @ngayTra, @donGia, @thanhTien)
          `);

        // Cập nhật trạng thái trang phục → Đang thuê
        await transaction.request()
          .input("maTP", sql.VarChar, it.costumeId)
          .query(`UPDATE TrangPhuc SET TrangThai = N'Dang thue' WHERE MaTP = @maTP`);
      }

      await transaction.commit();
      res.status(201).json({ message: "Tạo đơn thành công" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo đơn thuê", error: error.message });
  }
}

// Sync trạng thái trang phục theo đơn thuê hiện tại
export async function syncTrangPhucStatus(_req: Request, res: Response) {
  try {
    const pool = getDb();
    await pool.request().query(`
      UPDATE TrangPhuc
      SET TrangThai = N'Dang thue'
      WHERE MaTP IN (
        SELECT DISTINCT ct.MaTP
        FROM ChiTietDonThue ct
        JOIN DonThue dt ON ct.MaDon = dt.MaDon
        WHERE dt.TrangThaiDon IN (N'Dang thue', N'Chua coc don')
      )
    `);
    res.json({ message: "Đồng bộ trạng thái trang phục thành công" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi sync", error: error.message });
  }
}

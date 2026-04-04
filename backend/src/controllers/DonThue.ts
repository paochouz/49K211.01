import type { Request, Response } from "express";
import sql from "mssql";
import { getDb } from "../config/db";
import {
  formatVnDate,
  formatVnd,
  invoiceNoFromMaDon,
  mapStatusFromDb,
  mapStatusToDb,
  normalizeMaDon,
  parseVnDate,
} from "../utils/donThueMappers";

type Row = {
  MaDon: string;
  MaKH: string;
  TenKH: string;
  SoDienThoai: string;
  TenTP: string;
  MaTP: string;
  MaChiTiet: number;
  NgayThue: Date;
  NgayTraDuKien: Date;
  NgayTraThucTe: Date | null;
  TrangThaiDon: string;
  TienCoc: number;
  TongTienThue: number;
};

function rowToOrderItem(r: Row) {
  const status = mapStatusFromDb(r.TrangThaiDon);
  const returnedAt =
    r.NgayTraThucTe != null ? formatVnDate(r.NgayTraThucTe) : undefined;

  return {
    id: r.MaDon,
    invoiceNo: invoiceNoFromMaDon(r.MaDon),
    customer: r.TenKH,
    item: r.TenTP,
    phone: r.SoDienThoai,
    rentedAt: formatVnDate(r.NgayThue),
    dueDate: formatVnDate(r.NgayTraDuKien),
    ...(returnedAt ? { returnedAt } : {}),
    status,
    deposit: formatVnd(r.TienCoc),
    total: formatVnd(r.TongTienThue),
    _internal: {
      maKH: r.MaKH,
      maTP: r.MaTP,
      maChiTiet: r.MaChiTiet,
    },
  };
}

const LIST_CTE = `
WITH FirstLine AS (
  SELECT
    MaChiTiet,
    MaDon,
    MaTP,
    NgayThue,
    NgayTraDuKien,
    ROW_NUMBER() OVER (PARTITION BY MaDon ORDER BY MaChiTiet) AS rn
  FROM ChiTietDonThue
)
SELECT
  dt.MaDon,
  dt.MaKH,
  kh.TenKH,
  kh.SoDienThoai,
  tp.TenTP,
  tp.MaTP,
  fl.MaChiTiet,
  fl.NgayThue,
  fl.NgayTraDuKien,
  dt.NgayTraThucTe,
  dt.TrangThaiDon,
  dt.TienCoc,
  dt.TongTienThue
FROM DonThue dt
INNER JOIN KhachHang kh ON dt.MaKH = kh.MaKH
INNER JOIN FirstLine fl ON fl.MaDon = dt.MaDon AND fl.rn = 1
INNER JOIN TrangPhuc tp ON fl.MaTP = tp.MaTP
`;

export async function listDonThue(req: Request, res: Response) {
  try {
    const pool = await getDb();
    const statusParam = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const customer = typeof req.query.customer === "string" ? req.query.customer.trim() : "";
    const phone = typeof req.query.phone === "string" ? req.query.phone.replace(/\D/g, "").trim() : "";

    const statusDb = statusParam ? mapStatusToDb(statusParam) : null;
    if (statusParam && !statusDb) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    let query = LIST_CTE + " WHERE 1=1";
    const request = pool.request();

    if (statusDb) {
      query += " AND dt.TrangThaiDon = @trangThaiDon";
      request.input("trangThaiDon", sql.NVarChar(50), statusDb);
    }
    if (customer) {
      // Khớp frontend: includes + không phân biệt hoa/thường (DonThue.tsx)
      query += " AND LOWER(kh.TenKH) LIKE LOWER(@tenKH)";
      request.input("tenKH", sql.NVarChar(200), `%${customer}%`);
    }
    if (phone) {
      query += " AND kh.SoDienThoai LIKE @phone";
      request.input("phone", sql.VarChar(10), `%${phone}%`);
    }

    query += " ORDER BY dt.NgayTao DESC";

    const result = await request.query(query);
    const rows = result.recordset as Row[];

    const items = rows.map((r) => {
      const o = rowToOrderItem(r);
      const { _internal, ...rest } = o;
      return rest;
    });

    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lỗi server" });
  }
}

export async function confirmDonThueDeposit(req: Request, res: Response) {
  try {
    const maDon = normalizeMaDon(req.params.maDon);
    const body = req.body as { tienCoc?: number };
    const tienCoc =
      typeof body.tienCoc === "number" && body.tienCoc >= 0 ? body.tienCoc : 500_000;

    const pool = await getDb();

    const check = await pool
      .request()
      .input("maDon", sql.VarChar(10), maDon)
      .query(
        `SELECT TrangThaiDon, TienCoc FROM DonThue WHERE MaDon = @maDon`
      );

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Không tồn tại hóa đơn." });
    }

    const current = check.recordset[0] as { TrangThaiDon: string; TienCoc: number };
    if (current.TrangThaiDon !== "Chua coc") {
      return res.status(400).json({ message: "Chỉ có thể cọc khi đơn ở trạng thái chưa cọc." });
    }

    const newTienCoc = Number(current.TienCoc) === 0 ? tienCoc : Number(current.TienCoc);

    await pool
      .request()
      .input("maDon", sql.VarChar(10), maDon)
      .input("tienCoc", sql.Decimal(12, 2), newTienCoc)
      .query(
        `UPDATE DonThue SET TrangThaiDon = N'Dang thue', TienCoc = @tienCoc WHERE MaDon = @maDon`
      );

    const inv = invoiceNoFromMaDon(maDon);
    return res.json({
      message: `Hóa đơn ${inv} đã chuyển sang trạng thái "Đang thuê".`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lỗi server" });
  }
}

export async function patchDonThue(req: Request, res: Response) {
  try {
    const maDon = normalizeMaDon(req.params.maDon);
    const { customer, phone, item, status, dueDate } = req.body as {
      customer?: string;
      phone?: string;
      item?: string;
      status?: string;
      dueDate?: string;
    };

    const pool = await getDb();

    const check = await pool
      .request()
      .input("maDon", sql.VarChar(10), maDon)
      .query(
        `SELECT dt.MaKH, fl.MaChiTiet, fl.MaTP
         FROM DonThue dt
         INNER JOIN (
           SELECT MaChiTiet, MaDon, MaTP,
             ROW_NUMBER() OVER (PARTITION BY MaDon ORDER BY MaChiTiet) AS rn
           FROM ChiTietDonThue
         ) fl ON fl.MaDon = dt.MaDon AND fl.rn = 1
         WHERE dt.MaDon = @maDon`
      );

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Không tồn tại hóa đơn." });
    }

    const { MaKH, MaChiTiet, MaTP } = check.recordset[0] as {
      MaKH: string;
      MaChiTiet: number;
      MaTP: string;
    };

    const statusDb = status != null && status !== "" ? mapStatusToDb(status) : null;
    if (status != null && status !== "" && !statusDb) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    let due: Date | null = null;
    if (dueDate != null && dueDate !== "") {
      due = parseVnDate(dueDate);
      if (!due) {
        return res.status(400).json({ message: "Hạn trả không đúng định dạng DD/MM/YYYY." });
      }
    }

    const phoneDigits = phone != null ? phone.replace(/\D/g, "").slice(0, 10) : undefined;

    if (customer != null && customer !== "") {
      await pool
        .request()
        .input("maKH", sql.VarChar(10), MaKH)
        .input("tenKH", sql.NVarChar(100), customer.trim())
        .query(`UPDATE KhachHang SET TenKH = @tenKH WHERE MaKH = @maKH`);
    }

    if (phoneDigits != null && phoneDigits !== "") {
      try {
        await pool
          .request()
          .input("maKH", sql.VarChar(10), MaKH)
          .input("sdt", sql.VarChar(10), phoneDigits)
          .query(`UPDATE KhachHang SET SoDienThoai = @sdt WHERE MaKH = @maKH`);
      } catch (e: unknown) {
        const err = e as { number?: number };
        if (err.number === 2627 || err.number === 2601) {
          return res.status(400).json({ message: "Số điện thoại đã được dùng cho khách khác." });
        }
        throw e;
      }
    }

    if (item != null && item !== "") {
      await pool
        .request()
        .input("maTP", sql.VarChar(10), MaTP)
        .input("tenTP", sql.NVarChar(200), item.trim())
        .query(`UPDATE TrangPhuc SET TenTP = @tenTP WHERE MaTP = @maTP`);
    }

    if (due) {
      await pool
        .request()
        .input("maChiTiet", sql.Int, MaChiTiet)
        .input("ngayTra", sql.Date, due)
        .query(
          `UPDATE ChiTietDonThue SET NgayTraDuKien = @ngayTra WHERE MaChiTiet = @maChiTiet`
        );
    }

    if (statusDb) {
      const tran = new sql.Transaction(pool);
      await tran.begin();
      try {
        const rq = new sql.Request(tran);
        rq.input("maDon", sql.VarChar(10), maDon);
        rq.input("trangThai", sql.NVarChar(50), statusDb);

        if (statusDb === "Da tra") {
          rq.input("ngayTraTT", sql.Date, new Date());
          await rq.query(
            `UPDATE DonThue SET TrangThaiDon = @trangThai, NgayTraThucTe = @ngayTraTT WHERE MaDon = @maDon`
          );
        } else {
          await rq.query(
            `UPDATE DonThue SET TrangThaiDon = @trangThai, NgayTraThucTe = NULL WHERE MaDon = @maDon`
          );
        }

        await tran.commit();
      } catch (e) {
        await tran.rollback();
        throw e;
      }
    }

    const inv = invoiceNoFromMaDon(maDon);
    return res.json({ message: `Đã cập nhật hóa đơn ${inv}.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lỗi server" });
  }
}

import type { Request, Response } from "express";
import sql from "mssql";
import { getDb } from "../config/db";

type CostumeRow = {
  MaTP: string;
  TenTP: string;
  LoaiTP: string | null;
  GiaThue: number;
  Size: string | null;
  MoTa: string | null;
  HinhAnh: string | null;
  TrangThai: string;
};

type CostumePayload = {
  ma?: string;
  tenTP?: string;
  loaiTP?: string;
  size?: string;
  giaThue?: string | number;
  moTa?: string;
  trangThai?: string;
};

const ALLOWED_STATUSES = new Set([
  "Sẵn sàng",
  "Đang thuê",
  "Hư hỏng",
  "Bảo trì",
  "Ngưng sử dụng",
]);

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

function normalizePayload(body: Record<string, unknown>): CostumePayload {
  return {
    ma: pickString(body.ma, body.maTP)?.trim().toUpperCase(),
    tenTP: pickString(body.tenTP, body.ten)?.trim(),
    loaiTP: pickString(body.loaiTP, body.loai)?.trim(),
    size: pickString(body.size)?.trim(),
    giaThue:
      typeof body.giaThue === "number" || typeof body.giaThue === "string"
        ? body.giaThue
        : typeof body.gia === "number" || typeof body.gia === "string"
          ? body.gia
          : undefined,
    moTa: pickString(body.moTa, body.mo_ta)?.trim(),
    trangThai: pickString(body.trangThai, body.status)?.trim(),
  };
}

function buildImageUrl(req: Request, hinhAnh: string | null) {
  if (!hinhAnh) return null;
  if (/^https?:\/\//i.test(hinhAnh)) return hinhAnh;
  return `${req.protocol}://${req.get("host")}/uploads/costumes/${hinhAnh}`;
}

function mapCostumeRow(req: Request, row: CostumeRow) {
  return {
    ma: row.MaTP,
    ten: row.TenTP,
    loai: row.LoaiTP ?? "",
    loaiTP: row.LoaiTP ?? "",
    size: row.Size ?? "",
    giaThue: Number(row.GiaThue ?? 0),
    moTa: row.MoTa ?? "",
    trangThai: row.TrangThai,
    hinhAnh: row.HinhAnh,
    hinhAnhUrl: buildImageUrl(req, row.HinhAnh),
  };
}

function uploadedFilename(req: Request) {
  const requestWithFile = req as Request & { file?: { filename?: string } };
  return requestWithFile.file?.filename ?? null;
}

async function findCostumeById(pool: sql.ConnectionPool, maTP: string) {
  const result = await pool
    .request()
    .input("maTP", sql.VarChar(10), maTP)
    .query(`
      SELECT MaTP, TenTP, LoaiTP, GiaThue, Size, MoTa, HinhAnh, TrangThai
      FROM TrangPhuc
      WHERE MaTP = @maTP
    `);

  return (result.recordset[0] as CostumeRow | undefined) ?? null;
}

export async function createCostume(req: Request, res: Response) {
  try {
    const payload = normalizePayload(req.body as Record<string, unknown>);
    const hinhAnh = uploadedFilename(req);
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT TOP 1 MaTP FROM TrangPhuc ORDER BY MaTP DESC
    `);

    let newMaTP = "TP000001";

    if (result.recordset.length > 0) {
      const lastMa = String(result.recordset[0].MaTP ?? "TP000000");
      const number = Number.parseInt(lastMa.replace("TP", ""), 10) + 1;
      newMaTP = `TP${String(number).padStart(6, "0")}`;
    }

    await pool
      .request()
      .input("maTP", sql.VarChar(10), newMaTP)
      .input("tenTP", sql.NVarChar(255), payload.tenTP ?? "")
      .input("loaiTP", sql.NVarChar(100), payload.loaiTP || null)
      .input("giaThue", sql.Decimal(12, 2), Number(payload.giaThue))
      .input("size", sql.NVarChar(20), payload.size || null)
      .input("moTa", sql.NVarChar(sql.MAX), payload.moTa || null)
      .input("hinhAnh", sql.NVarChar(255), hinhAnh)
      .input("trangThai", sql.NVarChar(50), payload.trangThai || "Sẵn sàng")
      .query(`
        INSERT INTO TrangPhuc
          (MaTP, TenTP, LoaiTP, GiaThue, Size, MoTa, HinhAnh, TrangThai)
        VALUES
          (@maTP, @tenTP, @loaiTP, @giaThue, @size, @moTa, @hinhAnh, @trangThai)
      `);

    const created = await findCostumeById(pool, newMaTP);

    return res.status(201).json({
      message: "Them trang phuc thanh cong.",
      item: created ? mapCostumeRow(req, created) : null,
    });
  } catch (error) {
    console.error("createCostume error:", error);
    return res.status(500).json({ message: "Loi server khi them trang phuc." });
  }
}

export async function listCostumes(req: Request, res: Response) {
  try {
    const pool = await getDb();
    const result = await pool.request().query(`
      SELECT MaTP, TenTP, LoaiTP, GiaThue, Size, MoTa, HinhAnh, TrangThai
      FROM TrangPhuc
      ORDER BY MaTP DESC
    `);

    return res.status(200).json(
      (result.recordset as CostumeRow[]).map((row) => mapCostumeRow(req, row)),
    );
  } catch (error) {
    console.error("listCostumes error:", error);
    return res.status(500).json({ message: "Loi server khi lay danh sach trang phuc." });
  }
}

export async function getCostumeById(req: Request, res: Response) {
  try {
    const maTP = req.params.maTP.trim().toUpperCase();
    const pool = await getDb();
    const costume = await findCostumeById(pool, maTP);

    if (!costume) {
      return res.status(404).json({ message: "Khong tim thay trang phuc." });
    }

    return res.status(200).json(mapCostumeRow(req, costume));
  } catch (error) {
    console.error("getCostumeById error:", error);
    return res.status(500).json({ message: "Loi server khi lay chi tiet trang phuc." });
  }
}

export async function updateCostume(req: Request, res: Response) {
  try {
    const maTP = req.params.maTP.trim().toUpperCase();
    const payload = normalizePayload(req.body as Record<string, unknown>);
    const hinhAnh = uploadedFilename(req);
    const pool = await getDb();

    const existing = await findCostumeById(pool, maTP);

    if (!existing) {
      return res.status(404).json({ message: "Khong tim thay trang phuc." });
    }

    const nextStatus = payload.trangThai || existing.TrangThai;

    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return res.status(400).json({ message: "Trang thai trang phuc khong hop le." });
    }

    if (nextStatus === "Đang thuê") {
      return res.status(400).json({
        message: "Khong the cap nhat trang thai thanh Dang thue tai man hinh nay.",
      });
    }

    await pool
      .request()
      .input("maTP", sql.VarChar(10), maTP)
      .input("tenTP", sql.NVarChar(255), payload.tenTP || existing.TenTP)
      .input("loaiTP", sql.NVarChar(100), payload.loaiTP || existing.LoaiTP)
      .input(
        "giaThue",
        sql.Decimal(12, 2),
        payload.giaThue !== undefined && payload.giaThue !== ""
          ? Number(payload.giaThue)
          : Number(existing.GiaThue),
      )
      .input("size", sql.NVarChar(20), payload.size || existing.Size)
      .input("moTa", sql.NVarChar(sql.MAX), payload.moTa || existing.MoTa)
      .input("hinhAnh", sql.NVarChar(255), hinhAnh || existing.HinhAnh)
      .input("trangThai", sql.NVarChar(50), nextStatus)
      .query(`
        UPDATE TrangPhuc
        SET
          TenTP = @tenTP,
          LoaiTP = @loaiTP,
          GiaThue = @giaThue,
          Size = @size,
          MoTa = @moTa,
          HinhAnh = @hinhAnh,
          TrangThai = @trangThai
        WHERE MaTP = @maTP
      `);

    const updated = await findCostumeById(pool, maTP);

    return res.status(200).json({
      message: "Luu thay doi thanh cong.",
      item: updated ? mapCostumeRow(req, updated) : null,
    });
  } catch (error) {
    console.error("updateCostume error:", error);
    return res.status(500).json({ message: "Loi server khi cap nhat trang phuc." });
  }
}

export async function deleteCostume(req: Request, res: Response) {
  try {
    const maTP = req.params.maTP.trim().toUpperCase();
    const pool = await getDb();

    const inUseResult = await pool
      .request()
      .input("maTP", sql.VarChar(10), maTP)
      .query(`
        SELECT TOP 1 1 AS InUse
        FROM ChiTietDonThue ct
        INNER JOIN DonThue dt ON dt.MaDon = ct.MaDon
        WHERE ct.MaTP = @maTP
          AND dt.TrangThaiDon IN (N'Dang thue', N'Chua coc', N'Tre han')
      `);

    if (inUseResult.recordset.length > 0) {
      return res.status(400).json({
        message: "Khong the xoa trang phuc dang duoc dung trong don thue.",
      });
    }

    const deleteResult = await pool
      .request()
      .input("maTP", sql.VarChar(10), maTP)
      .query(`
        DELETE FROM TrangPhuc
        WHERE MaTP = @maTP
      `);

    if ((deleteResult.rowsAffected?.[0] ?? 0) === 0) {
      return res.status(404).json({ message: "Khong tim thay trang phuc." });
    }

    return res.status(200).json({ message: "Xoa trang phuc thanh cong." });
  } catch (error) {
    console.error("deleteCostume error:", error);
    return res.status(500).json({ message: "Loi server khi xoa trang phuc." });
  }
}

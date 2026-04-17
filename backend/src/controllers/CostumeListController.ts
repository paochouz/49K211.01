import { Request, Response } from "express";
import { getDb } from "../config/db";

export const getCostumes = async (req: Request, res: Response) => {
    try {
        // 1. Gọi hàm getDb() để lấy pool kết nối
        const pool = await getDb(); 

        // 2. Thực hiện truy vấn bình thường
        const result = await pool.request().query(`
SELECT 
    tp.MaTP,
    tp.TenTP,
    tp.GiaThue,
    tp.Size,
    tp.TrangThai,
    tp.HinhAnh,
    tp.MoTa,
    tp.LoaiTP,

    kh.TenKH,
    CONVERT(VARCHAR, ct.NgayTraDuKien, 103) AS NgayTraDuKien

FROM TrangPhuc tp

OUTER APPLY (
    SELECT TOP 1 ct.*
    FROM ChiTietDonThue ct
    JOIN DonThue dt ON ct.MaDon = dt.MaDon
    WHERE ct.MaTP = tp.MaTP
      AND dt.TrangThaiDon = N'Dang thue'
    ORDER BY ct.MaChiTiet DESC
) ct

LEFT JOIN DonThue dt ON ct.MaDon = dt.MaDon
LEFT JOIN KhachHang kh ON dt.MaKH = kh.MaKH
`);

const mappedData = result.recordset.map((item: any) => ({
    MaTP: item.MaTP,
    TenTP: item.TenTP,
    GiaThue: item.GiaThue,
    Size: item.Size,
    TrangThai: item.TrangThai,
    HinhAnh: item.HinhAnh,
    MoTa: item.MoTa,
    LoaiTP: item.LoaiTP,
    TenKH: item.TenKH,
    NgayTraDuKien: item.NgayTraDuKien
}));

res.status(200).json(mappedData);

    } catch (error) {
        console.error("Lỗi khi lấy danh sách trang phục:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu" });
    }
};
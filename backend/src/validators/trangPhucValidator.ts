export interface CreateTrangPhucDto {
  tenTP: string;
  loaiTP: string;
  giaThue: number;
  size?: string;
  hinhAnh?: string;
  moTa?: string;
}

export function validateCreateTrangPhuc(data: any): string[] {
  const errors: string[] = [];

  if (!data.tenTP || typeof data.tenTP !== "string" || !data.tenTP.trim()) {
    errors.push("Tên trang phục là bắt buộc.");
  }

  if (!data.loaiTP || typeof data.loaiTP !== "string" || !data.loaiTP.trim()) {
    errors.push("Loại trang phục là bắt buộc.");
  }

  if (data.giaThue === undefined || data.giaThue === null || data.giaThue === "") {
    errors.push("Giá thuê là bắt buộc.");
  } else if (isNaN(Number(data.giaThue)) || Number(data.giaThue) <= 0) {
    errors.push("Giá thuê phải lớn hơn 0.");
  }

  if (data.size && typeof data.size !== "string") {
    errors.push("Size không hợp lệ.");
  }

  if (data.hinhAnh && typeof data.hinhAnh !== "string") {
    errors.push("Hình ảnh không hợp lệ.");
  }

  if (data.moTa && typeof data.moTa !== "string") {
    errors.push("Mô tả không hợp lệ.");
  }

  return errors;
}
import { useState } from "react";

export default function CostumeCreatePage() {
  const [form, setForm] = useState({
    tenTP: "",
    loaiTP: "",
    giaThue: "",
    size: "",
    moTa: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.tenTP || !form.loaiTP || Number(form.giaThue) <= 0) {
      alert("Nhập thiếu hoặc sai!");
      return;
    }

    await fetch("http://localhost:3002/api/trangphuc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    alert("Thêm thành công!");
  };

  return (
    <div className="form-page">
      <div className="app-card">
        <h2>Thêm trang phục</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên</label>
            <input className="form-input" name="tenTP" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Loại</label>
            <input className="form-input" name="loaiTP" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Giá</label>
            <input
              className="form-input"
              type="number"
              name="giaThue"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Size</label>
            <input className="form-input" name="size" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-textarea"
              name="moTa"
              onChange={handleChange}
            />
          </div>

          <button className="app-button app-button--primary" type="submit">
            Lưu
          </button>
        </form>
      </div>
    </div>
  );
}

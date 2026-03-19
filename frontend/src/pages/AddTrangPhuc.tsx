import { useState } from "react";

export default function AddTrangPhuc() {
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
    <div>
      <h2>Thêm trang phục</h2>

      <form onSubmit={handleSubmit}>
        <input name="tenTP" placeholder="Tên" onChange={handleChange} />
        <input name="loaiTP" placeholder="Loại" onChange={handleChange} />
        <input name="giaThue" type="number" placeholder="Giá" onChange={handleChange} />
        <input name="size" placeholder="Size" onChange={handleChange} />
        <textarea name="moTa" placeholder="Mô tả" onChange={handleChange}></textarea>

        <button type="submit">Lưu</button>
      </form>
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL;

// Fungsi bantu untuk memanggil API backend:
// - otomatis menambah header Authorization kalau sudah login
// - kalau server membalas 401 saat sedang login (token tidak valid
//   atau kedaluwarsa), data login dihapus dan pengguna kembali ke halaman login
export async function request(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Isi respons bisa kosong, jadi dibaca dengan aman
  const data = await res.json().catch(() => ({}));

  // Saat login gagal (password salah) belum ada token, jadi tidak ikut diarahkan ulang
  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (!res.ok) {
    // Pesan error dari backend ada di data.message
    const error = new Error(data.message || "Terjadi kesalahan");
    error.status = res.status;
    throw error;
  }

  return data;
}

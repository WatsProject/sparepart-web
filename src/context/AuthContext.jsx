import { createContext, useContext, useState } from "react";
import { authApi } from "../api/auth.js";

const AuthContext = createContext(null);

// Menyimpan data login supaya bisa dipakai di semua halaman
export function AuthProvider({ children }) {
  // Baca data login yang tersimpan, supaya tidak hilang saat halaman di-refresh
  const [user, setUser] = useState(() => {
    const tersimpan = localStorage.getItem("user");
    return tersimpan ? JSON.parse(tersimpan) : null;
  });

  async function login(username, password) {
    const hasil = await authApi.login(username, password);

    localStorage.setItem("token", hasil.data.token);
    localStorage.setItem("user", JSON.stringify(hasil.data.user));
    setUser(hasil.data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  // Dipanggil setelah pengguna mengubah akunnya sendiri,
  // supaya nama di pojok kanan atas ikut berubah
  function perbaruiUser(dataBaru) {
    const userBaru = { ...user, ...dataBaru };

    localStorage.setItem("user", JSON.stringify(userBaru));
    setUser(userBaru);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, perbaruiUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Dipanggil di komponen lain untuk mengambil data login
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

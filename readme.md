# 🧾 Fungsitama Next.js

Aplikasi ini dibuat untuk memenuhi technical test. Ini adalah aplikasi **Invoice Management System** berbasis **Next.js** dengan **PostgreSQL** dan **Drizzle ORM**.  
Struktur proyek dibuat mengikuti patter yang sudah ada

---

## 📁 Folder Structure

| Folder | Deskripsi |
|---|---|
| **actions/** | *Business logic* (fungsi proses utama aplikasi). |
| **app/** | *Presentation layer* (App Router) dan rute halaman. |
| **app/api/** | Endpoint JSON (API), bukan HTML pages. |
| **components/** | Komponen React yang reusable. |
| **drizzle/** | Schema, migration, dan konfigurasi Drizzle. |
| **dtos/** | Interface untuk payload request (data form → server). |
| **entity/** | Interface model yang mencerminkan kolom tabel DB. |
| **repositories/** | Query untuk *server components*/server actions. |
| **services/** | Jembatan actions ↔ views (biasanya hooks/client). |
| **lib/** | Utilitas bersama (helpers, formatters, constants). |
| **atoms/** | *State management* (mis. Jotai/Zustand/Recoil). |
| **public/** | Aset statis. |
| **datasource/internal/** | Data/konstanta internal (mis. definisi kolom/form). |
| **datasource/external/** | Data dari resource eksternal (API pihak ketiga). |
| **templates/** | Template output (PDF, email body, dsb.). |
views/** | *User interface* (halaman dan komponen UI). |
context/** | *Context provider* (mis. Snackbar). |

---

## 🚀 Cara Menjalankan

1) **Install dependencies**
```bash
pnpm install
```

2) **Setup environment variables**

Buat file `.env` di root project dan isi dengan konfigurasi database:

```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

3) **Run application**

```bash
pnpm dev
```

## 🚀 Database Schema
Untuk schema database, saya membuat 2 tabel:

1) **Tabel Invoices**

```
CREATE TABLE IF NOT EXISTS invoices (
  id             SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  client_name    VARCHAR(255) NOT NULL,
  client_address TEXT NOT NULL,
  issue_date     DATE NOT NULL,
  due_date       DATE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Draft',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invoices_due_after_issue CHECK (due_date >= issue_date)
);
```

2) **Tabel Invoice Items**

```
CREATE TABLE IF NOT EXISTS invoice_items (
  id          SERIAL PRIMARY KEY,
  invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(14,2) NOT NULL CHECK (unit_price > 0),
  line_total  NUMERIC(14,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🚀 Kendala pengerjaan

Saya membutuhkan waktu untuk memahami query SQL, terutama dalam menghitung total_amount.
Karena belum sepenuhnya memahami konsep agregasi (SUM, JOIN, dll),
maka sementara ini saya menghitung total amount menggunakan perhitungan manual di sisi aplikasi (client).
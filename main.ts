// main.ts — mengantar entry.txt ke folder output, tanpa mengubah satu byte pun.
//
// Tugas program ini sederhana saja: baca baris permintaan maaf dari
// entry.txt yang duduk di sebelah file ini, pastikan panjangnya masih
// dalam batas 200 karakter, lalu salin isinya persis apa adanya ke
// folder output yang diminta. Tidak ada yang diedit, tidak ada yang
// ditambah, tidak ada jaringan yang disentuh.
// Program ini tidak pernah mengarang teks sendiri: ia hanya mengantar
// satu baris yang sudah ditulis penulisnya, dari sumber ke tujuan,
// tanpa mengubah isinya. Baris yang kepanjangan ditolak sebelum
// ada yang dibuat, dan kegagalan apa pun dihentikan dengan pesan jelas.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Cari tahu di mana file ini berada, supaya entry.txt selalu ditemukan
// di folder yang sama — di mana pun program ini dijalankan.
const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.txt");

// Panjang maksimum baris yang diizinkan oleh bounty, dalam code point
// (karakter yang terlihat di layar), bukan dalam byte.
const MAX_LENGTH = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

try {
  // Langkah 1: baca barisnya sebagai teks UTF-8.
  const entry = readFileSync(sourcePath, "utf8");

  // Langkah 2: hitung panjangnya dalam code point. Array.from memecah
  // string per code point, jadi karakter multi-byte seperti em-dash
  // tetap dihitung satu, bukan tiga.
  const length = Array.from(entry).length;
  if (length > MAX_LENGTH) {
    fail(`entry is ${length} characters, over the 200-character limit`);
  }

  // Langkah 3: folder output harus diberi tahu lewat environment variable.
  // Kalau tidak ada, kita berhenti — menebak-nebak lokasi output itu
  // lebih berbahaya daripada berhenti dengan pesan yang jelas.
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outputDir) {
    fail("MAKEFUN_OUTPUT_DIR is not set");
  }

  // Langkah 4: siapkan folder output (buat beserta induknya bila perlu),
  // lalu tulis ulang entry.txt di sana, byte-identik dengan sumbernya.
  // writeFileSync dengan string UTF-8 yang sama menghasilkan byte yang sama.
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "entry.txt"), entry, "utf8");
} catch (err) {
  // Apa pun yang gagal — baca gagal, tulis gagal — laporkan ke stderr
  // dan keluar dengan kode 1, tanpa meninggalkan output setengah jadi.
  fail(err instanceof Error ? err.message : String(err));
}

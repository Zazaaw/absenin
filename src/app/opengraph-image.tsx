import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Absenin: laporan MagangHub selesai sebelum kamu lupa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Gambar pratinjau saat link dibagikan di WhatsApp, Telegram, X, LinkedIn.
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#F4F4F2", color: "#111318", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#111318", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: 99, background: "#F4F4F2" }} />
          </div>
          Absenin
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>Laporan MagangHub selesai sebelum kamu lupa.</div>
          <div style={{ fontSize: 30, color: "#5B6472", maxWidth: 900 }}>Pengingat jam 16.00 yang nggak bisa dicuekin, plus tiga kolom laporan dirangkai dari cerita singkatmu. Kamu yang kirim.</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "#5B6472" }}>
          <span style={{ padding: "8px 18px", border: "1px solid #D5D8DE", borderRadius: 99 }}>Ekstensi Chrome</span>
          <span style={{ padding: "8px 18px", border: "1px solid #D5D8DE", borderRadius: 99 }}>11 tema</span>
          <span style={{ padding: "8px 18px", border: "1px solid #D5D8DE", borderRadius: 99 }}>Trial 7 hari gratis</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#05070a", color: "#FFFFFF", fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      {children}
    </div>
  );
}

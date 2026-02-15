import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noesis - YouTube Video Summarizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", backgroundColor: "#fafafa" }}>
        {children}
      </body>
    </html>
  );
}

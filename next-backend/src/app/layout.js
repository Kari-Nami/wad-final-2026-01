import "./globals.css";

export const metadata = {
  title: "CourseSpace API",
  description: "Backend API for the CourseSpace online course service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

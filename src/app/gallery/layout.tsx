import '../(landing)/landing-styles.css';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen antialiased landing-page">
      {children}
    </div>
  );
} 
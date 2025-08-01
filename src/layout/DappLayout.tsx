// layout/DAppLayout.tsx
interface DAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DAppLayout({
  children,
  title = "DApp",
  description = "Decentralized Application",
}: DAppLayoutProps) {
  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        {children}
      </main>

    </div>
  );
}

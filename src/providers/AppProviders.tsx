import { useEffect } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActionButtonList } from "@/components/ActionButtonList";


import {
  projectId,
  metadata,
  networks,
  wagmiAdapter,
//   solanaWeb3JsAdapter,
} from "@/config";

const queryClient = new QueryClient();

// Get current theme from localStorage or system preference
function getCurrentTheme() {
  const savedTheme = localStorage.getItem("vite-ui-theme");

  if (savedTheme === "system" || !savedTheme) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return savedTheme as "light" | "dark";
}

function getThemeVariables(theme: "light" | "dark") {
  const isDark = theme === "dark";

  return {
    "--w3m-accent": isDark ? "#ffffff" : "#000000",
    "--w3m-background": isDark ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
    "--w3m-foreground": isDark ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)",
    "--w3m-border": isDark
      ? "hsl(217.2 32.6% 17.5%)"
      : "hsl(214.3 31.8% 91.4%)",
    "--w3m-color-mix": isDark ? "#000000" : "#FFFFFF",
    "--w3m-color-mix-strength": 20,
    "--w3m-border-radius-master": "0.5rem",
  };
}

const currentTheme = getCurrentTheme();

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: currentTheme,
  features: {
    analytics: false,
    email: false,
    socials: [],
    legalCheckbox: false,
    onramp: false,
    swaps: false,
    reownBranding: false,
  },
  themeVariables: getThemeVariables(currentTheme),
};

// Create modal with current theme
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
});

function ThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    const root = document.documentElement;
    const themeVars = getThemeVariables(resolvedTheme);

    const cssVars = {
      "--w3m-accent": themeVars["--w3m-accent"],
      "--w3m-background": themeVars["--w3m-background"],
      "--w3m-foreground": themeVars["--w3m-foreground"],
      "--w3m-border": themeVars["--w3m-border"],
      "--w3m-color-mix": themeVars["--w3m-color-mix"],
      "--w3m-color-mix-strength": `${themeVars["--w3m-color-mix-strength"]}%`,
      "--w3m-border-radius-master": themeVars["--w3m-border-radius-master"],
    };

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute("data-theme", resolvedTheme);
  }, [theme]);

  return null;
}

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeSync />
          <ActionButtonList />
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
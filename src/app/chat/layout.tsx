import { Providers } from "@/components/ui/providers";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
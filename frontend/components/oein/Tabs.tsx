import { ArrowRightCircle, Backpack, Home } from "lucide-react";
import s from "./css.module.css";
import { useRouter } from "next/router";

const TabItems: { label: string; href: string; icon?: any }[] = [
  { label: "404", href: "/404", icon: ArrowRightCircle },
  { label: "홈", href: "/", icon: Home },
  { label: "Auth", href: "/auth", icon: Backpack },
];

export default function Tabs() {
  const tlistsWithDepth = TabItems.map((item, idx) => ({
    ...item,
    depth: item.href.split("/").filter((x) => !!x).length,
    index: idx,
  }));
  const router = useRouter();
  const focused = (() => {
    const filtered = tlistsWithDepth.filter((item) =>
      router.pathname.startsWith(item.href)
    );
    if (filtered.length === 0) return null;
    // 가장 깊은 경로를 가진 항목을 선택
    return filtered.reduce((prev, current) =>
      prev.depth >= current.depth ? prev : current
    ).index;
  })();
  return (
    <div
      className={s.tabs + " border bg-background shadow-xs dark:bg-input/30"}
    >
      {TabItems.map((item, idx) => (
        <a
          key={idx}
          href={item.href}
          className={
            s.tab + " text-xs text-center " + (focused === idx ? s.active : "")
          }
        >
          {item.icon && <item.icon />}
          {item.label}
        </a>
      ))}
    </div>
  );
}

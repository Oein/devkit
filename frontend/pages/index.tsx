import { DarkModeToggle } from "@/components/ui/darkmode-toggle";
import { Button } from "@/ui/button";
import { toast } from "sonner";

export default function Home() {
  return (
    <>
      <Button
        onClick={() => {
          toast("Hello, world!");
        }}
      >
        Hello, refine!
      </Button>
      <DarkModeToggle />
    </>
  );
}

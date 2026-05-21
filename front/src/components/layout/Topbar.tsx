import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { requestCompile, saveGraphSnapshot } from "@/components/state/graphState";

export function Topbar() {
  return (
    <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b bg-white">
      <SidebarTrigger />
      <span className="text-blue-600 text-base">⬡</span>
      <span className="text-[13px] font-semibold mr-2">NodeFlow</span>
      <Separator orientation="vertical" className="h-4" />
      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">↩</Button>
      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">↪</Button>
      <Separator orientation="vertical" className="h-4" />
      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={saveGraphSnapshot}>⊞ Save</Button>
      <Button size="sm" className="ml-auto h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700" onClick={requestCompile}>▶ Run</Button>
    </div>
  );
}

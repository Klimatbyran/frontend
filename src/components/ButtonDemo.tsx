import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export function ButtonDemo() {
  return (
    <div className="flex flex-col gap-8 p-8 bg-black-3">
      <div className="space-y-4">
        <h3 className="text-sm font-light text-grey mb-4">Text & Icon</h3>
        <div className="flex gap-4">
          <Button className="rounded-level-1">
            Button Text <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button className="rounded-level-1 opacity-80">
            Button Text <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button className="rounded-level-1 ring-1 ring-white">
            Button Text <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button className="rounded-level-1" disabled>
            Button Text <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-light text-grey mb-4">Text Only</h3>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-level-2">
            Button Text
          </Button>
          <Button variant="outline" className="rounded-level-2 opacity-80">
            Button Text
          </Button>
          <Button
            variant="outline"
            className="rounded-level-2 ring-1 ring-white"
          >
            Button Text
          </Button>
          <Button variant="outline" className="rounded-level-2" disabled>
            Button Text
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-light text-grey mb-4">Icon Only</h3>
        <div className="flex gap-4">
          <Button variant="icon" size="icon" className="rounded-level-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            className="rounded-level-2 opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            className="rounded-level-2 ring-1 ring-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            className="rounded-level-2"
            disabled
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

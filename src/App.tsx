import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster, toast } from "sonner";
import { Download, File, Loader2, Moon, Sun } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "./components/ui/button";

interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSelectMode, setDragSelectMode] = useState<
    "select" | "deselect" | null
  >(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    toast("🔍 Searching for attachments...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "findAttachments" },
          (response) => {
            setLoading(false);
            if (response?.attachments && response.attachments.length > 0) {
              setAttachments(response.attachments);
              toast.success(
                `✅ Found ${response.attachments.length} attachments!`
              );
            } else {
              toast.info("🤷‍♂️ No attachments found on this page.");
            }
          }
        );
      }
    });
  }, [toast]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set(attachments.map((a) => a.id));
    setSelected(allIds);
  };

  const handleDeselectAll = () => {
    setSelected(new Set());
  };

  const handleDownload = () => {
    const selectedFiles = attachments.filter((a) => selected.has(a.id));
    if (selectedFiles.length === 0) {
      toast.warning("⚠️ Please select at least one file to download.");
      return;
    }

    toast.success(`🚀 Download started for ${selectedFiles.length} files...`);
    const filesToDownload = selectedFiles.map(({ url, name: filename }) => ({
      url,
      filename,
    }));
    chrome.runtime.sendMessage({
      action: "downloadFiles",
      files: filesToDownload,
    });
  };

  const handleMouseDown = (id: string) => {
    const mode = selected.has(id) ? "deselect" : "select";
    setIsDragging(true);
    setDragSelectMode(mode);
    setSelected((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (mode === "select") {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragSelectMode(null);
  };

  const handleDragOver = (id: string) => {
    if (isDragging && dragSelectMode) {
      setSelected((prevSelected) => {
        const newSelected = new Set(prevSelected);
        if (dragSelectMode === "select") {
          newSelected.add(id);
        } else {
          newSelected.delete(id);
        }
        return newSelected;
      });
    }
  };

  return (
    <div
      className="w-[400px] p-4 bg-background text-foreground"
      onMouseUp={handleMouseUp}
    >
      <Card className="w-full border-none shadow-none">
        <CardHeader className="px-4 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-lg">
              <img src="/favicon.svg" alt="Logo" className="h-8 w-8" />
              ACSAI Downloader
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <Separator className="mt-2 mb-0" />
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : attachments.length > 0 ? (
            <ScrollArea className="h-64 w-full pr-4" ref={listRef}>
              <div className="flex flex-col gap-1">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center gap-3 p-2 unselectable rounded-md transition-colors ${
                      selected.has(attachment.id)
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleToggleSelect(attachment.id)}
                    onMouseDown={() => handleMouseDown(attachment.id)}
                    onMouseEnter={() => handleDragOver(attachment.id)}
                  >
                    <Checkbox
                      checked={selected.has(attachment.id)}
                      onCheckedChange={() => handleToggleSelect(attachment.id)}
                      className="pointer-events-none" // Prevent click events on checkbox itself
                    />
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 truncate">
                      <p className="font-medium text-sm unselectable">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground unselectable">
                        {attachment.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No downloadable files found on this page.
            </div>
          )}
        </CardContent>
        {attachments.length > 0 && (
          <CardFooter className="flex flex-col gap-2 pt-0">
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={handleDownload}
              disabled={selected.size === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Selected ({selected.size})
            </Button>
          </CardFooter>
        )}
      </Card>
      <Toaster position="top-center" duration={2500} />
    </div>
  );
}

export default App;

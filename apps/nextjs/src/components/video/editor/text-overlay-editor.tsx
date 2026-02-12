"use client";

import { useCallback, useState } from "react";
import { Bold, Italic, Plus, Trash2, Type } from "lucide-react";
import { v4 as uuid } from "uuid";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { Slider } from "@galileyo/ui/slider";

import type { TextOverlay } from "~/hooks/use-video-processor";

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  duration: number;
  currentTime: number;
  onOverlaysChange: (overlays: TextOverlay[]) => void;
  className?: string;
}

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Impact",
  "Comic Sans MS",
  "Courier New",
];

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#FF69B4",
];

export function TextOverlayEditor({
  overlays,
  duration,
  currentTime,
  onOverlaysChange,
  className,
}: TextOverlayEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOverlay, setEditingOverlay] = useState<TextOverlay | null>(
    null,
  );

  // Create a new overlay
  const handleAddOverlay = useCallback(() => {
    const newOverlay: TextOverlay = {
      id: uuid(),
      text: "Enter text here",
      x: 50,
      y: 50,
      startTime: Math.max(0, currentTime),
      endTime: Math.min(duration, currentTime + 3),
      fontSize: 24,
      fontColor: "#FFFFFF",
      fontFamily: "Arial",
      isBold: false,
      isItalic: false,
    };
    setEditingOverlay(newOverlay);
    setIsDialogOpen(true);
  }, [currentTime, duration]);

  // Edit existing overlay
  const handleEditOverlay = useCallback((overlay: TextOverlay) => {
    setEditingOverlay({ ...overlay });
    setIsDialogOpen(true);
  }, []);

  // Save overlay (add or update)
  const handleSaveOverlay = useCallback(() => {
    if (!editingOverlay) return;

    const existingIndex = overlays.findIndex((o) => o.id === editingOverlay.id);
    if (existingIndex >= 0) {
      // Update existing
      const newOverlays = [...overlays];
      newOverlays[existingIndex] = editingOverlay;
      onOverlaysChange(newOverlays);
    } else {
      // Add new
      onOverlaysChange([...overlays, editingOverlay]);
    }

    setIsDialogOpen(false);
    setEditingOverlay(null);
  }, [editingOverlay, overlays, onOverlaysChange]);

  // Delete overlay
  const handleDeleteOverlay = useCallback(
    (id: string) => {
      onOverlaysChange(overlays.filter((o) => o.id !== id));
    },
    [overlays, onOverlaysChange],
  );

  // Update editing overlay field
  const updateField = useCallback(
    <K extends keyof TextOverlay>(field: K, value: TextOverlay[K]) => {
      if (!editingOverlay) return;
      setEditingOverlay({ ...editingOverlay, [field]: value });
    },
    [editingOverlay],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Type className="h-4 w-4" />
          Text Overlays
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOverlay}
          className="h-7 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Text
        </Button>
      </div>

      {/* Overlay list */}
      {overlays.length === 0 ? (
        <p className="text-center text-xs text-slate-400">
          No text overlays added yet
        </p>
      ) : (
        <div className="space-y-2">
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
            >
              <div
                className="flex-1 cursor-pointer truncate text-sm"
                onClick={() => handleEditOverlay(overlay)}
                style={{
                  color: overlay.fontColor,
                  fontFamily: overlay.fontFamily,
                  fontWeight: overlay.isBold ? "bold" : "normal",
                  fontStyle: overlay.isItalic ? "italic" : "normal",
                }}
              >
                {overlay.text}
              </div>
              <span className="text-xs text-slate-400">
                {overlay.startTime.toFixed(1)}s - {overlay.endTime.toFixed(1)}s
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600"
                onClick={() => handleDeleteOverlay(overlay.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {overlays.find((o) => o.id === editingOverlay?.id)
                ? "Edit Text Overlay"
                : "Add Text Overlay"}
            </DialogTitle>
          </DialogHeader>

          {editingOverlay && (
            <div className="space-y-4">
              {/* Text input */}
              <div className="space-y-2">
                <Label>Text</Label>
                <Input
                  value={editingOverlay.text}
                  onChange={(e) => updateField("text", e.target.value)}
                  placeholder="Enter text..."
                />
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>X Position ({editingOverlay.x}%)</Label>
                  <Slider
                    value={[editingOverlay.x]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) => updateField("x", v[0] ?? 50)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y Position ({editingOverlay.y}%)</Label>
                  <Slider
                    value={[editingOverlay.y]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) => updateField("y", v[0] ?? 50)}
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time (s)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max={editingOverlay.endTime - 0.1}
                    value={editingOverlay.startTime}
                    onChange={(e) =>
                      updateField("startTime", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time (s)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={editingOverlay.startTime + 0.1}
                    max={duration}
                    value={editingOverlay.endTime}
                    onChange={(e) =>
                      updateField(
                        "endTime",
                        parseFloat(e.target.value) || duration,
                      )
                    }
                  />
                </div>
              </div>

              {/* Font settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <select
                    value={editingOverlay.fontFamily}
                    onChange={(e) => updateField("fontFamily", e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option
                        key={font}
                        value={font}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Font Size ({editingOverlay.fontSize}px)</Label>
                  <Slider
                    value={[editingOverlay.fontSize]}
                    min={12}
                    max={72}
                    step={1}
                    onValueChange={(v) => updateField("fontSize", v[0] ?? 24)}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "h-6 w-6 rounded-full border-2",
                        editingOverlay.fontColor === color
                          ? "border-cyan-500"
                          : "border-slate-300 dark:border-slate-600",
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => updateField("fontColor", color)}
                    />
                  ))}
                  <Input
                    type="color"
                    value={editingOverlay.fontColor}
                    onChange={(e) => updateField("fontColor", e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded p-0"
                  />
                </div>
              </div>

              {/* Style buttons */}
              <div className="flex gap-2">
                <Button
                  variant={editingOverlay.isBold ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => updateField("isBold", !editingOverlay.isBold)}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editingOverlay.isItalic ? "secondary" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateField("isItalic", !editingOverlay.isItalic)
                  }
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview */}
              <div className="rounded-lg bg-slate-900 p-4">
                <p className="text-center text-xs text-slate-400">Preview</p>
                <div
                  className="mt-2 text-center"
                  style={{
                    fontFamily: editingOverlay.fontFamily,
                    fontSize: editingOverlay.fontSize,
                    color: editingOverlay.fontColor,
                    fontWeight: editingOverlay.isBold ? "bold" : "normal",
                    fontStyle: editingOverlay.isItalic ? "italic" : "normal",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {editingOverlay.text || "Preview text"}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveOverlay}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

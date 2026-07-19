import { useCallback, useRef, type MouseEvent } from "react";
import { GalleryItem } from "./GalleryItem"; // तुमच्या फाईल पाथनुसार बदल करा
import type { UploadItem } from "@/types/events/upload";

// हे फक्त समजण्यासाठी प्रॉप्स आणि स्टेटचे टाईप्स दिले आहेत
interface GalleryGridProps {
  items: UploadItem[];
  selectedIds: string[];
  keyboard: { activeIndex: number };
  onSelect: (id: string, index: number, event: MouseEvent<HTMLButtonElement>) => void;
}

export const GalleryGrid = ({ items, selectedIds, keyboard, onSelect }: GalleryGridProps) => {
  // DOM एलिमेंट्सचे रेफ्स (Refs) स्टोअर करण्यासाठी
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // १. return च्या आणि if (items.length === 0) च्या आधी handleSelect फंक्शन ॲड केले
  const handleSelect = useCallback(
    (
      id: string,
      index: number,
      event: MouseEvent<HTMLButtonElement>,
    ) => {
      onSelect(id, index, event);
    },
    [onSelect],
  );

  // जर आयटम्स नसतील तर रिकामी स्टेट दाखवण्यासाठी
  if (items.length === 0) {
    return <div className="p-4 text-slate-500">No items uploaded yet.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {/* २. GalleryItem मॅपिंग आणि नवीन onClick/ref लॉजिक */}
      {items.map((item, index) => (
        <GalleryItem
          key={item.id}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          item={item}
          selected={
            selectedIds.includes(item.id) ||
            keyboard.activeIndex === index
          }
          onClick={(id, event) =>
            handleSelect(id, index, event)
          }
        />
      ))}
    </div>
  );
};
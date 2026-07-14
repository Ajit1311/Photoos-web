import BulkActions from "./BulkActions";
import GalleryFilters from "./GalleryFilters";
import GalleryHeader from "./GalleryHeader";
import GalleryToolbar from "./GalleryToolbar";
import PhotoDetails from "./PhotoDetails";
import PhotoGrid from "./PhotoGrid";
import SelectionToolbar from "./SelectionToolbar";

export default function GalleryWorkspace() {
  return (
    <section className="space-y-6">

      <GalleryHeader />

      <GalleryToolbar />

      <SelectionToolbar selectedCount={12} />

      <GalleryFilters />

      <BulkActions />

      <div className="grid gap-6 xl:grid-cols-12">

        <div className="xl:col-span-8">

          <PhotoGrid />

        </div>

        <div className="xl:col-span-4">

          <div className="sticky top-6">

            <PhotoDetails />

          </div>

        </div>

      </div>

    </section>
  );
}
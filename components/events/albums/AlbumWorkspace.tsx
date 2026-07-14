import AlbumCanvas from "./AlbumCanvas";
import AlbumHeader from "./AlbumHeader";
import AlbumProperties from "./AlbumProperties";
import AlbumToolbar from "./AlbumToolbar";
import AILayoutSuggestions from "./AILayoutSuggestions";
import PageNavigator from "./PageNavigator";
import SelectedPhotosPanel from "./SelectedPhotosPanel";

export default function AlbumWorkspace() {
  return (
    <section className="space-y-6">

      <AlbumHeader />

      <AlbumToolbar />

      <div className="grid gap-6 xl:grid-cols-12">

        <aside className="xl:col-span-2">

          <div className="sticky top-6">

            <PageNavigator />

          </div>

        </aside>

        <main className="xl:col-span-7">

          <AlbumCanvas />

        </main>

        <aside className="space-y-6 xl:col-span-3">

          <SelectedPhotosPanel />

          <AlbumProperties />

          <AILayoutSuggestions />

        </aside>

      </div>

    </section>
  );
}
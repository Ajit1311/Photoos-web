import ClientAccess from "../client-gallery/ClientAccess";
import ClientGalleryHeader from "../client-gallery/ClientGalleryHeader";
import ClientGalleryStats from "../client-gallery/ClientGalleryStats";
import GalleryVisibility from "../client-gallery/GalleryVisibility";
import QRCodeCard from "../client-gallery/QRCodeCard";
import ShareOptions from "../client-gallery/ShareOptions";
import PublishGalleryCard from "./PublishGalleryCard";

export default function DeliveryWorkspace() {
  return (
    <section className="space-y-6">

      <ClientGalleryHeader />

      <ClientGalleryStats />

      <div className="grid gap-6 xl:grid-cols-12">

        <div className="space-y-6 xl:col-span-8">

          <PublishGalleryCard />

          <GalleryVisibility />

          <ShareOptions />

        </div>

        <div className="space-y-6 xl:col-span-4">

          <QRCodeCard />

          <ClientAccess />

        </div>

      </div>

    </section>
  );
}
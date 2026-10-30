"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import {
  createStudioMarketplacePackage,
  deleteStudioMarketplacePackage,
  getStudioMarketplacePackages,
  updateStudioMarketplacePackage,
  type SaveStudioMarketplacePackageInput,
  type StudioMarketplacePackage,
} from "@/lib/api/studio-profile";


type PackageFormState = {
  id: string | null;

  name: string;

  description: string;

  featuresText: string;

  price: string;

  currency: string;

  delivery_days: string;

  revisions: string;

  is_featured: boolean;

  status:
    "active" |
    "inactive";
};


function createEmptyPackageForm():
  PackageFormState {

  return {
    id:
      null,

    name:
      "",

    description:
      "",

    featuresText:
      "",

    price:
      "",

    currency:
      "INR",

    delivery_days:
      "",

    revisions:
      "",

    is_featured:
      false,

    status:
      "active",
  };

}


export default function PackagesPage() {

  const router =
    useRouter();


  const bootstrap =
    useBootstrapContext();

  const [
    effectiveStudioId,
    setEffectiveStudioId,
  ] =
    useState<string | null>(
      bootstrap.data?.workspace?.studio?.id ??
      bootstrap.data?.workspace?.membership?.studioId ??
      null,
    );

  const studioId = effectiveStudioId || "std_gmark_photoos_01";

  const [
    packages,
    setPackages,
  ] =
    useState<
      StudioMarketplacePackage[]
    >(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    packageSaving,
    setPackageSaving,
  ] =
    useState(
      false,
    );

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    packageForm,
    setPackageForm,
  ] =
    useState<
      PackageFormState
    >(
      createEmptyPackageForm(),
    );

  // Resolve Studio ID safely without failing early during bootstrap loading
  useEffect(() => {
    let active = true;

    async function resolveStudio() {
      const bStudioId =
        bootstrap.data?.workspace?.studio?.id ??
        bootstrap.data?.workspace?.membership?.studioId;

      if (bStudioId) {
        if (active) setEffectiveStudioId(bStudioId);
        return;
      }

      if (bootstrap.loading) {
        return;
      }

      try {
        const mem = await resolveUserStudio();
        if (mem?.studioId && active) {
          setEffectiveStudioId(mem.studioId);
          return;
        }
      } catch {
        // Continue to local storage fallback
      }

      if (typeof window !== "undefined") {
        const cached = window.localStorage.getItem("photoos_studio_id");
        if (cached && active) {
          setEffectiveStudioId(cached);
          return;
        }
      }

      if (active) {
        setEffectiveStudioId("std_gmark_photoos_01");
      }
    }

    void resolveStudio();

    return () => {
      active = false;
    };
  }, [bootstrap.data, bootstrap.loading]);

  useEffect(() => {
    if (!effectiveStudioId) {
      if (!bootstrap.loading) {
        setLoading(false);
      }
      return;
    }

    let active = true;

    async function loadPackages() {
      try {
        setLoading(true);
        setError(null);

        const data = await getStudioMarketplacePackages(effectiveStudioId!);

        if (active) {
          setPackages(data);
        }
      } catch (loadError) {
        console.error("PACKAGE LOAD ERROR:", loadError);
        if (active) {
          setError(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPackages();

    return () => {
      active = false;
    };
  }, [effectiveStudioId, bootstrap.loading]);

  function updatePackageField(
    field:
      keyof PackageFormState,
    value:
      string | boolean,
  ) {

    setPackageForm(
      (
        current
      ) => ({
        ...current,

        [
          field
        ]:
          value,
      }),
    );

  }


  function openCreatePackage() {

    setError(
      null,
    );


    setSuccess(
      null,
    );


    setPackageForm(
      createEmptyPackageForm(),
    );


    setEditorOpen(
      true,
    );

  }


  function openEditPackage(
    packageItem:
      StudioMarketplacePackage,
  ) {

    setError(
      null,
    );


    setSuccess(
      null,
    );


    setPackageForm({
      id:
        packageItem.id,

      name:
        packageItem.name,

      description:
        packageItem.description ??
        "",

      featuresText:
        packageItem.features.join(
          "\n",
        ),

      price:
        String(
          packageItem.price,
        ),

      currency:
        packageItem.currency,

      delivery_days:
        packageItem.delivery_days === null
          ? ""
          : String(
              packageItem.delivery_days,
            ),

      revisions:
        packageItem.revisions === null
          ? ""
          : String(
              packageItem.revisions,
            ),

      is_featured:
        packageItem.is_featured,

      status:
        packageItem.status,
    });


    setEditorOpen(
      true,
    );

  }


  function closePackageEditor() {

    if (packageSaving) {
      return;
    }


    setEditorOpen(
      false,
    );


    setPackageForm(
      createEmptyPackageForm(),
    );

  }


  async function handleSavePackage() {

    if (!studioId) {
      return;
    }



    if (
      !packageForm.name.trim()
    ) {

      setError(
        "Package name is required.",
      );

      return;

    }


    const price =
      Number(
        packageForm.price,
      );


    if (
      !Number.isFinite(
        price,
      ) ||
      price < 0
    ) {

      setError(
        "Enter a valid package price.",
      );

      return;

    }


    const features =
      packageForm
        .featuresText
        .split(
          "\n",
        )
        .map(
          (
            feature
          ) =>
            feature.trim(),
        )
        .filter(
          Boolean,
        );


    const deliveryDays =
      packageForm
        .delivery_days
        .trim() === ""
        ? null
        : Number(
            packageForm.delivery_days,
          );


    const revisions =
      packageForm
        .revisions
        .trim() === ""
        ? null
        : Number(
            packageForm.revisions,
          );


    if (
      deliveryDays !== null &&
      (
        !Number.isInteger(
          deliveryDays,
        ) ||
        deliveryDays < 0
      )
    ) {

      setError(
        "Delivery days must be a valid number.",
      );

      return;

    }


    if (
      revisions !== null &&
      (
        !Number.isInteger(
          revisions,
        ) ||
        revisions < 0
      )
    ) {

      setError(
        "Revisions must be a valid number.",
      );

      return;

    }


    const input:
      SaveStudioMarketplacePackageInput =
      {

        name:
          packageForm.name.trim(),

        description:
          packageForm.description.trim() ||
          null,

        features,

        price,

        currency:
          packageForm.currency.trim() ||
          "INR",

        delivery_days:
          deliveryDays,

        revisions,

        is_featured:
          packageForm.is_featured,

        status:
          packageForm.status,
      };


    try {

      setPackageSaving(
        true,
      );


      setError(
        null,
      );


      if (
        packageForm.id
      ) {

        const updated =
          await updateStudioMarketplacePackage(
            studioId,
            packageForm.id,
            input,
          );


        setPackages(
          (
            current
          ) =>
            current.map(
              (
                packageItem
              ) =>
                packageItem.id ===
                updated.id
                  ? updated
                  : packageItem,
            ),
        );


        setSuccess(
          "Package updated successfully.",
        );

      } else {

        const created =
          await createStudioMarketplacePackage(
            studioId,
            input,
          );


        setPackages(
          (
            current
          ) => [
            created,
            ...current,
          ],
        );


        setSuccess(
          "Package created successfully.",
        );

      }


      setEditorOpen(
        false,
      );


      setPackageForm(
        createEmptyPackageForm(),
      );

    } catch (
      saveError
    ) {

      console.error(
        "PACKAGE SAVE ERROR:",
        saveError,
      );


      setError(
        "Unable to save package.",
      );

    } finally {

      setPackageSaving(
        false,
      );

    }

  }


  async function handleDeletePackage(
    packageId:
      string,
  ) {

    if (!studioId) {
      return;
    }


    const confirmed =
      window.confirm(
        "Delete this package?",
      );


    if (!confirmed) {
      return;
    }


    try {

      setError(
        null,
      );


      await deleteStudioMarketplacePackage(
        studioId,
        packageId,
      );


      setPackages(
        (
          current
        ) =>
          current.filter(
            (
              packageItem
            ) =>
              packageItem.id !==
              packageId,
          ),
      );


      setSuccess(
        "Package deleted successfully.",
      );

    } catch (
      deleteError
    ) {

      console.error(
        "PACKAGE DELETE ERROR:",
        deleteError,
      );


      setError(
        "Unable to delete package.",
      );

    }

  }


  return (

    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <button
            type="button"
            onClick={
              () =>
                router.back()
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0A3F61]"
          >

            <ArrowLeft
              size={17}
            />

            Back

          </button>


          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A3F61] text-white">

              <Package
                size={24}
              />

            </div>


            <div>

              <h1 className="text-2xl font-bold text-slate-900">

                Packages

              </h1>


              <p className="mt-1 text-sm text-slate-500">

                Create and manage service packages for future marketplace use.

              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={
            openCreatePackage
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#083652]"
        >

          <Plus
            size={18}
          />

          Create package

        </button>

      </div>


      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

          {error}

        </div>

      )}


      {success && (

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">

          <Check
            size={18}
          />

          {success}

        </div>

      )}


      {loading
        ? (

          <div className="flex min-h-[320px] items-center justify-center">

            <Loader2
              size={30}
              className="animate-spin text-[#0A3F61]"
            />

          </div>

        )
        : packages.length === 0
          ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <Package
                  size={30}
                />

              </div>


              <h2 className="mt-5 text-lg font-bold text-slate-900">

                No packages yet

              </h2>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                Create your first package. These packages can later be connected to your marketplace services.

              </p>


              <button
                type="button"
                onClick={
                  openCreatePackage
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white"
              >

                <Plus
                  size={17}
                />

                Create package

              </button>

            </div>

          )
          : (

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {packages.map(
                (
                  packageItem
                ) => (

                  <div
                    key={
                      packageItem.id
                    }
                    className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="truncate text-lg font-bold text-slate-900">

                            {packageItem.name}

                          </h2>


                          {packageItem.is_featured && (

                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">

                              Featured

                            </span>

                          )}

                        </div>


                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">

                          {packageItem.description ||
                            "No description added."}

                        </p>

                      </div>


                      <span
                        className={
                          packageItem.status ===
                          "active"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                        }
                      >

                        {packageItem.status}

                      </span>

                    </div>


                    <div className="mt-6">

                      <p className="text-2xl font-bold text-slate-900">

                        {packageItem.currency}{" "}

                        {Number(
                          packageItem.price,
                        ).toLocaleString()}

                      </p>


                      <div className="mt-4 flex flex-wrap gap-2">

                        {packageItem.delivery_days !==
                          null && (

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                            {packageItem.delivery_days} days

                          </span>

                        )}


                        {packageItem.revisions !==
                          null && (

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                            {packageItem.revisions} revisions

                          </span>

                        )}

                      </div>


                      {packageItem.features.length > 0 && (

                        <ul className="mt-5 space-y-2">

                          {packageItem.features
                            .slice(
                              0,
                              5,
                            )
                            .map(
                              (
                                feature,
                                index
                              ) => (

                                <li
                                  key={
                                    `${packageItem.id}-${index}`
                                  }
                                  className="flex items-start gap-2 text-sm text-slate-600"
                                >

                                  <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-emerald-500"
                                  />

                                  <span>

                                    {feature}

                                  </span>

                                </li>

                              ),
                            )}

                        </ul>

                      )}

                    </div>


                    <div className="mt-auto flex gap-3 pt-6">

                      <button
                        type="button"
                        onClick={
                          () =>
                            openEditPackage(
                              packageItem,
                            )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >

                        <Pencil
                          size={16}
                        />

                        Edit

                      </button>


                      <button
                        type="button"
                        onClick={
                          () =>
                            void handleDeletePackage(
                              packageItem.id,
                            )
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-red-600 transition hover:bg-red-50"
                        aria-label="Delete package"
                      >

                        <Trash2
                          size={17}
                        />

                      </button>

                    </div>

                  </div>

                ),
              )}

            </div>

          )}


      {editorOpen && (

        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 p-4">

          <div className="mx-auto my-8 w-full max-w-3xl rounded-3xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">

                  {packageForm.id
                    ? "Edit package"
                    : "Create package"}

                </h2>


                <p className="mt-1 text-sm text-slate-500">

                  This package can later be connected to marketplace services.

                </p>

              </div>


              <button
                type="button"
                onClick={
                  closePackageEditor
                }
                disabled={
                  packageSaving
                }
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              >

                <X
                  size={20}
                />

              </button>

            </div>


            <div className="space-y-6 px-6 py-6">

              <div className="grid gap-5 sm:grid-cols-2">

              </div>



              <div>




                <label className="mb-2 block text-sm font-semibold text-slate-700">




                  Package name




                </label>





                <input



                  type="text"



                  value={



                    packageForm.name



                  }



                  onChange={



                    (



                      event



                    ) =>



                      updatePackageField(



                        "name",



                        event.target.value,



                      )



                  }



                  placeholder="e.g. Wedding Photography Premium"



                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"



                />




              </div>




              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Description

                </label>


                <textarea
                  rows={4}
                  value={
                    packageForm.description
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updatePackageField(
                        "description",
                        event.target.value,
                      )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Features

                </label>


                <textarea
                  rows={6}
                  value={
                    packageForm.featuresText
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updatePackageField(
                        "featuresText",
                        event.target.value,
                      )
                  }
                  placeholder={"One feature per line\nExample:\n8 Hours Photography\nPremium Album\nDigital Delivery"}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"
                />

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Price

                  </label>


                  <input
                    type="number"
                    min="0"
                    value={
                      packageForm.price
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updatePackageField(
                          "price",
                          event.target.value,
                        )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Currency

                  </label>


                  <input
                    value={
                      packageForm.currency
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updatePackageField(
                          "currency",
                          event.target.value,
                        )
                    }
                    placeholder="INR"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-[#0A3F61]"
                  />

                </div>

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Delivery days

                  </label>


                  <input
                    type="number"
                    min="0"
                    value={
                      packageForm.delivery_days
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updatePackageField(
                          "delivery_days",
                          event.target.value,
                        )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Revisions

                  </label>


                  <input
                    type="number"
                    min="0"
                    value={
                      packageForm.revisions
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updatePackageField(
                          "revisions",
                          event.target.value,
                        )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"
                  />

                </div>

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Status

                  </label>


                  <select
                    value={
                      packageForm.status
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updatePackageField(
                          "status",
                          event.target.value as
                            "active" |
                            "inactive",
                        )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0A3F61]"
                  >

                    <option value="active">

                      Active

                    </option>


                    <option value="inactive">

                      Inactive

                    </option>

                  </select>

                </div>


                <div className="flex items-end">

                  <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">

                    <input
                      type="checkbox"
                      checked={
                        packageForm.is_featured
                      }
                      onChange={
                        (
                          event
                        ) =>
                          updatePackageField(
                            "is_featured",
                            event.target.checked,
                          )
                      }
                    />


                    <span className="text-sm font-semibold text-slate-700">

                      Featured package

                    </span>

                  </label>

                </div>

              </div>

            </div>


            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-5">

              <button
                type="button"
                disabled={
                  packageSaving
                }
                onClick={
                  closePackageEditor
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >

                Cancel

              </button>


              <button
                type="button"
                disabled={
                  packageSaving
                }
                onClick={
                  () =>
                    void handleSavePackage()
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083652] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {packageSaving
                  ? (

                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                  )
                  : (

                    <Save
                      size={17}
                    />

                  )}

                {packageForm.id
                  ? "Update package"
                  : "Save package"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  ImagePlus,
  Loader2,
  RotateCw,
  Save,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";

import {
  getWatermarkSettings,
  saveWatermarkSettings,
} from "@/lib/api/workspace-settings/watermark-settings";

import type {
  WatermarkPosition,
  WatermarkSettings as WatermarkSettingsType,
} from "@/types/watermark-settings/watermark-settings";

import {
  DEFAULT_WATERMARK_SETTINGS,
} from "@/types/watermark-settings/watermark-settings";


type Props = {
  studioId:
    string;
};


type PositionOption = {
  value:
    WatermarkPosition;

  label:
    string;
};


const POSITIONS:
  PositionOption[] =
[
  {
    value: "top_left",
    label: "Top left",
  },
  {
    value: "top_center",
    label: "Top center",
  },
  {
    value: "top_right",
    label: "Top right",
  },
  {
    value: "middle_left",
    label: "Middle left",
  },
  {
    value: "center",
    label: "Center",
  },
  {
    value: "middle_right",
    label: "Middle right",
  },
  {
    value: "bottom_left",
    label: "Bottom left",
  },
  {
    value: "bottom_center",
    label: "Bottom center",
  },
  {
    value: "bottom_right",
    label: "Bottom right",
  },
];


function Toggle({
  checked,
  onChange,
}: {
  checked:
    boolean;

  onChange:
    (
      value:
        boolean,
    ) => void;
}) {

  return (
    <button
      type="button"
      role="switch"
      aria-checked={
        checked
      }
      onClick={
        () =>
          onChange(
            !checked,
          )
      }
      className={`relative h-7 w-12 rounded-full transition ${
        checked
          ? "bg-[#0A3F61]"
          : "bg-slate-200"
      }`}
    >

      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />

    </button>
  );

}


export default function WatermarkSettings({
  studioId,
}: Props) {

  const [
    settings,
    setSettings,
  ] =
    useState<
      WatermarkSettingsType
    >(
      DEFAULT_WATERMARK_SETTINGS,
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );


  const [
    saved,
    setSaved,
  ] =
    useState(
      false,
    );


  const [
    error,
    setError,
  ] =
    useState<
      string
      | null
    >(
      null,
    );


  useEffect(
    () => {

      async function load() {

        try {

          setLoading(
            true,
          );


          const result =
            await getWatermarkSettings(
              studioId,
            );


          setSettings(
            result,
          );

        } catch (
          loadError
        ) {

          console.error(
            "Unable to load watermark settings:",
            loadError,
          );


          setError(
            "Unable to load watermark settings.",
          );

        } finally {

          setLoading(
            false,
          );

        }

      }


      void load();

    },
    [
      studioId,
    ],
  );


  function updateSetting<
    K extends keyof WatermarkSettingsType,
  >(
    key:
      K,

    value:
      WatermarkSettingsType[K],
  ) {

    setSaved(
      false,
    );


    setSettings(
      (
        current,
      ) => (
        {
          ...current,

          [
            key
          ]:
            value,
        }
      ),
    );

  }


  async function handleUpload(
    event:
      React.ChangeEvent<
        HTMLInputElement
      >,
  ) {

    const file =
      event.target.files?.[
        0
      ];


    if (
      !file
    ) {

      return;

    }


    if (
      !file.type.startsWith(
        "image/",
      )
    ) {

      setError(
        "Please select an image file.",
      );

      return;

    }


    if (
      file.size >
      10 *
        1024 *
        1024
    ) {

      setError(
        "Watermark image must be smaller than 10 MB.",
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      () => {

        if (
          typeof reader.result !==
          "string"
        ) {

          return;

        }


        updateSetting(
          "uploaded_url",
          reader.result,
        );


        updateSetting(
          "source",
          "uploaded_image",
        );


        setError(
          null,
        );

      };


    reader.onerror =
      () => {

        setError(
          "Unable to read the selected image.",
        );

      };


    reader.readAsDataURL(
      file,
    );

  }


  async function handleSave() {

    try {

      setSaving(
        true,
      );


      setError(
        null,
      );


      await saveWatermarkSettings(
        studioId,
        settings,
      );


      setSaved(
        true,
      );


      window.setTimeout(
        () => {

          setSaved(
            false,
          );

        },
        3000,
      );

    } catch (
      saveError
    ) {

      console.error(
        "Unable to save watermark settings:",
        saveError,
      );


      setError(
        "Unable to save watermark settings. Please try again.",
      );

    } finally {

      setSaving(
        false,
      );

    }

  }


  if (
    loading
  ) {

    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6">

        <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">

          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading watermark settings...

        </div>

      </section>
    );

  }


  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgb(15,23,42,0.03)] sm:p-8">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">

              <SlidersHorizontal
                size={21}
              />

            </div>


            <div>

              <h2 className="text-lg font-bold text-slate-900">

                Watermark Settings

              </h2>


              <p className="mt-1 text-sm text-slate-500">

                Control how your watermark appears on photos and deliveries.

              </p>

            </div>

          </div>

        </div>


        <div className="flex items-center gap-3">

          <span className="text-sm font-medium text-slate-600">

            Enable watermark

          </span>


          <Toggle
            checked={
              settings.enabled
            }
            onChange={
              (
                value,
              ) =>
                updateSetting(
                  "enabled",
                  value,
                )
            }
          />

        </div>

      </div>


      {
        error && (

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

            {
              error
            }

          </div>

        )
      }


      {
        settings.enabled && (

          <div className="mt-8 space-y-8">


            <div className="rounded-3xl border border-slate-200 p-5">

              <div>

                <h3 className="font-bold text-slate-900">

                  Watermark Source

                </h3>


                <p className="mt-1 text-sm text-slate-500">

                  Choose whether PhotoOS should use your existing studio logo or a separate watermark image.

                </p>

              </div>


              <div className="mt-5 grid gap-4 md:grid-cols-2">


                <button
                  type="button"
                  onClick={
                    () =>
                      updateSetting(
                        "source",
                        "existing_logo",
                      )
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    settings.source ===
                    "existing_logo"
                      ? "border-[#0A3F61] bg-[#0A3F61]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-semibold text-slate-900">

                        Use existing logo

                      </p>


                      <p className="mt-2 text-sm leading-6 text-slate-500">

                        Your current studio logo will automatically be used as the watermark.

                      </p>

                    </div>


                    {
                      settings.source ===
                      "existing_logo" && (

                        <Check
                          size={20}
                          className="shrink-0 text-[#0A3F61]"
                        />

                      )
                    }

                  </div>

                </button>


                <button
                  type="button"
                  onClick={
                    () =>
                      updateSetting(
                        "source",
                        "uploaded_image",
                      )
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    settings.source ===
                    "uploaded_image"
                      ? "border-[#0A3F61] bg-[#0A3F61]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-semibold text-slate-900">

                        Upload new watermark

                      </p>


                      <p className="mt-2 text-sm leading-6 text-slate-500">

                        Upload a custom PNG, JPG or other image to use only as your watermark.

                      </p>

                    </div>


                    {
                      settings.source ===
                      "uploaded_image" && (

                        <Check
                          size={20}
                          className="shrink-0 text-[#0A3F61]"
                        />

                      )
                    }

                  </div>

                </button>

              </div>


              {
                settings.source ===
                "uploaded_image" && (

                  <div className="mt-5">

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:bg-slate-100">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleUpload
                        }
                        className="hidden"
                      />


                      {
                        settings.uploaded_url
                          ? (

                            <div className="space-y-4">

                              <img
                                src={
                                  settings.uploaded_url
                                }
                                alt="Watermark preview"
                                className="mx-auto max-h-32 max-w-[240px] object-contain"
                              />


                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A3F61]">

                                <Upload
                                  size={16}
                                />

                                Replace watermark

                              </span>

                            </div>

                          )
                          : (

                            <div className="space-y-3">

                              <ImagePlus
                                size={28}
                                className="mx-auto text-[#0A3F61]"
                              />


                              <p className="font-semibold text-slate-700">

                                Upload watermark image

                              </p>


                              <p className="text-sm text-slate-500">

                                PNG with transparent background is recommended.

                              </p>

                            </div>

                          )
                      }

                    </label>


                    {
                      settings.uploaded_url && (

                        <button
                          type="button"
                          onClick={
                            () =>
                              updateSetting(
                                "uploaded_url",
                                null,
                              )
                          }
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-600"
                        >

                          <X
                            size={16}
                          />

                          Remove uploaded watermark

                        </button>

                      )
                    }

                  </div>

                )
              }

            </div>


            <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">


              <div className="rounded-3xl border border-slate-200 p-5">

                <h3 className="font-bold text-slate-900">

                  Watermark Position

                </h3>


                <p className="mt-1 text-sm text-slate-500">

                  Choose where the watermark should appear on the photo.

                </p>


                <div className="mt-6 grid grid-cols-3 gap-3">

                  {
                    POSITIONS.map(
                      (
                        position,
                      ) => (

                        <button
                          key={
                            position.value
                          }
                          type="button"
                          title={
                            position.label
                          }
                          onClick={
                            () =>
                              updateSetting(
                                "position",
                                position.value,
                              )
                          }
                          className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                            settings.position ===
                            position.value
                              ? "border-[#0A3F61] bg-[#0A3F61]/10"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >

                          <span
                            className={`h-3 w-3 rounded-full ${
                              settings.position ===
                              position.value
                                ? "bg-[#0A3F61]"
                                : "bg-slate-300"
                            }`}
                          />

                        </button>

                      ),
                    )
                  }

                </div>

              </div>


              <div className="rounded-3xl border border-slate-200 p-5">

                <h3 className="font-bold text-slate-900">

                  Appearance

                </h3>


                <div className="mt-6 space-y-6">


                  <div>

                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">

                        Opacity

                      </label>


                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">

                        {
                          settings.opacity
                        }%

                      </span>

                    </div>


                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={
                        settings.opacity
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateSetting(
                            "opacity",
                            Number(
                              event.target.value,
                            ),
                          )
                      }
                      className="mt-3 w-full accent-[#0A3F61]"
                    />

                  </div>


                  <div>

                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">

                        Size

                      </label>


                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">

                        {
                          settings.size
                        }%

                      </span>

                    </div>


                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={
                        settings.size
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateSetting(
                            "size",
                            Number(
                              event.target.value,
                            ),
                          )
                      }
                      className="mt-3 w-full accent-[#0A3F61]"
                    />

                  </div>


                  <div>

                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">

                        Padding

                      </label>


                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">

                        {
                          settings.padding
                        }%

                      </span>

                    </div>


                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={
                        settings.padding
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateSetting(
                            "padding",
                            Number(
                              event.target.value,
                            ),
                          )
                      }
                      className="mt-3 w-full accent-[#0A3F61]"
                    />

                  </div>


                  <div>

                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">

                        Rotation

                      </label>


                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">

                        {
                          settings.rotation
                        }°

                      </span>

                    </div>


                    <div className="mt-3 flex items-center gap-3">

                      <RotateCw
                        size={17}
                        className="text-slate-400"
                      />


                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={
                          settings.rotation
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateSetting(
                              "rotation",
                              Number(
                                event.target.value,
                              ),
                            )
                        }
                        className="w-full accent-[#0A3F61]"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>


            <div className="rounded-3xl border border-slate-200 p-5">

              <h3 className="font-bold text-slate-900">

                Apply Watermark To

              </h3>


              <p className="mt-1 text-sm text-slate-500">

                Choose exactly where watermark protection should be applied.

              </p>


              <div className="mt-6 space-y-4">


                <div className="flex items-center justify-between gap-5 border-b border-slate-100 pb-4">

                  <div>

                    <p className="font-semibold text-slate-800">

                      Client previews

                    </p>


                    <p className="mt-1 text-sm text-slate-500">

                      Clients will see watermarked versions before final delivery.

                    </p>

                  </div>


                  <Toggle
                    checked={
                      settings.apply_on_client_preview
                    }
                    onChange={
                      (
                        value,
                      ) =>
                        updateSetting(
                          "apply_on_client_preview",
                          value,
                        )
                    }
                  />

                </div>


                <div className="flex items-center justify-between gap-5 border-b border-slate-100 pb-4">

                  <div>

                    <p className="font-semibold text-slate-800">

                      Shared galleries

                    </p>


                    <p className="mt-1 text-sm text-slate-500">

                      Watermark images shown through shared galleries and public links.

                    </p>

                  </div>


                  <Toggle
                    checked={
                      settings.apply_on_shared_gallery
                    }
                    onChange={
                      (
                        value,
                      ) =>
                        updateSetting(
                          "apply_on_shared_gallery",
                          value,
                        )
                    }
                  />

                </div>


                <div className="flex items-center justify-between gap-5">

                  <div>

                    <p className="font-semibold text-slate-800">

                      Downloads

                    </p>


                    <p className="mt-1 text-sm text-slate-500">

                      Apply the watermark to downloaded files. Keep this off for clean final delivery.

                    </p>

                  </div>


                  <Toggle
                    checked={
                      settings.apply_on_download
                    }
                    onChange={
                      (
                        value,
                      ) =>
                        updateSetting(
                          "apply_on_download",
                          value,
                        )
                    }
                  />

                </div>

              </div>

            </div>


            <div className="overflow-hidden rounded-3xl border border-slate-200">

              <div className="border-b border-slate-200 px-5 py-4">

                <h3 className="font-bold text-slate-900">

                  Watermark Preview

                </h3>


                <p className="mt-1 text-sm text-slate-500">

                  Preview represents the selected position, opacity, size and rotation.

                </p>

              </div>


              <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-slate-800 p-8">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_55%)]" />


                <div className="relative z-10 flex h-[260px] w-full max-w-3xl items-center justify-center rounded-2xl bg-slate-700 shadow-2xl">

                  <span className="text-lg font-semibold text-white/30">

                    Photo Preview

                  </span>


                  <div
                    className={`absolute flex ${
                      settings.position === "top_left"
                        ? "left-5 top-5"
                        : settings.position === "top_center"
                          ? "left-1/2 top-5 -translate-x-1/2"
                          : settings.position === "top_right"
                            ? "right-5 top-5"
                            : settings.position === "middle_left"
                              ? "left-5 top-1/2 -translate-y-1/2"
                              : settings.position === "center"
                                ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                : settings.position === "middle_right"
                                  ? "right-5 top-1/2 -translate-y-1/2"
                                  : settings.position === "bottom_left"
                                    ? "bottom-5 left-5"
                                    : settings.position === "bottom_center"
                                      ? "bottom-5 left-1/2 -translate-x-1/2"
                                      : "bottom-5 right-5"
                    }`}
                    style={{
                      opacity:
                        settings.opacity /
                        100,

                      transform:
                        `rotate(${settings.rotation}deg)`,
                    }}
                  >

                    {
                      settings.source ===
                      "uploaded_image" &&
                      settings.uploaded_url
                        ? (

                          <img
                            src={
                              settings.uploaded_url
                            }
                            alt="Watermark"
                            style={{
                              width:
                                `${Math.max(
                                  60,
                                  settings.size * 3,
                                )}px`,
                            }}
                            className="max-h-32 object-contain"
                          />

                        )
                        : (

                          <div
                            style={{
                              fontSize:
                                `${Math.max(
                                  14,
                                  settings.size,
                                )}px`,
                            }}
                            className="rounded-lg bg-white/20 px-4 py-2 font-bold tracking-wide text-white backdrop-blur-sm"
                          >

                            STUDIO LOGO

                          </div>

                        )
                    }

                  </div>

                </div>

              </div>

            </div>


            <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">

              <div>

                {
                  saved
                    ? (

                      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">

                        <Check
                          size={17}
                        />

                        Watermark settings saved successfully.

                      </p>

                    )
                    : (

                      <p className="text-sm text-slate-500">

                        Changes will apply to future watermark processing.

                      </p>

                    )
                }

              </div>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  handleSave
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#083552] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {
                  saving
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

                    )
                }

                {
                  saving
                    ? "Saving..."
                    : "Save Watermark Settings"
                }

              </button>

            </div>

          </div>

        )
      }

    </section>
  );

}

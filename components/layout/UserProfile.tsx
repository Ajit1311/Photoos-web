"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  CheckCircle2,
  ChevronDown,
  Crown,
  Loader2,
  LogOut,
  Package,
  Pencil,
  UserCircle2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  usePlatformAdminStatus,
} from "@/hooks/usePlatformAdminStatus";


import {
  signOut,
} from "@/lib/auth/auth.service";

import {
  StudioLogoImage,
} from "@/components/studio/StudioLogoImage";

import {
  getStudioProfile,
  type StudioProfile,
} from "@/lib/api/studio-profile";

import {
  getMarketplaceVerifiedAddon,
} from "@/lib/api/subscription/marketplace-verified-addon";

import type {
  MarketplaceVerifiedAddonDetails,
} from "@/types/subscription/subscription";


export default function UserProfile() {

  const router =
    useRouter();


  const bootstrap =
    useBootstrapContext();



  const {
    isPlatformAdmin,
    loading:
      platformAdminLoading,
  } =
    usePlatformAdminStatus();


  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );


  const [
    signingOut,
    setSigningOut,
  ] =
    useState(
      false,
    );


  const [
    studioProfile,
    setStudioProfile,
  ] =
    useState<
      StudioProfile | null
    >(
      null,
    );


  const [
    loadingStudio,
    setLoadingStudio,
  ] =
    useState(
      true,
    );


  const [
    marketplaceVerifiedAddon,
    setMarketplaceVerifiedAddon,
  ] =
    useState<
      MarketplaceVerifiedAddonDetails | null
    >(
      null,
    );


  const studioId =
    bootstrap.data
      ?.workspace
      ?.studio
      ?.id ??
    null;


  const profile =
    bootstrap.data?.profile ??
    null;


  const role =
    bootstrap.data?.workspace?.role ??
    null;


  useEffect(
    () => {

      let active =
        true;


      async function loadStudioProfile() {

        if (!studioId) {

          if (active) {

            setStudioProfile(
              null,
            );

            setLoadingStudio(
              false,
            );

          }

          return;

        }


        try {

          setLoadingStudio(
            true,
          );


          const data =
            await getStudioProfile(
              studioId,
            );


          if (active) {

            setStudioProfile(
              data,
            );

          }

        } catch (
          error
        ) {

          console.error(
            "STUDIO PROFILE LOAD ERROR:",
            error,
          );

        } finally {

          if (active) {

            setLoadingStudio(
              false,
            );

          }

        }

      }


      void loadStudioProfile();


      function handleStudioProfileUpdated(
        event:
          Event,
      ) {

        const customEvent =
          event as CustomEvent<
            StudioProfile
          >;


        if (
          customEvent.detail
        ) {

          setStudioProfile(
            customEvent.detail,
          );

        }

      }


      window.addEventListener(
        "studio-profile-updated",
        handleStudioProfileUpdated,
      );


      return () => {

        active =
          false;


        window.removeEventListener(
          "studio-profile-updated",
          handleStudioProfileUpdated,
        );

      };

    },
    [
      studioId,
    ],
  );


  useEffect(
    () => {

      let active =
        true;


      async function loadMarketplaceVerifiedAddon() {

        if (!studioId) {

          if (active) {

            setMarketplaceVerifiedAddon(
              null,
            );

          }

          return;

        }


        try {

          const data =
            await getMarketplaceVerifiedAddon(
              studioId,
            );


          if (active) {

            setMarketplaceVerifiedAddon(
              data,
            );

          }

        } catch (
          error
        ) {

          console.error(
            "MARKETPLACE VERIFIED ADDON LOAD ERROR:",
            error,
          );


          if (active) {

            setMarketplaceVerifiedAddon(
              null,
            );

          }

        }

      }


      void loadMarketplaceVerifiedAddon();


      return () => {

        active =
          false;

      };

    },
    [
      studioId,
    ],
  );


  const studioName =
    studioProfile?.name?.trim() ||
    bootstrap.data
      ?.workspace
      ?.studio
      ?.name
      ?.trim() ||
    "PhotoOS Studio";


  const studioLogo =
    studioProfile
      ?.logo_url
      ?.trim() ||
    null;


  const studioInitial =
    studioName
      .charAt(
        0,
      )
      .toUpperCase() ||
    "P";


  const completionSource =
    studioProfile;


  const profileCompletionFields = [
    completionSource?.name,
    completionSource?.owner_name,
    completionSource?.description,
    completionSource?.contact_email,
    completionSource?.contact_phone,
    completionSource?.website,
    completionSource?.city,
    completionSource?.state,
    completionSource?.logo_url,
  ];


  const completedProfileFields =
    profileCompletionFields.filter(
      (
        value,
      ) => {

        if (
          typeof value === "string"
        ) {

          return (
            value.trim().length > 0
          );

        }


        return Boolean(
          value,
        );

      },
    ).length;


  const profileCompletion =
    Math.round(
      (
        completedProfileFields /
        profileCompletionFields.length
      ) * 100,
    );


  const displayName =
    profile?.full_name?.trim() ||
    "PhotoOS User";


  const roleLabel =
    isPlatformAdmin
      ? "PhotoOS Admin"
      : (
        role?.name ??
        "Workspace Member"
      );


  async function handleSignOut() {

    try {

      setSigningOut(
        true,
      );


      await signOut();


      router.replace(
        "/login",
      );

    } catch (
      error
    ) {

      console.error(
        "SIGN OUT ERROR:",
        error,
      );


      setSigningOut(
        false,
      );

    }

  }


  function handleEditProfile() {

    setOpen(
      false,
    );


    router.push(
      "/dashboard/profile",
    );

  }


  function handlePackages() {

    setOpen(
      false,
    );


    router.push(
      "/dashboard/packages",
    );

  }


  function handleProfilePreview() {

    setOpen(
      false,
    );


    router.push(
      "/dashboard/profile",
    );

  }


  return (

    <div
      className="relative"
      data-user-profile
    >

      <button
        type="button"
        onClick={
          () =>
            setOpen(
              (
                current,
              ) =>
                !current,
            )
        }
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
      >

        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">

          <div
            className="absolute -inset-1 rounded-full"
            style={{
              background:
                `conic-gradient(
                  #22C55E ${profileCompletion}%,
                  #E2E8F0 0
                )`,
            }}
          />

          <div
            className="absolute inset-[3px] rounded-full bg-white"
          />


          <div className="relative z-10 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#0A3F61] text-sm font-bold text-white">

            {studioLogo
              ? (
                <StudioLogoImage
                  src={
                    studioLogo
                  }
                  alt={
                    studioName
                  }
                  className="h-full w-full object-cover"
                
                  fallback={
                    studioInitial
                  }
                  fallbackClassName="flex h-full w-full items-center justify-center bg-[#0A3F61] text-sm font-bold text-white"
                />
              )
              : (
                <span>

                  {studioInitial}

                </span>
              )}

          </div>
        </div>


        <div className="hidden min-w-0 text-left xl:block">

          <h3 className="max-w-[180px] truncate text-sm font-semibold text-slate-900">

            {loadingStudio
              ? "Loading studio..."
              : studioName}

          </h3>


          <p className="max-w-[180px] truncate text-xs text-slate-500">

            {platformAdminLoading
              ? "Checking access..."
              : roleLabel}

          </p>

        </div>


        <ChevronDown
          size={18}
          className={
            `text-slate-500 transition-transform ${
              open
                ? "rotate-180"
                : ""
            }`
          }
        />

      </button>


      {open && (

        <div className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

          <div className="flex items-center gap-4 border-b border-slate-100 p-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A3F61] text-lg font-bold text-white">

              {studioLogo
                ? (
                  <StudioLogoImage
                    src={
                      studioLogo
                    }
                    alt={
                      studioName
                    }
                    className="h-full w-full object-cover"
                  
                  fallback={
                    studioInitial
                  }
                  fallbackClassName="flex h-full w-full items-center justify-center bg-[#0A3F61] text-lg font-bold text-white"
                />
                )
                : (
                  <span>

                    {studioInitial}

                  </span>
                )}

            </div>


            <div className="min-w-0">

              <p className="truncate font-semibold text-slate-900">

                {studioName}

              </p>


              <p className="truncate text-sm text-slate-500">

                {studioProfile?.contact_email ??
                  bootstrap.data?.user.email ??
                  "No email available"}

              </p>


              <p className="mt-1 truncate text-xs text-slate-400">

                {displayName}

              </p>

            </div>

          </div>


          <div className="space-y-1 border-b border-slate-100 p-2">

            <button
              type="button"
              onClick={
                handleEditProfile
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >

              <Pencil
                size={18}
                className="text-slate-500"
              />


              <span>

                 Profile

              </span>

            </button>


            <button
              type="button"
              onClick={
                handlePackages
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >

              <Package
                size={18}
                className="text-blue-600"
              />


              <div className="min-w-0">

                <p className="text-sm font-medium text-slate-700">

                  Packages

                </p>


                <p className="mt-0.5 text-xs font-normal text-slate-400">

                  Create & manage packages

                </p>

              </div>

            </button>

          </div>







          <button
            type="button"
            onClick={
              handleEditProfile
            }
            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
          >

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={18}
                className="text-green-500"
              />


              <div>

                <p className="text-sm font-medium text-slate-700">

                  Profile completion

                </p>


                <p className="mt-0.5 text-xs text-slate-400">

                  Complete your studio profile

                </p>

              </div>

            </div>


            <span className="text-sm font-semibold text-slate-700">

              {profileCompletion}%

            </span>

          </button>


          <button
            type="button"
            onClick={
              handleProfilePreview
            }
            className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
          >

            <UserCircle2
              size={19}
              className="text-slate-500"
            />


            <div>

              <p className="text-sm font-medium text-slate-700">

                {displayName}

              </p>


              <p className="mt-0.5 text-xs text-slate-400">

                {roleLabel}

              </p>

            </div>

          </button>


          {isPlatformAdmin && (

            <button
              type="button"
              onClick={
                () => {

                  setOpen(
                    false,
                  );


                  router.push(
                    "/platform-admin",
                  );

                }
              }
              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
            >

              <Crown
                size={18}
                className="text-amber-500"
              />


              <div>

                <p className="text-sm font-medium text-slate-700">

                  Platform administration

                </p>


                <p className="mt-0.5 text-xs text-slate-400">

                  Manage the PhotoOS platform

                </p>

              </div>

            </button>

          )}


          <div className="p-2">

            <button
              type="button"
              onClick={
                handleSignOut
              }
              disabled={
                signingOut
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {signingOut
                ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )
                : (
                  <LogOut
                    size={18}
                  />
                )}


              <span>

                {signingOut
                  ? "Signing out..."
                  : "Sign out"}

              </span>

            </button>

          </div>

        </div>

      )}

    </div>

  );

}

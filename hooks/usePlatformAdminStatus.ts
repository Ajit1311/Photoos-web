"use client";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  getCurrentUser,
} from "@/lib/auth/auth.service";

import {
  supabase,
} from "@/lib/supabase/client";


export function usePlatformAdminStatus() {

  const bootstrap =
    useBootstrapContext();


  const query =
    useAppQuery<
      boolean,
      Error
    >({

      queryKey:
        [
          "platform-admin-status",
          bootstrap.data?.user.id ??
          null,
        ],

      queryFn:
        async () => {

          const user =
            await getCurrentUser();


          if (!user) {

            return false;

          }


          const {
            data,
            error,
          } =
            await supabase
              .from(
                "platform_admins",
              )
              .select(
                "id",
              )
              .eq(
                "profile_id",
                user.id,
              )
              .eq(
                "status",
                "active",
              )
              .maybeSingle();


          if (error) {
            console.warn("[usePlatformAdminStatus] notice:", error.message);
            return false;
          }


          return Boolean(
            data,
          );

        },

      enabled:
        Boolean(
          bootstrap.data?.user.id,
        ) &&
        !bootstrap.loading,

      retry:
        1,

    });


  return {

    isPlatformAdmin:
      query.data ===
      true,

    loading:
      Boolean(
        bootstrap.data?.user.id,
      ) &&
      !bootstrap.loading &&
      query.isPending,

    error:
      query.error ??
      null,

    reload:
      query.refetch,

  };

}

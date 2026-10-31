"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  UserRoundPlus,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  clientsRepository,
} from "@/lib/repositories/clients.repository";


type FormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};


export default function CreateClientPage() {
  const router =
    useRouter();

  const queryClient =
    useQueryClient();

  const {
    studioId,
  } = useStudioId();


  // ===========================================================================
  // FORM STATE
  // ===========================================================================

  const [
    firstName,
    setFirstName,
  ] =
    useState("");

  const [
    lastName,
    setLastName,
  ] =
    useState("");

  const [
    companyName,
    setCompanyName,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");


  // ===========================================================================
  // VALIDATION STATE
  // ===========================================================================

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});


  // ===========================================================================
  // AUTO CLIENT NAME
  //
  // First Name + Last Name
  // automatically becomes Display Name / Client Name.
  // ===========================================================================

  const displayName =
    useMemo(
      () =>
        [
          firstName.trim(),
          lastName.trim(),
        ]
          .filter(Boolean)
          .join(" "),
      [
        firstName,
        lastName,
      ],
    );


  // ===========================================================================
  // FIELD ERROR HELPERS
  // ===========================================================================

  function clearFieldError(
    field: keyof FormErrors,
  ) {
    setErrors(
      (current) => {
        if (!current[field]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[field];

        return next;
      },
    );
  }


  // ===========================================================================
  // LOCAL FORM VALIDATION
  // ===========================================================================

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    const cleanPhone =
      phone.trim();

    const cleanEmail =
      email.trim();


    // -------------------------------------------------------------------------
    // FIRST NAME
    // -------------------------------------------------------------------------

    if (!cleanFirstName) {
      nextErrors.firstName =
        "First name is required.";
    }


    // -------------------------------------------------------------------------
    // LAST NAME
    // -------------------------------------------------------------------------

    if (!cleanLastName) {
      nextErrors.lastName =
        "Last name is required.";
    }


    // -------------------------------------------------------------------------
    // PHONE
    // -------------------------------------------------------------------------

    const sanitizedPhone = cleanPhone.replace(/^(\+91|0)/, "").replace(/[\s-]/g, "");
    if (!cleanPhone) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        sanitizedPhone,
      )
    ) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }


    // -------------------------------------------------------------------------
    // EMAIL
    // -------------------------------------------------------------------------

    if (!cleanEmail) {
      nextErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }


    setErrors(
      nextErrors,
    );

    return (
      Object.keys(
        nextErrors,
      ).length === 0
    );
  }


  // ===========================================================================
  // EXISTING EMAIL CHECK
  // ===========================================================================

  


  // ===========================================================================
  // CREATE CLIENT
  // ===========================================================================

  const createMutation =
    useMutation({
      mutationFn:
        async () => {

          const effectiveStudioId =
            studioId ||
            (typeof window !== "undefined"
              ? localStorage.getItem("photoos_active_studio_id") ||
                localStorage.getItem("photoos_studio_id")
              : null) ||
            "active";

          const cleanFirstName =
            firstName.trim();

          const cleanLastName =
            lastName.trim();

          const cleanDisplayName =
            displayName.trim();

          const cleanCompanyName =
            companyName.trim();

          const cleanPhone =
            phone.trim();

          const sanitizedPhone =
            cleanPhone.replace(/^(\+91|0)/, "").replace(/[\s-]/g, "");

          const cleanEmail =
            email.trim();

          const cleanNotes =
            notes.trim();


          // -------------------------------------------------------------------
          // Local validation
          // -------------------------------------------------------------------

          if (!validateForm()) {
            throw new Error(
              "Please fix the highlighted fields.",
            );
          }


          // -------------------------------------------------------------------
          // Existing email validation
          // -------------------------------------------------------------------

         


          // -------------------------------------------------------------------
          // Create client
          //
          // display_name is generated automatically.
          // -------------------------------------------------------------------

          return clientsRepository.create(
            effectiveStudioId,
            {
              display_name:
                cleanDisplayName,

              first_name:
                cleanFirstName,

              last_name:
                cleanLastName,

              company_name:
                cleanCompanyName ||
                undefined,

              phone:
                sanitizedPhone ||
                cleanPhone,

              email:
                cleanEmail,

              notes:
                cleanNotes ||
                undefined,
            },
          );
        },


      // =======================================================================
      // SUCCESS
      // =======================================================================

      onSuccess:
        async (createdClient) => {

          await queryClient.invalidateQueries({
            queryKey:
              ["clients"],
          });


          toast.success(
            "Client created successfully.",
            {
              description:
                "The client has been added to your studio.",
              position:
                "top-center",
            },
          );


          router.push(
            `/dashboard/clients/${createdClient.id}`,
          );
        },


      // =======================================================================
      // ERROR
      // =======================================================================

      onError:
        (error) => {

          console.error(
            "CREATE CLIENT ERROR:",
            error,
          );


          const message =
            error instanceof Error
              ? error.message
              : "Unable to create client.";


          toast.error(
            message,
            {
              position:
                "top-center",
            },
          );
        },
    });


  // ===========================================================================
  // SUBMIT
  // ===========================================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    if (
      createMutation.isPending
    ) {
      return;
    }


    const isValid =
      validateForm();


    if (!isValid) {
      toast.error(
        "Please fix the highlighted fields.",
        {
          position:
            "top-center",
        },
      );

      return;
    }


    await createMutation.mutateAsync();
  }


  // ===========================================================================
  // PAGE
  // ===========================================================================

  return (
    <main className="mx-auto max-w-5xl p-8">

      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}

      <div className="mb-8">

        <Link
          href="/dashboard/clients"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#0A3F61]"
        >
          <ArrowLeft
            className="h-4 w-4"
          />

          Back to Clients
        </Link>


        <div className="flex items-start gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A3F61] text-white shadow-sm">

            <UserRoundPlus
              className="h-7 w-7"
            />

          </div>


          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Create Client
            </h1>

            <p className="mt-2 text-slate-500">
              Add a new client to your studio.
            </p>

          </div>

        </div>

      </div>


      {/* ================================================================== */}
      {/* FORM */}
      {/* ================================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        noValidate
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >

        {/* ---------------------------------------------------------------- */}
        {/* FORM HEADER */}
        {/* ---------------------------------------------------------------- */}

        <div className="border-b border-slate-100 px-8 py-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Client Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the basic information for this client.
          </p>

        </div>


        {/* ---------------------------------------------------------------- */}
        {/* FORM BODY */}
        {/* ---------------------------------------------------------------- */}

        <div className="space-y-6 px-8 py-7">

          {/* ============================================================= */}
          {/* FIRST NAME + LAST NAME */}
          {/* ============================================================= */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* ----------------------------------------------------------- */}
            {/* FIRST NAME */}
            {/* ----------------------------------------------------------- */}

            <div>

              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <input
                id="first_name"
                name="first_name"
                type="text"
                value={
                  firstName
                }
                onChange={(event) => {
                  setFirstName(
                    event.target.value,
                  );

                  clearFieldError(
                    "firstName",
                  );
                }}
                placeholder="Enter first name"
                autoComplete="given-name"
                aria-invalid={
                  Boolean(
                    errors.firstName,
                  )
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A3F61]/10 ${
                  errors.firstName
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-[#0A3F61]"
                }`}
              />


              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.firstName}
                </p>
              )}

            </div>


            {/* ----------------------------------------------------------- */}
            {/* LAST NAME */}
            {/* ----------------------------------------------------------- */}

            <div>

              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <input
                id="last_name"
                name="last_name"
                type="text"
                value={
                  lastName
                }
                onChange={(event) => {
                  setLastName(
                    event.target.value,
                  );

                  clearFieldError(
                    "lastName",
                  );
                }}
                placeholder="Enter last name"
                autoComplete="family-name"
                aria-invalid={
                  Boolean(
                    errors.lastName,
                  )
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A3F61]/10 ${
                  errors.lastName
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-[#0A3F61]"
                }`}
              />


              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.lastName}
                </p>
              )}

            </div>

          </div>


          {/* ============================================================= */}
          {/* CLIENT NAME */}
          {/* ============================================================= */}

          <div>

            <label
              htmlFor="display_name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Client Name
            </label>


            <input
              id="display_name"
              name="display_name"
              type="text"
              value={
                displayName
              }
              readOnly
              aria-readonly="true"
              placeholder="Client name will appear automatically"
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />


            <p className="mt-2 text-xs text-slate-400">
              Client Name is automatically generated from First Name and Last Name.
            </p>

          </div>


          {/* ============================================================= */}
          {/* COMPANY NAME */}
          {/* ============================================================= */}

          <div>

            <label
              htmlFor="company_name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Company Name
            </label>


            <input
              id="company_name"
              name="company_name"
              type="text"
              value={
                companyName
              }
              onChange={(event) =>
                setCompanyName(
                  event.target.value,
                )
              }
              placeholder="Enter company name"
              autoComplete="organization"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
            />

          </div>


          {/* ============================================================= */}
          {/* PHONE + EMAIL */}
          {/* ============================================================= */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* ----------------------------------------------------------- */}
            {/* PHONE */}
            {/* ----------------------------------------------------------- */}

            <div>

              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <input
                id="phone"
                name="phone"
                type="tel"
                value={
                  phone
                }
                onChange={(event) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      "",
                    );

                  setPhone(
                    value.slice(
                      0,
                      10,
                    ),
                  );

                  clearFieldError(
                    "phone",
                  );
                }}
                placeholder="Enter 10-digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={
                  Boolean(
                    errors.phone,
                  )
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A3F61]/10 ${
                  errors.phone
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-[#0A3F61]"
                }`}
              />


              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.phone}
                </p>
              )}

            </div>


            {/* ----------------------------------------------------------- */}
            {/* EMAIL */}
            {/* ----------------------------------------------------------- */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>


              <input
                id="email"
                name="email"
                type="email"
                value={
                  email
                }
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );

                  clearFieldError(
                    "email",
                  );
                }}
                placeholder="Enter email address"
                autoComplete="email"
                aria-invalid={
                  Boolean(
                    errors.email,
                  )
                }
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A3F61]/10 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-[#0A3F61]"
                }`}
              />


              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.email}
                </p>
              )}

            </div>

          </div>


          {/* ============================================================= */}
          {/* NOTES */}
          {/* ============================================================= */}

          <div>

            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Notes
            </label>


            <textarea
              id="notes"
              name="notes"
              rows={5}
              value={
                notes
              }
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              placeholder="Add notes about this client..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
            />

          </div>

        </div>


        {/* ================================================================== */}
        {/* ACTIONS */}
        {/* ================================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-8 py-5">

          <Link
            href="/dashboard/clients"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>


          <button
            type="submit"
            disabled={
              createMutation.isPending
            }
            className="inline-flex min-w-[140px] items-center justify-center rounded-xl bg-[#0A3F61] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08344f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending
              ? "Creating..."
              : "Create Client"}
          </button>

        </div>

      </form>

    </main>
  );
}
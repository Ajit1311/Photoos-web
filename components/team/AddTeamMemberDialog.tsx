"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Loader2,
  Plus,
  Send,
  X,
} from "lucide-react";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  teamMemberRepository,
} from "@/lib/repositories/team-member.repository";

import type {
  StudioRoleDto,
} from "@/types/api/team-member";


type AddTeamMemberDialogProps = {
  roles: StudioRoleDto[];

  rolesLoading: boolean;

  onSuccess: () => void;
};


export function AddTeamMemberDialog({
  roles,
  rolesLoading,
  onSuccess,
}: AddTeamMemberDialogProps) {

  const {
    studioId,
  } = useStudioId();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    roleId,
    setRoleId,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  function resetForm() {

    setFullName("");

    setEmail("");

    setPhone("");

    setRoleId("");

    setError(null);
  }


  function handleClose() {

    if (submitting) {
      return;
    }

    resetForm();

    setOpen(false);
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    if (!studioId) {
      setError(
        "Studio could not be identified.",
      );

      return;
    }

    if (!fullName.trim()) {
      setError(
        "Please enter the team member name.",
      );

      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter the email address.",
      );

      return;
    }

    if (!roleId) {
      setError(
        "Please select a role.",
      );

      return;
    }

    setSubmitting(true);

    setError(null);

    try {

      await teamMemberRepository.create(
        studioId,
        {
          full_name:
            fullName.trim(),

          email:
            email.trim(),

          phone:
            phone.trim() || null,

          role_id:
            roleId,
        },
      );

      resetForm();

      setOpen(false);

      onSuccess();

    } catch (
      submissionError
    ) {

      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create team invitation.",
      );

    } finally {

      setSubmitting(false);

    }
  }


  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" />

        Add Team Member
      </button>


      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />


          <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-background p-6 shadow-xl">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-lg font-semibold">
                  Add Team Member
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Send an invitation to join
                  your studio team.
                </p>

              </div>


              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div className="space-y-2">

                <label
                  htmlFor="full-name"
                  className="text-sm font-medium"
                >
                  Full Name
                </label>

                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value,
                    )
                  }
                  placeholder="Enter full name"
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

              </div>


              <div className="space-y-2">

                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="member@example.com"
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

              </div>


              <div className="space-y-2">

                <label
                  htmlFor="phone"
                  className="text-sm font-medium"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  placeholder="+91 9876543210"
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

              </div>


              <div className="space-y-2">

                <label
                  htmlFor="role"
                  className="text-sm font-medium"
                >
                  Role
                </label>

                <select
                  id="role"
                  value={roleId}
                  onChange={(event) =>
                    setRoleId(
                      event.target.value,
                    )
                  }
                  disabled={
                    submitting ||
                    rolesLoading
                  }
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >

                  <option value="">
                    {rolesLoading
                      ? "Loading roles..."
                      : roles.length === 0
                        ? "No roles available"
                        : "Select role"}
                  </option>

                  {roles.map(
                    (role) => (
                      <option
                        key={role.role_id}
                        value={role.role_id}
                      >
                        {role.name}
                      </option>
                    ),
                  )}

                </select>

              </div>


              {error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}


              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="h-10 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    submitting ||
                    rolesLoading ||
                    roles.length === 0
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >

                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />

                      Send Invitation
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      ) : null}
    </>
  );
}
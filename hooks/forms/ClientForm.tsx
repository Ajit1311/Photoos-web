"use client";

import { FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useClientForm } from "@/hooks/forms/useClientForm";

type ClientFormProps = {
  onCancel?: () => void;
};

export function ClientForm({
  onCancel,
}: ClientFormProps) {
  const {
    form,
    submit,
    loading,
  } = useClientForm();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={submit}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_name">
              Client Name
            </Label>

            <Input
              id="display_name"
              placeholder="Enter client name"
              {...form.register(
                "display_name",
              )}
            />

            {form.formState.errors
              .display_name && (
              <p className="text-sm text-destructive">
                {
                  form.formState.errors
                    .display_name.message
                }
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number
            </Label>

            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              {...form.register("phone")}
            />

            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {
                  form.formState.errors
                    .phone.message
                }
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="client@example.com"
            autoComplete="email"
            {...form.register("email")}
          />

          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {
                form.formState.errors
                  .email.message
              }
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">
            Company Name
          </Label>

          <Input
            id="company_name"
            placeholder="Enter company name"
            {...form.register(
              "company_name",
            )}
          />

          {form.formState.errors
            .company_name && (
            <p className="text-sm text-destructive">
              {
                form.formState.errors
                  .company_name.message
              }
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">
            Notes
          </Label>

          <Textarea
            id="notes"
            rows={5}
            placeholder="Additional notes..."
            {...form.register("notes")}
          />

          {form.formState.errors.notes && (
            <p className="text-sm text-destructive">
              {
                form.formState.errors
                  .notes.message
              }
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Client"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
"use client";

import { FormProvider } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectForm } from "@/hooks/forms/useProjectForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ClientDto } from "@/types/api/client";
import type { CreateProjectRequest } from "@/types/api/project";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type ProjectFormProps = {
    studioId: string;
    clients: ClientDto[];
    loadingClients?: boolean;

    mode?: "create" | "edit";

    projectId?: string;

    initialValues?: Partial<CreateProjectRequest>;

    submitLabel?: string;

    onSuccess?: () => void;
    onCancel?: () => void;
};

export function ProjectForm({
    studioId,
    clients,
    loadingClients = false,

    mode = "create",

    projectId,

    initialValues,

    submitLabel = "Create Project",

    onSuccess,
    onCancel,
}: ProjectFormProps) {
    const {
        form,
        submit,
        loading,
    } = useProjectForm({

        mode,

        projectId,

        defaultValues: initialValues,

        onSuccess,

    });

    return (
        <FormProvider {...form}>
            <form
                onSubmit={submit}
                className="space-y-6"
            >
                {/* Title Field */}
                <div className="space-y-2">
                    <Label htmlFor="title">
                        Project Title
                    </Label>

                    <Input
                        id="title"
                        placeholder="Enter project title"
                        {...form.register("title")}
                    />

                    {form.formState.errors.title && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.title.message}
                        </p>
                    )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <Label htmlFor="description">
                        Description
                    </Label>

                    <Textarea
                        id="description"
                        rows={4}
                        placeholder="Enter project description"
                        {...form.register("description")}
                    />

                    {form.formState.errors.description && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.description.message}
                        </p>
                    )}
                </div>

                {/* Client Field */}
                <div className="space-y-2">
                    <Label htmlFor="client_id">
                        Client
                    </Label>

                    {clients.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <p className="text-sm font-medium">
                                No clients found
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                                You need to create your first client before creating a project.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Select
                                value={form.watch("client_id")}
                                onValueChange={(value) =>
                                    form.setValue(
                                        "client_id",
                                        value,
                                        {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        },
                                    )
                                }
                                disabled={
                                    loadingClients ||
                                    loading
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Client" />
                                </SelectTrigger>

                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem
                                            key={client.id}
                                            value={client.id}
                                        >
                                            {client.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {form.formState.errors.client_id && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.client_id.message}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Event Type and Event Date Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="event_type">
                            Event Type
                        </Label>

                        <Input
                            id="event_type"
                            placeholder="Wedding, Birthday, Corporate..."
                            {...form.register("event_type")}
                        />

                        {form.formState.errors.event_type && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.event_type.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event_date">
                            Event Date
                        </Label>

                        <Input
                            id="event_date"
                            type="date"
                            {...form.register("event_date")}
                        />

                        {form.formState.errors.event_date && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.event_date.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Budget and Advance Amount Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="budget">
                            Budget
                        </Label>

                        <Input
                            id="budget"
                            type="number"
                            step="0.01"
                            {...form.register("budget", {
                                valueAsNumber: true,
                            })}
                        />

                        {form.formState.errors.budget && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.budget.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="advance_amount">
                            Advance Amount
                        </Label>

                        <Input
                            id="advance_amount"
                            type="number"
                            step="0.01"
                            {...form.register("advance_amount", {
                                valueAsNumber: true,
                            })}
                        />

                        {form.formState.errors.advance_amount && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.advance_amount.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Notes Field */}
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
                            {form.formState.errors.notes.message}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
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

                    {clients.length === 0 ? (
                        <Link href="/dashboard/clients/create">
                            <Button type="button">
                                Create First Client
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : submitLabel}
                        </Button>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}
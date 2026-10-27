"use client";

import Link from "next/link";

import {
  ArrowRight,
  Mail,
  Phone,
  User,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  useClient,
} from "@/hooks/useClient";

type ProjectClientCardProps = {
  clientId: string;
};

export function ProjectClientCard({
  clientId,
}: ProjectClientCardProps) {

  const {
    data: client,
    isPending,
    error,
  } =
    useClient(
      clientId,
    );

  if (isPending) {

    return (
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        Loading client...
      </div>
    );

  }

  if (error || !client) {

    return (
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        Failed to load client.
      </div>
    );

  }

  return (

    <div className="rounded-xl border bg-background p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-lg font-semibold">
          Client Information
        </h2>

        <Link
          href={`/dashboard/clients/${client.id}`}
        >
          <Button
            variant="outline"
            className="gap-2"
          >
            View Client

            <ArrowRight
              className="h-4 w-4"
            />

          </Button>
        </Link>

      </div>

      <div className="space-y-5">

        <div className="flex items-center gap-3">

          <User
            className="h-5 w-5 text-muted-foreground"
          />

          <div>

            <p className="text-sm text-muted-foreground">
              Client Name
            </p>

            <p className="font-medium">
              {client.display_name}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Phone
            className="h-5 w-5 text-muted-foreground"
          />

          <div>

            <p className="text-sm text-muted-foreground">
              Phone
            </p>

            <p>
              {client.phone || "-"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Mail
            className="h-5 w-5 text-muted-foreground"
          />

          <div>

            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p>
              {client.email || "-"}
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}
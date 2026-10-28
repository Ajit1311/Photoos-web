"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  CalendarDays,
  FolderOpen,
  Plus,
} from "lucide-react";

import { useBootstrapContext } from "@/context/BootstrapContext";

import { useProjects } from "@/hooks/useProjects";
import { useEvents } from "@/hooks/useEvents";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventsListPage() {

  const {
    data: bootstrap,
  } = useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.studio?.id;

  const {
    projects,
    loading: projectsLoading,
  } =
    useProjects();

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState<string>("");

  const selectedProject =
    useMemo(
      () =>
        projects.find(
          (project) =>
            project.id ===
            selectedProjectId,
        ) ?? null,
      [
        projects,
        selectedProjectId,
      ],
    );

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const {
    events,
    loading,
    error,
    reload,
  } =
    useEvents({
      projectId:
        selectedProjectId,
    });
      return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight">
            Events
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Select a project to view and manage its events.
          </p>

        </div>

        <Link
  href={
    selectedProjectId
      ? `/dashboard/projects/${selectedProjectId}/events/new`
      : "#"
  }
>
  <Button
    disabled={!selectedProjectId}
  >
    <Plus className="mr-2 h-4 w-4" />
    Create Event
  </Button>
</Link>

      </div>

      <Card>

        <CardHeader>

          <CardTitle>
            Select Project
          </CardTitle>

        </CardHeader>

        <CardContent>

          <Select
            value={selectedProjectId}
            onValueChange={
              setSelectedProjectId
            }
          >

            <SelectTrigger className="w-full max-w-md">

              <SelectValue placeholder="Choose a project" />

            </SelectTrigger>

            <SelectContent>

              {projects.map(
                (project) => (
                  <SelectItem
                    key={project.id}
                    value={project.id}
                  >
                    {project.title}
                  </SelectItem>
                ),
              )}

            </SelectContent>

          </Select>

        </CardContent>

      </Card>
            {!selectedProjectId && (

        <Card>

          <CardContent className="flex flex-col items-center justify-center py-16">

            <FolderOpen className="mb-4 h-12 w-12 text-slate-400" />

            <h2 className="text-xl font-semibold">
              Select a Project
            </h2>

            <p className="mt-2 max-w-md text-center text-sm text-slate-500">
              Choose a project to view its events.
            </p>

          </CardContent>

        </Card>

      )}

      {selectedProjectId && loading && (

        <Card>

          <CardContent className="py-16 text-center text-slate-500">

            Loading events...

          </CardContent>

        </Card>

      )}

      {selectedProjectId &&
        error && (

        <Card>

          <CardContent className="py-16 text-center">

            <p className="text-red-600">
              Failed to load events.
            </p>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() => reload()}
            >
              Retry
            </Button>

          </CardContent>

        </Card>

      )}

      {selectedProjectId &&
        !loading &&
        !error &&
        events.length === 0 && (

        <Card>

          <CardContent className="flex flex-col items-center justify-center py-16">

            <CalendarDays className="mb-4 h-12 w-12 text-slate-400" />

            <h2 className="text-xl font-semibold">
              No Events Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              This project does not have any events yet.
            </p>

          </CardContent>

        </Card>

      )}

      {selectedProjectId &&
        events.length > 0 && (

        <div className="grid gap-4">

          {events.map(
            (event) => (

              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
              >

                <Card className="transition hover:border-slate-300 hover:shadow-md">

                  <CardContent className="flex items-center justify-between p-6">

                    <div>

                      <h3 className="text-lg font-semibold">
                        {event.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(
                          event.shootDate,
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {event.venue ?? "Venue not specified"}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-sm font-medium capitalize">
                        {event.status.replaceAll(
                          "_",
                          " ",
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Event #{event.eventNumber}
                      </p>

                    </div>

                  </CardContent>

                </Card>

              </Link>

            ),
          )}

        </div>

      )}

    </div>
  );

}
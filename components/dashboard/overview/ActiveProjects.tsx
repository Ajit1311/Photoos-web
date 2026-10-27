"use client";

import Link from "next/link";

import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import {
  useProjects,
} from "@/hooks/useProjects";


function formatDate(
  value: string | null,
) {

  if (!value) {

    return "No event date";

  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );

}


function formatStatus(
  value: string,
) {

  return value
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );

}


export default function ActiveProjects() {

  const {
    projects,
    loading,
  } =
    useProjects({
      page: 1,
      limit: 4,
    });


  return (

    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_4px_24px_rgba(10,63,97,0.045)] sm:p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Active Projects
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Current projects from your studio.
          </p>

        </div>


        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-primary transition-all hover:border-primary/30 hover:bg-muted"
        >

          View All

          <ChevronRight
            size={16}
          />

        </Link>

      </div>


      {
        loading
          ? (

              <div className="space-y-5">

                {
                  Array.from(
                    {
                      length: 4,
                    },
                  ).map(
                    (
                      _,
                      index,
                    ) => (

                      <div
                        key={index}
                        className="animate-pulse rounded-xl border border-border/70 bg-background/60 p-4 sm:p-5"
                      >

                        <div className="flex items-start justify-between">

                          <div className="space-y-3">

                            <div className="h-5 w-40 rounded bg-slate-200" />

                            <div className="h-4 w-28 rounded bg-slate-100" />

                          </div>


                          <div className="h-8 w-24 rounded-full bg-slate-100" />

                        </div>


                        <div className="mt-5 space-y-2">

                          <div className="flex justify-between">

                            <div className="h-4 w-16 rounded bg-slate-100" />

                            <div className="h-4 w-10 rounded bg-slate-100" />

                          </div>


                          <div className="h-3 w-full rounded-full bg-slate-100" />

                        </div>

                      </div>

                    ),
                  )
                }

              </div>

            )
          : projects.length === 0
            ? (

                <div className="rounded-xl border border-dashed border-border py-12 text-center">

                  <CalendarDays
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 font-medium text-slate-700">
                    No projects found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Create your first project to see it here.
                  </p>

                </div>

              )
            : (

                <div className="space-y-5">

                  {
                    projects.map(
                      (
                        project,
                      ) => (

                        <Link
                          key={
                            project.id
                          }
                          href={
                            `/dashboard/projects/${project.id}`
                          }
                          className="block rounded-xl border border-border/70 bg-background/50 p-4 transition-all hover:border-primary/25 hover:bg-muted/40 hover:shadow-sm sm:p-5"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <h3 className="truncate font-semibold text-foreground">

                                {
                                  project.title
                                }

                              </h3>


                              <p className="mt-2 text-sm text-muted-foreground">

                                {
                                  formatDate(
                                    project.event_date,
                                  )
                                }

                              </p>

                            </div>


                            <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-2 text-sm text-primary">

                              <CalendarDays
                                size={16}
                              />

                              {
                                formatStatus(
                                  project.status,
                                )
                              }

                            </div>

                          </div>


                          <div className="mt-5">

                            <div className="mb-2 flex justify-between">

                              <span className="text-sm text-slate-500">

                                Payment Progress

                              </span>


                              <span className="font-semibold text-slate-700">

                                {
                                  project.budget > 0
                                    ? `${Math.min(
                                        Math.round(
                                          (
                                            project.advance_amount /
                                            project.budget
                                          ) *
                                          100,
                                        ),
                                        100,
                                      )}%`
                                    : "0%"
                                }

                              </span>

                            </div>


                            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                              <div
                                className="h-full rounded-full bg-[#0A3F61]"
                                style={{
                                  width:
                                    project.budget > 0
                                      ? `${Math.min(
                                          Math.max(
                                            Math.round(
                                              (
                                                project.advance_amount /
                                                project.budget
                                              ) *
                                              100,
                                            ),
                                            0,
                                          ),
                                          100,
                                        )}%`
                                      : "0%",
                                }}
                              />

                            </div>

                          </div>

                        </Link>

                      ),
                    )
                  }

                </div>

              )
      }

    </section>

  );

}

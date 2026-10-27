"use client";

import Link from "next/link";
import {
  getMarketplaceFreelancers,
  type MarketplaceFreelancer,
} from "@/lib/api/marketplace/freelancers";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function FreelancersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [freelancers, setFreelancers] = useState<MarketplaceFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFreelancers() {
      try {
        setLoading(true);
        setError("");

        const data = await getMarketplaceFreelancers({
          limit: 50,
          offset: 0,
        });

        if (active) {
          setFreelancers(data);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load freelancers.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFreelancers();

    return () => {
      active = false;
    };
  }, []);

  const roles = useMemo(() => {
    const uniqueRoles = freelancers
      .map((freelancer) => freelancer.primary_role?.trim())
      .filter((value): value is string => Boolean(value));

    return ["All", ...Array.from(new Set(uniqueRoles))];
  }, [freelancers]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return freelancers.filter((freelancer) => {
      const searchableSkills: string[] = freelancer.skills ?? [];
      const location = [
        freelancer.location,
        freelancer.city,
        freelancer.state,
      ]
        .filter(Boolean)
        .join(", ");

      const matchesSearch =
        !query ||
        freelancer.display_name.toLowerCase().includes(query) ||
        (freelancer.primary_role ?? "").toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        searchableSkills.some((skill) =>
          skill.toLowerCase().includes(query),
        );

      const matchesRole =
        role === "All" ||
        (freelancer.primary_role ?? "")
          .toLowerCase() === role.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [freelancers, role, search]);

  return (
    <main className="mx-auto max-w-[1500px] space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A3F61] text-white shadow-sm">
              <BriefcaseBusiness size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Hire Freelancer
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Find photographers, cinematographers, editors and
                other creative professionals for your studio.
              </p>
            </div>
          </div>
        </div>


      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search freelancer, service or location..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#0A3F61] focus:bg-white"
            />
          </div>

          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0A3F61]"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            Loading freelancers...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h2 className="text-lg font-bold text-red-800">
            Unable to load freelancers
          </h2>
          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
        </div>
      ) : (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((freelancer) => (
          <Link
            key={freelancer.id}
            href={`/dashboard/marketplace/freelancers/${freelancer.id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          >
            <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
              {freelancer.profile_image_url ? (
                <img
                  src={freelancer.profile_image_url}
                  alt={freelancer.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#0A3F61] shadow-sm">
                  <UserRound size={34} />
                </div>
              )}

              <span
                className={[
                  "absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                  freelancer.availability_status === "available"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600",
                ].join(" ")}
              >
                {freelancer.availability_status === "available"
                  ? "Available"
                  : freelancer.availability_status || "Unavailable"}
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {freelancer.display_name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-[#0A3F61]">
                    {freelancer.primary_role || "Creative Professional"}
                  </p>
                </div>


              </div>

              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {[freelancer.location, freelancer.city, freelancer.state].filter(Boolean).join(", ") || "Location not specified"}
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={15} />
                  {freelancer.experience_years ?? 0} years experience
                </div>
              </div>

              <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                {freelancer.bio || "Professional freelancer available for studio assignments and creative projects."}
              </p>

              <div className="flex flex-wrap gap-2">
                 {(freelancer.skills ?? []).map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-slate-700">
                  View Profile
                </span>

                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0A3F61]"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BriefcaseBusiness
            size={38}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No freelancers found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try another search or service category.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
        Freelancer phone and email are private. They will be
        available to the studio only after a freelancer hiring is
        confirmed.
      </div>
    </main>
  );
}

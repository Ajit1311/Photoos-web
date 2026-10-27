"use client";

import Link from "next/link";

import {
    ArrowRight,
    Briefcase,
    Mail,
    Phone,
    User,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    useTeamMember,
} from "@/hooks/useTeamMember";

type ProjectManagerCardProps = {
    managerId: string | null;
};

export function ProjectManagerCard({
    managerId,
}: ProjectManagerCardProps) {

    if (!managerId) {

        return (

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <h2 className="text-lg font-semibold">
                    Project Manager
                </h2>

                <p className="mt-4 text-muted-foreground">
                    No project manager assigned.
                </p>

            </div>

        );

    }

    const {
        member,
        loading,
        error,
    } =
        useTeamMember(
            managerId,
        );

    if (loading) {

        return (

            <div className="rounded-xl border bg-background p-6 shadow-sm">
                Loading manager...
            </div>

        );

    }

    if (error || !member) {

        return (

            <div className="rounded-xl border bg-background p-6 shadow-sm">
                Failed to load manager.
            </div>

        );

    }

    return (

        <div className="rounded-xl border bg-background p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

                <h2 className="text-lg font-semibold">
                    Project Manager
                </h2>

                <Link
                    href={`/dashboard/team/${member.id}`}
                >
                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled
                    >
                        View Member
                    </Button>
                </Link>

            </div>

            <div className="space-y-5">

                <div className="flex items-center gap-3">

                    <User className="h-5 w-5 text-muted-foreground" />

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Name
                        </p>

                        <p className="font-medium">
                            {member.email ?? member.employeeCode ?? member.roleName}
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <Briefcase className="h-5 w-5 text-muted-foreground" />

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Role
                        </p>

                        <p>
                            {member.roleName ?? "-"}
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <Phone className="h-5 w-5 text-muted-foreground" />

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Phone
                        </p>

                        <p>
                            {member.email ?? "-"}
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-3">

                    <Mail className="h-5 w-5 text-muted-foreground" />

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Email
                        </p>

                        <p>
                            {member.email ?? "-"}
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}
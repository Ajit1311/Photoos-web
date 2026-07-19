"use client";

import {
  ArrowLeft,
  MoreHorizontal,
  Upload,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import WorkspaceStats from "@/components/events/workspace/stats/WorkspaceStats";

export default function WorkspaceHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">

      <div className="w-full px-8 py-6">

        <div className="flex items-start justify-between gap-6">

          {/* Left */}

          <div className="flex items-start gap-5">

            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Wedding of Rahul & Priya
              </h1>

              <div className="mt-2 flex items-center gap-3">

                <span className="text-sm font-medium text-slate-700">
                  Rahul Patil
                </span>

                <Badge className="bg-green-600 hover:bg-green-600">
                  Active
                </Badge>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                15 Dec 2026 • Kolhapur • Wedding
              </p>

            </div>

          </div>

          {/* Right */}

          <div className="flex items-center gap-3">

            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>

            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Payment
            </Button>

            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>

          </div>

        </div>

        <div className="mt-6">
          <WorkspaceStats />
        </div>

      </div>

    </header>
  );
}
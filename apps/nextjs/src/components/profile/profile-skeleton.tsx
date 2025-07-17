"use client";

import React from "react";

import { Card, CardContent, CardHeader } from "@galileyo/ui/card";
import { Separator } from "@galileyo/ui/separator";
import { Skeleton } from "@galileyo/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div>
              <Skeleton className="mb-2 h-8 w-48" />
              <Skeleton className="h-5 w-80" />
            </div>
          </div>
        </div>

        {/* Settings Tabs Skeleton */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4 rounded-xl border border-slate-200 bg-white/50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
            {["General", "Security", "Notifications", "Devices"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                disabled
                className="rounded-lg"
              >
                <Skeleton className="mr-2 h-4 w-4" />
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* General Settings Skeleton */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-slate-200 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900/80">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Skeleton */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" />
                  </div>
                  <div>
                    <Skeleton className="mb-1 h-5 w-32" />
                    <Skeleton className="mb-3 h-4 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24 rounded-lg" />
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                {/* Personal Information Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  ))}
                </div>

                <div>
                  <Skeleton className="mb-2 h-4 w-16" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>

                <div className="flex justify-end">
                  <Skeleton className="h-11 w-32 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

"use client";

import type { MarkerEvent } from "react-map-gl/maplibre";
import { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";

import type { MapData } from "./types";
import { UserAvatar } from "~/components/feed/user-avatar";
import { getInfluencerImageUrl } from "~/lib/image";
import { ALERT_TYPE_CONFIG } from "~/lib/types/alert";

export function MapMarker({
  item,
  anchor = "bottom",
  onClick,
}: {
  item: MapData;
  anchor?: "bottom" | "center" | "top";
  onClick?: () => void;
}) {
  const handleClick = (event: MarkerEvent<MouseEvent>) => {
    // If we let the click event propagates to the map,
    // it will immediately close the popup with `closeOnClick: true`
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    event.originalEvent.stopImmediatePropagation();
    onClick?.();
  };

  const alertConfig = useMemo(() => {
    return ALERT_TYPE_CONFIG[item.alert?.type ?? "UNKNOWN"];
  }, [item.alert?.type]);

  const IconComponent = useMemo(() => {
    return alertConfig.icon;
  }, [alertConfig]);

  return (
    <Marker
      latitude={item.latitude}
      longitude={item.longitude}
      anchor={anchor}
      onClick={handleClick}
    >
      {/* <div className="w-4 h-4 bg-red-500 rounded-full"></div> */}
      {item.alert && item.alert.is_influencer && (
        // <div className="flex items-center justify-center">
        //   <img
        //     className="h-6 w-6 rounded-full"
        //     src={
        //       getInfluencerImageUrl(item.alert.influencer_page?.image) ?? ""
        //     }
        //     alt={item.alert.influencer_page?.title ?? ""}
        //   />
        // </div>
        <div className="rounded-full border-2 border-purple-500">
          <UserAvatar
            name={item.alert.influencer_page?.title ?? ""}
            image={
              getInfluencerImageUrl(item.alert.influencer_page?.image) ?? ""
            }
            isVerified={false}
            isInfluencer={false}
            onlyAvatar={true}
            size="xs"
          />
        </div>
      )}

      {item.alert && !item.alert.is_influencer && (
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white p-1"
          style={{ backgroundColor: alertConfig.color }}
        >
          <IconComponent />
        </div>
      )}
    </Marker>
  );
}

"use client";

// import { cloneElement, memo, useState } from "react";
// import { createPortal } from "react-dom";
// import { useControl } from "react-map-gl/maplibre";

// import type { IControl, MapInstance } from 'react-map-gl/maplibre';

// class OverlayControl implements IControl {
//   _map: MapInstance | null = null;
//   _container: HTMLElement | null = null;
//   _redraw: () => void;

//   constructor(redraw: () => void) {
//     this._redraw = redraw;
//   }

//   onAdd(map: MapInstance) {
//     this._map = map;
//     map.on('move', this._redraw);

//     this._container = document.createElement('div');
//     this._redraw();

//     return this._container;
//   }

//   onRemove() {
//     this._container?.remove();
//     this._map?.off('move', this._redraw);
//     this._map = null;
//   }

//   getMap() {
//     return this._map;
//   }

//   getElement() {
//     return this._container as HTMLElement;
//   }
// }

// interface ListToggleControlProps {
//   children: React.ReactElement;
// }

// function ListToggleControl(props: ListToggleControlProps) {
//   const [, setVersion] = useState(0);

//   const ctrl = useControl<OverlayControl>(() => {
//     const forceUpdate = () => setVersion(v => v + 1);

//     return new OverlayControl(forceUpdate);
//   });

//   const map = ctrl.getMap();

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return map && createPortal(cloneElement<any>(props.children, { map }), ctrl.getElement());
// }

// export default memo(ListToggleControl);
import { useCallback } from "react";
import { List } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

import { CustomControl } from "~/components/ui/map/custom-control";
import { useAlertMapContext } from "../alert-map-context";

export const ListToggleControl = () => {
  const { current: map } = useMap();
  const { toggleList } = useAlertMapContext();

  const toggleListCallback = useCallback(() => {
    if (!map) return;

    toggleList();
  }, [map, toggleList]);

  return (
    <CustomControl position="topRight">
      <CustomControl.DeafultButton
        title="Show List"
        icon={() => <List className="size-4 text-black" />}
        onClick={() => {
          toggleListCallback();
        }}
      />
    </CustomControl>
  );
};

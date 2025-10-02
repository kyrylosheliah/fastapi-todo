import { useEffect, useState, type RefObject } from "react";

export type PositionVariant = "start" | "center" | "end";

export type PositionCoord = { x: PositionVariant; y: PositionVariant };
export type PositionTopLeft = { top: number; left: number };

const CalculateAnchorPoint = (
  anchorElement: Element | null,
  popoverElement: Element | null,
  coord: PositionCoord,
  stickyParent?: boolean
): PositionTopLeft | undefined => {
  const anchorRect = anchorElement?.getBoundingClientRect();
  const popoverRect = popoverElement?.getBoundingClientRect();
  if (!anchorRect || !popoverRect) {
    return undefined;
  }
  let position: PositionTopLeft = {
    left: anchorRect.left,
    top: anchorRect.top,
  };
  switch (coord.x) {
    case "start":
      position.left -= popoverRect.width;
      break;
    case "center":
      position.left += anchorRect.width / 2 - popoverRect.width / 2;
      break;
    case "end":
      position.left += anchorRect.width;
      break;
  }
  switch (coord.y) {
    case "start":
      position.top -= popoverRect.height;
      break;
    case "center":
      position.top += anchorRect.height / 2 - popoverRect.height / 2;
      break;
    case "end":
      position.top += anchorRect.height;
      break;
  }
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const farBorderX = position.left + popoverRect.width;
  const farBorderY = position.top + popoverRect.height;
  if (position.left < 0) {
    position.left = 0;
  } else if (farBorderX > viewportWidth) {
    position.left -= farBorderX - viewportWidth;
  }
  if (position.top < 0) {
    position.top = 0;
  } else if (farBorderY > viewportHeight) {
    position.top -= farBorderY - viewportHeight;
  }
  if (!stickyParent) {
    const windowScrollX = window ? window.scrollX : 0;
    const windowScrollY = window ? window.scrollY : 0;
    position.left += windowScrollX;
    position.top += windowScrollY;
  }
  return position;
};

export const useAnchorElement = (
  anchorElement: RefObject<HTMLDivElement | null>,
  popoverElement: RefObject<HTMLDivElement | null>,
  coord: PositionCoord,
  stickyParent?: boolean
) => {
  const calculatePosition = () =>
    CalculateAnchorPoint(
      anchorElement.current,
      popoverElement.current,
      coord,
      stickyParent
    );
  const [position, setPosition] = useState<PositionTopLeft>();
  useEffect(() => {
    const update = () => setPosition(calculatePosition());
    setPosition(calculatePosition());
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [anchorElement, popoverElement, coord]);
  return position;
};

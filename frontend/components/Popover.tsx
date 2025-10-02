import { PositionCoord, useAnchorElement } from "@/hooks/useAnchorElement";
import { cx } from "@/utils/cx";
import { useRef, useState, type ReactNode } from "react";

export const Popover = (props: {
  className?: string;
  targetWrapperClass?: string;
  popoverWrapperClass?: string;
  hover?: boolean;
  stickyParent?: boolean;
  coord: PositionCoord;
  target: ReactNode;
  popover: ReactNode;
  controlled?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}) => {
  const [opened, setOpened] = props.controlled || useState<boolean>(false);
  const toggle = () => setOpened(prev => !prev);
  const open = () => setOpened(true);
  const close = () => setOpened(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const position = useAnchorElement(
    anchorRef,
    popoverRef,
    props.coord,
    props.stickyParent
  );

  return (
    <div
      className={cx(props.className, "inline-block")}
      onMouseEnter={props.hover ? open : undefined}
      onMouseLeave={props.hover ? close : undefined}
    >
      <div
        ref={anchorRef}
        className={cx(props.targetWrapperClass, "inline-block")}
        onClick={props.hover ? undefined : toggle}
      >
        {props.target}
      </div>
      {opened &&
        <div
          ref={popoverRef}
          className={cx(props.popoverWrapperClass, "absolute z-10 inline-block")}
          style={
            position !== undefined
              ? { left: `${position!.left}px`, top: `${position!.top}px` }
              : undefined
          }
        >
          {props.popover}
        </div>
      }
    </div>
  );
};

import { CSSProperties, FC, memo } from "react";
import { useDrop } from "react-dnd";

const style: CSSProperties = {
  height: "12rem",
  width: "12rem",
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  color: "white",
  padding: "1rem",
  textAlign: "center",
  fontSize: "1rem",
  lineHeight: "normal",
  float: "left",
};

interface SeedWordProps {
  onDrop: (seedWord: string) => void;
}

export const SeedWord: FC<SeedWordProps> = memo(function Dustbin({
  onDrop,
}: SeedWordProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    drop: onDrop,
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = "#222";
  if (isActive) {
    backgroundColor = "darkgreen";
  } else if (canDrop) {
    backgroundColor = "darkkhaki";
  }

  return (
    <div
      ref={drop}
      style={{ ...style, backgroundColor }}
      data-testid="seedword"
    >
      {isActive ? "Release to drop" : "Drag a word here"}
    </div>
  );
});

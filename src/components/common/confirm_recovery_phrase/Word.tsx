import type { CSSProperties, FC } from "react";
import { memo } from "react";
import { useDrag } from "react-dnd";

const style: CSSProperties = {
  border: "1px dashed gray",
  backgroundColor: "white",
  padding: "0.5rem 1rem",
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  cursor: "move",
  float: "left",
};

export interface WordProps {
  word: string;
  isDropped: boolean;
}

export const Word: FC<WordProps> = memo(function Word({
  word,
  isDropped,
}: WordProps) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: "word",
      item: { word },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [word]
  );

  return (
    <div ref={drag} style={{ ...style, opacity }} data-testid="box">
      {isDropped ? <s>{word}</s> : word}
    </div>
  );
});

import { FC } from "react";
import { memo } from "react";
import { useDrag } from "react-dnd";

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
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [word]
  );
  let bg = "bg-custom-green-bg";
  if (isDropped) {
    bg = "bg-custom-gray-bg";
  }

  return (
    <div
      ref={drag}
      className={`${bg} p-2 border border-custom-green-bg rounded-md text-center cursor-pointer`}
      style={{ opacity }}
      data-testid="box"
    >
      {word}
    </div>
  );
});

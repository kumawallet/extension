import { FC, memo } from "react";
import { useDrop } from "react-dnd";

interface SeedWordProps {
  onDrop: (seedWord: { word: string; accept: string }) => void;
  word: string;
  accept: string;
  index: number;
}

export const SeedWord: FC<SeedWordProps> = memo(function Dustbin({
  onDrop,
  word,
  accept,
  index,
}: SeedWordProps) {

  const [{ isOver, canDrop }, drop] = useDrop({
    drop: onDrop,
    accept,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = "bg-custom-gray-bg";
  const borderColor =
    accept === "word" ? `border-primary-default` : "border-custom-gray-bg";
  if (isActive) {
    backgroundColor = `bg-primary-default`;
  }

  return (
    <div
      ref={drop}
      className={`${backgroundColor} w-auto px-3 border ${borderColor} rounded-md py-2 text-center cursor-pointer font-poppins text-gray-200`}
      data-testid="seedword"
    >
      {word === "" ? <span>&nbsp;</span> : `${index}. ${word}`}
    </div>
  );
});

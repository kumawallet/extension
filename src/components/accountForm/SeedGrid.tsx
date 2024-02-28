import { FC } from "react";

interface SeedGridProps {
  isEditable?: boolean;
  words: (string | null)[]
  onChangeWords?: (words: string[]) => void
  showWords?: boolean
  gridTotal?: 12 | 24
  indexesRemoved?: number[]
  onClickWord?: (wordIndex: number) => void
}

export const SeedGrid: FC<SeedGridProps> = ({
  isEditable = false,
  words,
  onChangeWords,
  showWords = true,
  gridTotal = 12,
  indexesRemoved,
  onClickWord
}) => {



  return (
    <div className={`grid ${gridTotal === 12 ? "grid-cols-3" : "grid-cols-3 md:grid-cols-4"} gap-y-4 gap-x-2 md:gap-x-10`}>
      {
        Array.from({
          length: gridTotal
        }).map((word, index) => {
          const indexWasRemoved = indexesRemoved?.some(removedIndex => removedIndex === index)
          return (
            <div
              className={`flex border bg-[#1C1C27] ${indexWasRemoved ? "border-[#7C4DC4]" : "border-[#FFFFFF80]"} rounded-lg px-2 py-3 items-center font-poppins text-baseque `}
              key={index}
              onClick={() => {
                if (onClickWord && indexWasRemoved && words[index]) {
                  onClickWord(index)
                }
              }}
            >
              <span>{index + 1}.</span>
              <input
                onPaste={(e) => {
                  e.preventDefault()
                  const value = e.clipboardData.getData('text/plain').trim()
                  onChangeWords?.(value.split(" "))
                }}
                className="bg-transparent w-full px-1 outline-none"
                type={showWords ? "text" : "password"}
                value={words[index] || ""}
                readOnly={!isEditable}
                onChange={e => {
                  if (isEditable && onChangeWords) {
                    const newWords = [...words] as string[];
                    newWords[index] = e.target.value;
                    onChangeWords(newWords);
                  }
                }}
              />
            </div>
          )
        })
      }
    </div >
  )
}

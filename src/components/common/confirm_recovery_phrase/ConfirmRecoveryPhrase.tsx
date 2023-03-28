import { FC, memo, useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SeedWord } from "./SeedWord";
import { Word } from "./Word";

interface ConfirmRecoveryPhraseProps {
  seed: string;
}

export const ConfirmRecoveryPhrase: FC<ConfirmRecoveryPhraseProps> = memo(
  function ConfirmRecoveryPhrase({ seed }: ConfirmRecoveryPhraseProps) {
    const { t } = useTranslation("form.confirm_recovery_phrase");
    const { t: tCommon } = useTranslation("common");

    const [seedWords, setSeedWords] = useState<any[]>([]);
    const [words, setWords] = useState<(string | undefined)[]>([]);
    const [droppedWords, setDroppedWords] = useState<string[]>([]);

    useEffect(() => {
      const wordsFromSeed = seed.split(" ");
      if (wordsFromSeed.length < 24) throw new Error("Invalid seed");

      const arrayLength = wordsFromSeed.length;
      const wordsIndexesToRemove: number[] = [];

      while (wordsIndexesToRemove.length < 3) {
        const index = Math.floor(Math.random() * arrayLength);
        if (!wordsIndexesToRemove.includes(index)) {
          wordsIndexesToRemove.push(index);
        }
      }

      setWords(wordsIndexesToRemove.map((index) => wordsFromSeed[index]));

      setSeedWords(
        wordsFromSeed.map((word, index) => ({
          word,
          accept: wordsIndexesToRemove.includes(index) ? "" : "word",
        }))
      );
    }, [seed]);

    function isDropped(word: string) {
      return droppedWords.indexOf(word) > -1;
    }

    const handleDrop = useCallback(
      (index: number, word: string) => {
        setDroppedWords((prev) => [...prev, word]);
        const updatedSeedWords = [...seedWords];
        updatedSeedWords[index].word = word;
        setSeedWords(updatedSeedWords);
      },
      [droppedWords, seedWords]
    );

    console.log("seed word", seedWords);

    return (
      <div>
        <div className="grid grid-cols-3 gap-2">
          {seedWords.map(({ word, accept }, index) => (
            <SeedWord
              accept={accept}
              onDrop={(seedWord: string) => handleDrop(index, seedWord?.word)}
              key={index}
              word={word}
            />
          ))}
        </div>

        <div className="py-2 px-2 flex gap-2">
          {words.map((word, index) => (
            <Word
              isDropped={isDropped(word || "")}
              key={index}
              word={word || ""}
            />
          ))}
        </div>
      </div>
    );
  }
);

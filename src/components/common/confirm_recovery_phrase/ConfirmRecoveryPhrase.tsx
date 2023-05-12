import { FC, memo, useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SeedWord } from "./SeedWord";
import { Word } from "./Word";
import { useToast } from "@src/hooks";

interface ConfirmRecoveryPhraseProps {
  seed: string;
  confirm: (confirmed: boolean) => void;
}

export const ConfirmRecoveryPhrase: FC<ConfirmRecoveryPhraseProps> = memo(
  function ConfirmRecoveryPhrase({
    seed,
    confirm,
  }: ConfirmRecoveryPhraseProps) {
    const { showErrorToast } = useToast();
    const { t } = useTranslation("account_form");
    const { t: tCommon } = useTranslation("common");

    const [seedWords, setSeedWords] = useState<any[]>([]);
    const [words, setWords] = useState<(string | undefined)[]>([]);
    const [droppedWords, setDroppedWords] = useState<string[]>([]);

    useEffect(() => {
      try {
        const wordsFromSeed = seed.split(" ");
        if (wordsFromSeed.length < 24)
          throw new Error("invalid_recovery_phrase");

        const arrayLength = wordsFromSeed.length;
        const wordsIndexesToRemove: { word: string; index: number }[] = [];

        while (wordsIndexesToRemove.length < 5) {
          const index = Math.floor(Math.random() * arrayLength);
          const newWord = wordsFromSeed[index];
          const invalidWord = wordsIndexesToRemove.find(
            ({ word, index: i }) => index === i || word === newWord
          );
          if (!invalidWord) {
            wordsIndexesToRemove.push({ index, word: newWord });
          }
        }
        setWords(wordsIndexesToRemove.map(({ word }) => word));

        setSeedWords(
          wordsFromSeed.map((word, index) => ({
            word: wordsIndexesToRemove.find(({ index: i }) => index === i)
              ? ""
              : word,
            accept: !wordsIndexesToRemove.find(({ index: i }) => index === i)
              ? ""
              : "word",
          }))
        );
      } catch (error) {
        showErrorToast(tCommon(error as string));
        confirm(false);
      }
    }, [seed]);

    useEffect(() => {
      if (droppedWords.length === words.length) {
        const confirmedSeed: string = seedWords
          .map(({ word }) => word)
          .join(" ");
        const confirmed: boolean = confirmedSeed === seed;
        confirm(confirmed);
      }
    }, [droppedWords, seedWords, seed, confirm]);

    function isDropped(word: string) {
      return droppedWords.indexOf(word) > -1;
    }

    const handleDrop = useCallback(
      (index: number, word: string) => {
        const updatedSeedWords = [...seedWords];
        const repeated = updatedSeedWords.findIndex(
          ({ word: w, accept }) => w === word && accept === "word"
        );
        if (repeated > -1 && repeated !== index) {
          updatedSeedWords[repeated].word = "";
        }

        if (updatedSeedWords[index].word !== "") {
          const w = updatedSeedWords[index].word;
          setDroppedWords((prev) => prev.filter((word) => word !== w));
        }
        updatedSeedWords[index].word = word;
        setSeedWords(updatedSeedWords);
        setDroppedWords((prev) => [...prev, word]);
      },
      [droppedWords, seedWords]
    );

    return (
      <div className="mt-4">
        <div className="flex justify-center items-center mb-4">
          <p className="text-center">
            {t("form.confirm_recovery_phrase_description")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {seedWords.map(({ word, accept }, index) => (
            <SeedWord
              accept={accept}
              onDrop={(seedWord: { word: string; accept: string }) =>
                handleDrop(index, seedWord?.word)
              }
              key={index}
              word={word}
              index={index + 1}
            />
          ))}
        </div>

        <div className="flex justify-center flex-wrap items-center mt-5 p-2 gap-2">
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

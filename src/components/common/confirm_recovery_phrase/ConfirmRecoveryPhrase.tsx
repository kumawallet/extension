import { FC, memo, useCallback, useState } from "react";
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

    const _words = seed.split(" ");
    if (_words.length < 24) throw new Error("Invalid seed");
    const word1 = _words.pop();
    const word2 = _words.pop();
    const word3 = _words.pop();
    const [seedWords, setSeedWords] = useState<string[]>(_words);
    const [words, setWords] = useState<(string | undefined)[]>([
      word1,
      word2,
      word3,
    ]);
    const [droppedWords, setDroppedWords] = useState<string[]>([]);

    function isDropped(word: string) {
      return droppedWords.indexOf(word) > -1;
    }

    const handleDrop = useCallback(
      (index: number, word: string) => {
        setDroppedWords((prev) => [...prev, word]);
        const updatedSeedWords = [...seedWords];
        updatedSeedWords[index] = word;
        setSeedWords(updatedSeedWords);
      },
      [droppedWords, seedWords]
    );

    return (
      <div>
        <div style={{ overflow: "hidden", clear: "both" }}>
          {seedWords.map((seedWord, index) => (
            <SeedWord
              onDrop={(seedWord: string) => handleDrop(index, seedWord)}
              key={index}
            />
          ))}
        </div>

        <div style={{ overflow: "hidden", clear: "both" }}>
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

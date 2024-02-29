import { useEffect, useState } from "react";
import { SeedGrid } from "@src/components/accountForm";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";


export const ConfirmRecoveryPhrase = () => {
  const { t } = useTranslation("account_form")
  const { getValues, setValue, formState: { errors } } = useFormContext()

  const [words, setWords] = useState<(string | null)[]>([]);
  const [wordsRemoved, setWordsRemoved] = useState<string[]>([])
  const [indexesRemoved, setIndexesRemoved] = useState<number[]>()

  const onAddWord = (index: number) => {
    const _wordsRemoved = [...wordsRemoved]
    const wordClicked = _wordsRemoved[index]

    const _words = [...words]
    const firstPositionNull = _words.findIndex(word => word === null)

    _words[firstPositionNull] = wordClicked
    _wordsRemoved.splice(index, 1)

    setWords(_words)
    setWordsRemoved(_wordsRemoved)
    setValue('confirmSeed', _words.join(" "))
  }

  const onRemoveWord = (index: number) => {
    const _words = [...words]
    const wordClicked = _words[index]

    const _wordsRemoved = [...wordsRemoved]
    _words[index] = null
    _wordsRemoved.push(wordClicked as string)

    setWords(_words)
    setWordsRemoved(_wordsRemoved)
    setValue('confirmSeed', _words.join(" "))
  }

  useEffect(() => {
    const seed = getValues('seed')
    const wordsFromSeed = seed.split(" ");
    const arrayLength = wordsFromSeed.length;
    const wordsToRemove = []
    const indexesRemoved = []

    while (wordsToRemove.length < 3) {
      const index = Math.floor(Math.random() * arrayLength);
      const newWord = wordsFromSeed[index];
      if (newWord) {
        indexesRemoved.push(index)
        wordsToRemove.push(newWord)
        wordsFromSeed[index] = null
      }
    }
    setWords(wordsFromSeed)
    setWordsRemoved(wordsToRemove)
    setIndexesRemoved(indexesRemoved)
  }, [])

  return (
    <div className="mt-12">
      <SeedGrid
        words={words}
        onClickWord={onRemoveWord}
        indexesRemoved={indexesRemoved}
      />
      <div className="grid grid-cols-3 gap-x-10 mt-10">
        {
          wordsRemoved.map((word, index) => (
            <button key={index} className="bg-[#1C1C27] py-2 px-4 rounded-md font-poppins text-base" onClick={() => onAddWord(index)}>{word}</button>
          ))
        }
      </div>
      {
        errors.confirmSeed && <p className="text-red-500 text-sm mt-2">{t(errors.confirmSeed.message as string)}</p>
      }
    </div>
  )
}

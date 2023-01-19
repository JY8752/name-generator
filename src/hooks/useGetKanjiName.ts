import { useCallback, useState } from 'react';
import axios from 'axios';
import kanjiKunyomi from '../resource/kunyomi_reading.json';
// import 'dotenv/config';

// prettier-ignore
const charList: Readonly<string[]> = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  //'わ', 'を', 'ん',
  // 'が', 'ぎ', 'ぐ', 'げ', 'ご',
  // 'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  // 'だ', 'ぢ', 'づ', 'で', 'ど',
  // 'ば', 'び', 'ぶ', 'べ', 'ぼ',
  // 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
]

const KANJI_NAME_COUNT: Readonly<number> = 5;

export type KanjiKunyomiResponse = typeof kanjiKunyomi;

export const useGetKanjiName = () => {
  const [familyName, setFamilyName] = useState('');
  const [nameCount, setNameCount] = useState(2);
  const [fullName, setFullName] = useState('');
  const [kanjiNames, setKanjiNames] = useState<Set<string>>(new Set());

  // 訓読み指定で漢字一覧を取得する
  const getKanjiKunyomiName = useCallback(
    async (kun: string): Promise<KanjiKunyomiResponse> => {
      const options = {
        method: 'GET',
        url: 'https://kanjialive-api.p.rapidapi.com/api/public/search/advanced/',
        params: { kun },
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPID_API_KEY,
          'X-RapidAPI-Host': 'kanjialive-api.p.rapidapi.com',
        },
      };
      try {
        return await (
          await axios.request(options)
        ).data;
      } catch (e) {
        return Promise.reject(e);
      }
    },
    [],
  );

  // 命名実行
  const executeNaming = useCallback(() => {
    // 文字数分ランダムに文字を選別
    const chars: string[] = [];
    for (let i = 0; i < nameCount; i++) {
      chars.push(charList[Math.floor(Math.random() * charList.length)]);
    }

    // 名前を決定する
    const name = chars.reduce((accum, current) => {
      return accum + current;
    }, '');

    // kanjiAPIで文字ごとの漢字一覧を取得
    const promises: Promise<KanjiKunyomiResponse>[] = chars.map(
      (char: string) => {
        return getKanjiKunyomiName(char);
      },
    );

    Promise.all(promises)
      .then((responses: KanjiKunyomiResponse[]) => {
        // 全ての文字で漢字が見つかったかどうか
        let notFoundKanji = false;
        for (const res of responses) {
          if (res.length === 0) {
            notFoundKanji = true;
          }
        }
        if (notFoundKanji) {
          return;
        }

        const totalCombination = responses.reduce((accum, current) => {
          return accum * current.length;
        }, 1);

        const limit =
          totalCombination <= KANJI_NAME_COUNT
            ? totalCombination
            : KANJI_NAME_COUNT;

        // 規定の数に達するまで組み合わせを探す
        const kanjiNames = new Set<string>();
        while (kanjiNames.size !== limit) {
          let kanjiName = '';
          responses.forEach((res) => {
            kanjiName +=
              res[Math.floor(Math.random() * res.length)].kanji.character;
          });
          if (!kanjiNames.has(kanjiName)) {
            kanjiNames.add(kanjiName);
          }
        }
        setKanjiNames(kanjiNames);
        setFullName(`${familyName} ${name}`);
      })
      .catch((err) => console.error(err));
  }, [familyName]);

  return {
    familyName,
    setFamilyName,
    nameCount,
    setNameCount,
    fullName,
    setFullName,
    kanjiNames,
    setKanjiNames,
    getKanjiKunyomiName,
    executeNaming,
  };
};

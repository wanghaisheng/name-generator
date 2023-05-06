import * as path from "path";
import * as Type from "./type";

const basePath = path.resolve(__dirname, "..", "..");

export const Raw_已知人名_Path = path.resolve(basePath, "database/raw");
export const CharDb_人名列表_Uri = path.resolve(
  basePath,
  "database/json/raw_person_name_char_list.json"
);
export const CharDb_人名字典_Uri = path.resolve(
  basePath,
  "database/json/raw_person_name_char_db.json"
);

export const Raw_Char_Db_汉典原始数据_Uri = path.resolve(
  basePath,
  "database/char_db/raw_zdic.txt"
);

export const Raw_Char_Db_汉典_拼音列表_Uri = path.resolve(
  basePath,
  "database/char_db/raw_pinyin_list.json"
);

export const Char_Db_total_移除多音字_以字为单位_Uri = path.resolve(
  basePath,
  "database/char_db/zd_without_muilt_tone_char_db.json"
);

export const Char_Db_name_char_移除多音字_姓名用字_最少出现1次_Uri =
  path.resolve(basePath, "database/char_db/zd_name_char_db_min_1.json");
export const Char_Db_name_char_移除多音字_姓名用字_最少出现2次_Uri =
  path.resolve(basePath, "database/char_db/zd_name_char_db_min_2.json");
export const Char_Db_name_char_移除多音字_姓名用字_最少出现3次_Uri =
  path.resolve(basePath, "database/char_db/zd_name_char_db_min_3.json");
export const Char_Db_name_char_移除多音字_姓名用字_最少出现4次_Uri =
  path.resolve(basePath, "database/char_db/zd_name_char_db_min_4.json");
export const Char_Db_name_char_移除多音字_姓名用字_最少出现5次_Uri =
  path.resolve(basePath, "database/char_db/zd_name_char_db_min_5.json");
export const Char_Db_name_char_移除多音字_姓名用字_最少出现10次_Uri =
  path.resolve(basePath, "database/char_db/zd_name_char_db_min_10.json");

export const Pinyin_Db_name_char_移除多音字_姓名用字_最少出现1次_Uri =
  path.resolve(basePath, "database/pinyin_db/zd_name_pinyin_db_min_1.json");
export const Pinyin_Db_name_char_移除多音字_姓名用字_最少出现2次_Uri =
  path.resolve(basePath, "database/pinyin_db/zd_name_pinyin_db_min_2.json");
export const Pinyin_Db_name_char_移除多音字_姓名用字_最少出现3次_Uri =
  path.resolve(basePath, "database/pinyin_db/zd_name_pinyin_db_min_3.json");
export const Pinyin_Db_name_char_移除多音字_姓名用字_最少出现4次_Uri =
  path.resolve(basePath, "database/pinyin_db/zd_name_pinyin_db_min_4.json");
export const Pinyin_Db_name_char_移除多音字_姓名用字_最少出现5次_Uri =
  path.resolve(basePath, "database/pinyin_db/zd_name_pinyin_db_min_5.json");
export const Pinyin_Db_name_char_移除多音字_姓名用字_最少出现10次_Uri =
  path.resolve(basePath, "database/pinyin_db/zd_name_pinyin_db_min_10.json");

export const 音调_Map: Record<string, Type.Type_音调> = {
  ü: 1,
  ǜ: 4,
  ǚ: 3,
  ǘ: 2,
  ǖ: 1,
  u: 1,
  ù: 4,
  ǔ: 3,
  ú: 2,
  ū: 1,
  o: 1,
  ò: 4,
  ǒ: 3,
  ó: 2,
  ō: 1,
  i: 1,
  ì: 4,
  ǐ: 3,
  í: 2,
  ī: 1,
  e: 1,
  è: 4,
  ě: 3,
  é: 2,
  ē: 1,
  a: 1,
  à: 4,
  ǎ: 3,
  á: 2,
  ā: 1,
};

export const 音标_To_原字母 = {
  ü: "ü",
  ǜ: "ü",
  ǚ: "ü",
  ǘ: "ü",
  ǖ: "ü",
  u: "u",
  ù: "u",
  ǔ: "u",
  ú: "u",
  ū: "u",
  o: "o",
  ò: "o",
  ǒ: "o",
  ó: "o",
  ō: "o",
  i: "i",
  ì: "i",
  ǐ: "i",
  í: "i",
  ī: "i",
  e: "e",
  è: "e",
  ě: "e",
  é: "e",
  ē: "e",
  a: "a",
  à: "a",
  ǎ: "a",
  á: "a",
  ā: "a",
};
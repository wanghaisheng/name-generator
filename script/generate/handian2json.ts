import * as path from "path";
import * as fs from "fs";
import * as Const from "../common/const";
import * as Type from "../common/type";
import { isMap } from "util/types";

const Tool = {
  /**
   * 获取音标对应的音调(只会有一个韵母带音调, 且带音调的字母对应音调一定高于1. 所以可以转换为求最大值问题)
   * 轻声视为1声
   * @param input
   */
  parse音标音调(input: string): Type.Type_音调 {
    let max音调: Type.Type_音调 = 1;
    for (let char of input) {
      // 没有取到韵母/韵母为轻声, 相当于音调为1
      let 当前音调 = Const.音调_Map[char] || 1;
      if (当前音调 >= max音调) {
        max音调 = 当前音调;
      }
    }
    return max音调;
  },
  /**
   * 移除音标中的音调
   * @param voice
   */
  remove音调(voice: string) {
    let newVoice: string[] = [];
    for (let char of voice) {
      // @ts-ignore
      let newChar = (Const.音标_To_原字母[char] as string) || char;
      newVoice.push(newChar);
    }
    return newVoice.join("");
  },
  /**
   * 获取姓名用字数据库
   */
  getNameCharDb() {
    const content = fs.readFileSync(Const.CharDb_人名字典_Uri).toString();
    const CharDB_All: Type.CharDB = JSON.parse(content);
    const CharDB_Min_1: Type.CharDB = CharDB_All;
    const CharDB_Min_2: Type.CharDB = {};
    const CharDB_Min_3: Type.CharDB = {};
    const CharDB_Min_4: Type.CharDB = {};
    const CharDB_Min_5: Type.CharDB = {};
    const CharDB_Min_10: Type.CharDB = {};

    for (let key of Object.keys(CharDB_All)) {
      let item = CharDB_All[key];
      if (item.count >= 10) {
        CharDB_Min_10[key] = item;
        continue;
      }
      if (item.count >= 5) {
        CharDB_Min_5[key] = item;
        continue;
      }
      if (item.count >= 4) {
        CharDB_Min_4[key] = item;
        continue;
      }
      if (item.count >= 3) {
        CharDB_Min_3[key] = item;
        continue;
      }
      if (item.count >= 2) {
        CharDB_Min_2[key] = item;
        continue;
      }
      if (item.count >= 1) {
        CharDB_Min_1[key] = item;
        continue;
      }
    }
    return {
      CharDB_Min_1,
      CharDB_Min_2,
      CharDB_Min_3,
      CharDB_Min_4,
      CharDB_Min_5,
      CharDB_Min_10,
    };
  },
};

/**
 * 将汉典数据转换为json
 */
async function asyncRunner() {
  const content = fs
    .readFileSync(Const.Raw_Char_Db_汉典原始数据_Uri)
    .toString();
  const lineList = content.split("\n");
  const PinyinList_全部: Type.Char_Pinyin[] = [];
  const PinyinDb_不含多音字: Record<string, Type.Char_Pinyin> = {};
  const PinyinDb_不含多音字_姓名用字_Min_1: Record<string, Type.Char_Pinyin> =
    {};
  const PinyinDb_不含多音字_姓名用字_Min_2: Record<string, Type.Char_Pinyin> =
    {};
  const PinyinDb_不含多音字_姓名用字_Min_3: Record<string, Type.Char_Pinyin> =
    {};
  const PinyinDb_不含多音字_姓名用字_Min_4: Record<string, Type.Char_Pinyin> =
    {};
  const PinyinDb_不含多音字_姓名用字_Min_5: Record<string, Type.Char_Pinyin> =
    {};
  const PinyinDb_不含多音字_姓名用字_Min_10: Record<string, Type.Char_Pinyin> =
    {};

  const {
    CharDB_Min_1,
    CharDB_Min_2,
    CharDB_Min_3,
    CharDB_Min_4,
    CharDB_Min_5,
    CharDB_Min_10,
  } = Tool.getNameCharDb();

  const db2PinyinListMap = new Map<
    Type.CharDB,
    Record<string, Type.Char_Pinyin>
  >();
  db2PinyinListMap.set(CharDB_Min_10, PinyinDb_不含多音字_姓名用字_Min_10);
  db2PinyinListMap.set(CharDB_Min_5, PinyinDb_不含多音字_姓名用字_Min_5);
  db2PinyinListMap.set(CharDB_Min_4, PinyinDb_不含多音字_姓名用字_Min_4);
  db2PinyinListMap.set(CharDB_Min_3, PinyinDb_不含多音字_姓名用字_Min_3);
  db2PinyinListMap.set(CharDB_Min_2, PinyinDb_不含多音字_姓名用字_Min_2);
  db2PinyinListMap.set(CharDB_Min_1, PinyinDb_不含多音字_姓名用字_Min_1);

  for (let line of lineList) {
    if (line.startsWith("U+") === false) {
      continue;
    }
    // 将文字进行拆分
    // U+20000: hē  # 𠀀
    let [_, buf1] = line.split("U+");
    let [unicode, buf2] = buf1.split(":");
    let [rawPinyin, buf3] = buf2.trim().split("#");
    rawPinyin = rawPinyin.trim();
    let pinyinList = rawPinyin.split(",");
    let char = String.fromCharCode(parseInt(unicode, 16));

    if (pinyinList.length === 1) {
      const charPinyin = {
        char: char,
        pinyin: pinyinList[0],
        pinyin_without_tone: Tool.remove音调(pinyinList[0]),
        tone: Tool.parse音标音调(pinyinList[0]),
        count: CharDB_Min_1[char]?.count ?? 0,
      };
      PinyinDb_不含多音字[char] = charPinyin;

      // 若相应等级字典中包含该汉字, 则录入拼音列表中
      for (let key of db2PinyinListMap.keys()) {
        if (key?.[char] !== undefined) {
          const item = db2PinyinListMap.get(key) as Record<
            string,
            Type.Char_Pinyin
          >;
          item[char] = charPinyin;
        }
      }
    }
    for (const pinyin of pinyinList) {
      const pinyin_without_tone = Tool.remove音调(pinyin);
      const tone = Tool.parse音标音调(pinyin);
      PinyinList_全部.push({
        char,
        pinyin,
        pinyin_without_tone,
        tone,
        count: CharDB_Min_1[char]?.count ?? 0,
      });
    }
  }
  // 写入文件
  fs.writeFileSync(
    Const.Raw_Char_Db_汉典_拼音列表_Uri,
    JSON.stringify(PinyinList_全部, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_total_移除多音字_以字为单位_Uri,
    JSON.stringify(PinyinDb_不含多音字, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_name_char_移除多音字_姓名用字_最少出现1次_Uri,
    JSON.stringify(PinyinDb_不含多音字_姓名用字_Min_1, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_name_char_移除多音字_姓名用字_最少出现2次_Uri,
    JSON.stringify(PinyinDb_不含多音字_姓名用字_Min_2, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_name_char_移除多音字_姓名用字_最少出现3次_Uri,
    JSON.stringify(PinyinDb_不含多音字_姓名用字_Min_3, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_name_char_移除多音字_姓名用字_最少出现4次_Uri,
    JSON.stringify(PinyinDb_不含多音字_姓名用字_Min_4, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_name_char_移除多音字_姓名用字_最少出现5次_Uri,
    JSON.stringify(PinyinDb_不含多音字_姓名用字_Min_5, null, 4)
  );
  fs.writeFileSync(
    Const.Char_Db_name_char_移除多音字_姓名用字_最少出现10次_Uri,
    JSON.stringify(PinyinDb_不含多音字_姓名用字_Min_10, null, 4)
  );

  console.log("字典文件处理完毕");
}

asyncRunner();

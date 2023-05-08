import * as CommonType from "@/../script/common/type";
import * as Const from "@/resource/const";
import * as Type from "@/resource/type";
import AllPinyinList from "@/../database/char_db/raw_pinyin_list.json";
import RawCharDb from "@/../database/char_db/zd_name_char_db_min_1.json";
import NameDb_古人云 from "@/../database/name_db/古人云_历史人名.json";
import NameDb_他山石 from "@/../database/name_db/他山石_已知人名.json";
import NameDb_财富论 from "@/../database/name_db/财富论_基金选名.json";

export async function asyncSleep(ms: number) {
  return new Promise((reslove) => {
    setTimeout(() => {
      reslove(true);
    }, ms);
  });
}

export function getValueByStorage(key: string, defaultValue: any) {
  let content = (localStorage.getItem(key) as string) ?? "";
  try {
    return JSON.parse(content);
  } catch (e) {
    return defaultValue;
  }
}
export function setValueByStorage(key: string, value = "") {
  localStorage.setItem(key, JSON.stringify(value));
  return;
}

/**
 * 根据pinyin数据库, 生成乱序的候选拼音列表
 * @param pinyinDb
 * @returns
 */
export function generatePinyinOptionList(
  pinyinDb: CommonType.Pinyin_Db
): CommonType.Pinyin_of_Char[] {
  let pinyinOptionList: CommonType.Pinyin_of_Char[] = [];

  for (let rawOption of Object.values(pinyinDb)) {
    for (let item of rawOption.option_list) {
      pinyinOptionList.push(item);
    }
  }
  // 打乱顺序
  pinyinOptionList.sort(() => {
    return Math.random() - 0.5;
  });

  return pinyinOptionList;
}

/**
 * 获取该字对应的拼音, 假设至少有一个拼音
 * @param char
 * @returns
 */
export function getPinyinOfChar(char: string) {
  let pinyinList: CommonType.Char_With_Pinyin[] = [];

  for (const item of AllPinyinList as CommonType.Char_With_Pinyin[]) {
    if (item.char === char) {
      pinyinList.push(item);
    }
  }
  return pinyinList as [
    CommonType.Char_With_Pinyin,
    ...CommonType.Char_With_Pinyin[]
  ];
}

/**
 * 获取姓名评分
 * @param name
 * @returns
 */
export function getScoreOfName(char1: string, char2: string) {
  // @ts-ignore
  let score = (RawCharDb[char1]?.count ?? 0) + (RawCharDb[char2]?.count ?? 0);
  return score;
}

/**
 * 将字符串转换为拼音列表
 * @param str
 * @returns
 */
export function transString2PinyinList(str: string) {
  const charList = str.split("");
  const pinyinList: CommonType.Char_With_Pinyin[] = [];
  for (const char of charList) {
    const resultList = getPinyinOfChar(char);
    for (const result of resultList) {
      pinyinList.push(result);
    }
  }
  return pinyinList;
}

/**
 * 生成所有合法的姓名
 * @param char_姓氏
 * @returns
 */
export function generateLegalNameList({
  char_姓_全部,
  char_姓_末尾字,
  char_排除字_list = [],
  char_必选字_list = [],
  pinyinOptionList,
  generateAll = false,
}: {
  /**
   * 姓的全称, 用于合成最终结果
   */
  char_姓_全部: CommonType.Char_With_Pinyin[];
  /**
   * 姓中的最后一个字, 需要明确发音
   */
  char_姓_末尾字: CommonType.Char_With_Pinyin;
  /**
   * 不能重音的字
   */
  char_排除字_list?: CommonType.Char_With_Pinyin[];
  /**
   * 姓名中必须出现的字, 一个名字中只能限定一个必选字出现在第二位或第三位, 但可以传入多个, 满足一个条件即可
   * 若必选字同音, 则只保留第一个必选字
   */
  char_必选字_list?: CommonType.Char_With_Pinyin[];
  /**
   * 所有可选拼音库, 所有拼音均从可选拼音中产生
   */
  pinyinOptionList: CommonType.Pinyin_of_Char[];
  /**
   * 是否生成全部数据, 默认只生成有限个数, 以节约计算时间
   */
  generateAll?: boolean;
}) {
  let nameList: CommonType.Type_Name[] = [];
  // 主动复制一遍变量, 避免内部修改影响到外部值
  pinyinOptionList = structuredClone(pinyinOptionList);

  const pinyinSet_同音字 = new Set();
  for (let char_排除字 of char_排除字_list) {
    pinyinSet_同音字.add(char_排除字.pinyin);
  }
  // 必选字不能同音
  let buf_过滤同音必选字: Record<string, CommonType.Char_With_Pinyin> = {};
  for (let char_必选字 of char_必选字_list) {
    if (buf_过滤同音必选字[char_必选字["pinyin"]] === undefined) {
      buf_过滤同音必选字[char_必选字["pinyin"]] = char_必选字;
    }
  }
  char_必选字_list = [...Object.values(buf_过滤同音必选字)];
  // 按必选字进行过滤
  const set_必选字 = new Set();
  for (let char_必选字 of char_必选字_list) {
    set_必选字.add(char_必选字.char);
  }

  // 生成所有可能的结果
  for (let pinyinItemChar_1 of pinyinOptionList) {
    if (generateAll === false) {
      // 尽量减少计算量, 未显式要求生成全部结果就只生成一小部分
      if (nameList.length >= Const.Max_Display_Item) {
        return nameList;
      }
    }

    // 首先生成第一个字
    if (
      char_姓_末尾字.pinyin_without_tone ===
      pinyinItemChar_1.pinyin_without_tone
    ) {
      // 禁止和姓氏最后一字同音
      continue;
    }
    if (pinyinSet_同音字.has(pinyinItemChar_1.pinyin)) {
      // 排除同音字
      continue;
    }
    // 排除一些两字连缀效果不佳的组合`阴阴X` / `上上X`
    if (char_姓_末尾字.tone === 1 && pinyinItemChar_1.tone === 1) {
      continue;
    }
    if (char_姓_末尾字.tone === 3 && pinyinItemChar_1.tone === 3) {
      continue;
    }
    for (let pinyinItemChar_2 of pinyinOptionList) {
      // 生成第二个字

      if (generateAll === false) {
        // 尽量减少计算量, 未显式要求生成全部结果就只生成一小部分
        if (nameList.length >= Const.Max_Display_Item) {
          return nameList;
        }
      }

      if (
        char_姓_末尾字.pinyin_without_tone ===
        pinyinItemChar_2.pinyin_without_tone
      ) {
        // 禁止和姓氏最后一字同音
        continue;
      }
      if (pinyinSet_同音字.has(pinyinItemChar_2.pinyin)) {
        // 排除同音字
        continue;
      }
      // 禁止使用上声(三声)作为姓名结尾
      if (pinyinItemChar_2.tone === 3) {
        continue;
      }
      // 排除一些两字连缀效果不佳的组合 `X去去`
      if (pinyinItemChar_1.tone === 4 && pinyinItemChar_2.tone === 4) {
        continue;
      }
      // 禁止同音调: 阴阴阴(之前已去)、阳阳阳、上上上(之前已去)、去去去(之前已去)
      if (
        char_姓_末尾字.tone === 2 &&
        pinyinItemChar_1.tone === 2 &&
        pinyinItemChar_2.tone === 2
      ) {
        continue;
      }

      // 必选字检查
      let flag_check_必选字 = true;
      if (char_必选字_list.length > 0) {
        // 先将必选字检查置为false
        flag_check_必选字 = false;

        // 检查是否包含必选字
        for (let optionChar of pinyinItemChar_1.char_list) {
          if (flag_check_必选字) {
            // 有一个包含必选字就可以
            continue;
          }
          if (set_必选字.has(optionChar.char)) {
            // 匹配成功, 将当前拼音选项中的字替换为必选字
            // 由于已经进行了深拷贝, 所以这里的修改不会影响外界
            pinyinItemChar_1.char = optionChar.char;
            flag_check_必选字 = true;
          }
        }
        for (let optionChar of pinyinItemChar_2.char_list) {
          if (flag_check_必选字) {
            // 有一个包含必选字就可以
            continue;
          }
          if (set_必选字.has(optionChar.char)) {
            // 匹配成功, 将当前拼音选项中的字替换为必选字
            // 由于已经进行了深拷贝, 所以这里的修改不会影响外界
            pinyinItemChar_2.char = optionChar.char;
            flag_check_必选字 = true;
          }
        }
      }
      if (flag_check_必选字 === false) {
        // 必选字检查未通过
        continue;
      }
      const name: CommonType.Type_Name = {
        姓氏: char_姓_全部,
        人名_第一个字: {
          ...pinyinItemChar_1,
        },
        人名_第二个字: {
          ...pinyinItemChar_2,
        },
        demoStr: `${char_姓_全部.map((item) => item.char).join("")}${
          pinyinItemChar_1.char
        }${pinyinItemChar_2.char}`,
        score: getScoreOfName(pinyinItemChar_1.char, pinyinItemChar_2.char),
      };
      nameList.push(name);
    }
  }

  return nameList;
}

/**
 * 生成所有合法的姓名
 * @param char_姓氏
 * @returns
 */
export function generateLegalNameListFromExist({
  char_姓_全部,
  char_姓_末尾字,
  char_排除字_list = [],
  char_必选字_list = [],
  chooseType = Const.Choose_Type_Option.他山石,
  generateAll = false,
}: {
  /**
   * 姓的全称, 用于合成最终结果
   */
  char_姓_全部: CommonType.Char_With_Pinyin[];
  /**
   * 姓中的最后一个字, 需要明确发音
   */
  char_姓_末尾字: CommonType.Char_With_Pinyin;
  /**
   * 不能重音的字
   */
  char_排除字_list?: CommonType.Char_With_Pinyin[];
  /**
   * 姓名中必须出现的字, 一个名字中只能限定一个必选字出现在第二位或第三位, 但可以传入多个, 满足一个条件即可
   * 若必选字同音, 则只保留第一个必选字
   */
  char_必选字_list?: CommonType.Char_With_Pinyin[];
  /**
   * 已有姓名来源
   */
  chooseType: Type.ChooseType;
  /**
   * 是否生成全部数据, 默认只生成有限个数, 以节约计算时间
   */
  generateAll?: boolean;
}) {
  let nameList: CommonType.Type_Name[] = [];

  console.log("开始计算");

  const pinyinSet_同音字 = new Set();
  for (let char_排除字 of char_排除字_list) {
    pinyinSet_同音字.add(char_排除字.pinyin);
  }
  // 必选字不能同音
  let buf_过滤同音必选字: Record<string, CommonType.Char_With_Pinyin> = {};
  for (let char_必选字 of char_必选字_list) {
    if (buf_过滤同音必选字[char_必选字["pinyin"]] === undefined) {
      buf_过滤同音必选字[char_必选字["pinyin"]] = char_必选字;
    }
  }
  char_必选字_list = [...Object.values(buf_过滤同音必选字)];

  let legalNameList: string[];
  switch (chooseType) {
    case Const.Choose_Type_Option.古人云:
      legalNameList = NameDb_古人云;
      break;
    case Const.Choose_Type_Option.他山石:
      legalNameList = NameDb_他山石;
      break;
    case Const.Choose_Type_Option.财富论:
      legalNameList = NameDb_财富论;
      break;
    default:
      legalNameList = NameDb_古人云;
  }

  // 首先按必选字进行过滤, 减少成本
  const set_必选字 = new Set();
  for (let char_必选字 of char_必选字_list) {
    set_必选字.add(char_必选字.char);
  }
  if (char_必选字_list.length > 0) {
    legalNameList = legalNameList.filter((item) => {
      let [char_1, char_2] = item.split("");
      if (
        set_必选字.has(char_1) === false &&
        set_必选字.has(char_2) === false
      ) {
        return false;
      }
      return true;
    });
  }
  // 其次, 按同音字进行过滤, 减少成本
  let legalPinyinNameList = legalNameList.map((item) => {
    let [char_1, char_2] = item.split("");
    let pinyin_char_1 = getPinyinOfChar(char_1)[0];
    let pinyin_char_2 = getPinyinOfChar(char_2)[0];
    return {
      pinyin_char_1,
      pinyin_char_2,
    };
  });

  // 排除不合法的发音
  legalPinyinNameList = legalPinyinNameList.filter((item) => {
    // 禁止和姓氏最后一字同音
    if (
      item.pinyin_char_1.pinyin_without_tone ===
      char_姓_末尾字.pinyin_without_tone
    ) {
      return false;
    }
    if (
      item.pinyin_char_2.pinyin_without_tone ===
      char_姓_末尾字.pinyin_without_tone
    ) {
      return false;
    }
    // 排除同音字
    if (pinyinSet_同音字.has(item.pinyin_char_1.pinyin)) {
      return false;
    }
    if (pinyinSet_同音字.has(item.pinyin_char_2.pinyin)) {
      return false;
    }
    // 排除一些两字连缀效果不佳的组合`阴阴X` / `上上X`
    if (char_姓_末尾字.tone === 1 && item.pinyin_char_1.tone === 1) {
      return false;
    }
    if (char_姓_末尾字.tone === 3 && item.pinyin_char_1.tone === 3) {
      return false;
    }
    // 排除一些两字连缀效果不佳的组合 `X去去`
    if (item.pinyin_char_1.tone === 4 && item.pinyin_char_2.tone === 4) {
      return false;
    }
    // 禁止同音调: 阴阴阴(之前已去)、阳阳阳、上上上(之前已去)、去去去(之前已去)
    if (
      char_姓_末尾字.tone === 2 &&
      item.pinyin_char_1.tone === 2 &&
      item.pinyin_char_2.tone === 2
    ) {
      return false;
    }
    return true;
  });

  // 生成所有可能的结果
  for (let legalPinyinName of legalPinyinNameList) {
    let pinyin_1 = legalPinyinName.pinyin_char_1;
    let pinyin_2 = legalPinyinName.pinyin_char_2;

    const name: CommonType.Type_Name = {
      姓氏: char_姓_全部,
      人名_第一个字: {
        ...pinyin_1,
        char_list: [pinyin_1],
      },
      人名_第二个字: {
        ...pinyin_2,
        char_list: [pinyin_2],
      },
      demoStr: `${char_姓_全部.map((item) => item.char).join("")}${
        pinyin_1.char
      }${pinyin_2.char}`,
      score: getScoreOfName(pinyin_1.char, pinyin_2.char),
    };
    nameList.push(name);

    if (generateAll === false) {
      // 尽量减少计算量, 未显式要求生成全部结果就只生成一小部分
      if (nameList.length >= Const.Max_Display_Item) {
        return nameList;
      }
    }
  }

  return nameList;
}

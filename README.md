# 诗云-起个好名字

> 在线预览: https://www.yaozeyuan.online/name-generator/

给孩子起名一直是件很费心的事, 一个恰当得体的名字就像一首好诗一样难写. 我在为孩子准备名字时也碰到了这个问题, 然后就想到了刘慈欣的一篇科幻小说:<诗云>. 在小说中, 超等文明的成员"李白"想超越真实的李白写出最好的绝句, 但他发现自己能力有限, 写的绝句和李白的原作相比总是差那么一些. 为解决这个问, 他决定使用科技----已知汉语只有 3500 个常用汉字, 七言绝句一共 28 个字, 那只要排列组合生成`3500^28`首诗歌, 覆盖所有可能性, 显然就可以保证自己一定`写`出了最美的诗篇.

# 思路一: 诗云

起名也是这个道理.

对于三字名而言, 名只会由两个中文字符组成, 如果候选字库是 3500 常用字的话最多只有`3500 * 3500 = 12250000`种可能性. 而如果只考虑发音的话, 中文所有字符连上音调一共只有`970`种发音, 合并音调后只有`374`种可能. 也就是说, 不考虑音调, 所有三字名的可能组合最多只有`374 * 374 = 139876`种情况----在这个数量级下, 筛选就是可能的了.

诗云的思路是: 指定姓氏后, 生成所有可能的三字名发音(或汉字)组合. 通过程序自动排除所有不符合规则的组合, 可选的姓名必然在剩下的列表中. 而诗云中支持的过滤规则如下

## 音韵学规则

- 禁止与指定汉字同音
  - 避免与长辈/亲属同名
- 禁止叠双声声
  - 连续两字声母所属分类相同, 例如`d/t/n/l` 同属舌尖中音, 一次性念出`电梯内到他那里动态能力的童年`会非常困难
- 禁止叠韵
  - 连续两字韵母所属分类相同, 例如`喇嘛拿喇叭拉哑巴换挞嘛`---- 该规则一般用于编写绕口令
- 音调平仄
  - 三字名的音调平仄一共有 64 种不同情况, 从音韵美感评级上可分为 1~5 分, 诗云中仅提供评分为 3 分以上的组合
  - 支持按男宝女宝选名
    - 男宝结尾名一般选二声(阳平)或四声(去声), 比较响亮, 干脆利落
    - 女宝结尾名一般选一声(阴平), 比较温和
    - 三声(上声)结尾, 男宝女宝均可用
- 避免多音字
  - 姓名中需要绕开多音字, 以避免被喊错名字
  - 诗云中对 100 万+姓名进行解析, 除了姓名中明确作为单音字使用的"多音字"外(如`华/中/大/正/和`), 其他多音字均已从候选字库排除. 具体规则见[多音字取音标准](./doc/多音字取音标准.md)
  - 若姓氏本身是多音字(如任), 需要指定发音后方可继续使用

## 候选字规则

汉字中并不是所有字都可以用于起名. 事实上, 对 16 万现代人名的统计分析显示, 这 16 万人中使用次数大于 3 次的字只有 1922 个. 因此, 诗云基于以下原则生成候选字库

- 标准字库: 由[@wensonsmith](https://www.v2ex.com/t/641804)从新华字典中手工挑选而成, 共 820 个字(排除多音字后剩余 787 个)
- 人名字库: 由 16 万现代人名, 以及 21w 私募基金名 + 2w 维护该私募基金的公司名中的用字而成. 按照出现频率分为`1/5/10/50/100次`五种类别, 出现频率越高, 证明得到的认可越多
- 指定用字: 诗云支持指定姓名中必须出现的汉字, 并且支持指定汉字要出现的位置(适用于有辈分的情况). 需要特殊说明的是, 如果要求汉字必须出现在第二位, 那么诗云会跳过对三字名中前两个字的发音检查(因为已经进行了指定, 检查没有意义), 需要用户自行把控效果

生成的候选方案会很多, 因此诗云支持将候选列表下载到电脑上进行排查

# 思路二: 根据已有姓名方案进行生成

虽然诗云可以根据音韵规则提供所有可能选项, 但仍然不能成为一套解决方案, 有以下几个原因:

1.  虽然通过音韵学规则缩小了候选集, 但对于`张`姓而言, 只是将候选集从 1125 万缩小到了 25 万种发音组合或 437 万种汉字组合, 绝对数量仍然巨大, 无法用于挑选
2.  由于人名是随机生成, 所以必然有类似`张徐钞`/`张你贶`这种无意义组合, 甚至会有贬义的人名组合. 噪声问题严重的话, 仍然不能解决挑选好名字的需求

事实上, 我们对名字不仅是要求好听, 还希望名字能有良好的含义. 但程序怎么识别词语含义并予以过滤呢? 莫非真要引入 ChatGPT 接口?

答案是不识别含义, 只做好名字的搬运工.

根据`张`姓的所有可能的组合数据(437 万)可以猜测, 好名字的组合总数是有限的, 甚至是可以穷举的, 而且我们甚至知道穷举出来的值一定小于 437 万. 如果假设 00 后的父母都会认真给孩子起名的话, 那理论上只要收集 437 万不同的张姓 00 后的名字, 就可以覆盖绝大部分好名字, 从而得到一个姓名库.

所以我们的问题转变为, 到哪里去拿到好名字, 我们该怎么判断这些名字是好名字?

答案也很简单: 只收集, 不判断. 只是我们会刻意选择收集范围, 只要保证收集范围内的人都会认真取名而且能取出有典故有含义的名字, 我们只要基于这套名库再换上目标姓, 自然就可以取得一个好名字.

最终收集到的名库以及对应范围如下

| 名库代号 | 对应范围                                                                                                                                                       |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 登科录   | 基于[中國歷代人物傳記資料庫 CBDB](https://projects.iq.harvard.edu/chinesecbdb/home)查询得到的中国历史上 85210 位登科进士, 以他们的的姓名字号作为候选名库       |
| 古人云   | 基于[古人名字解诂](https://book.douban.com/subject/35479474/)整理的古人姓名与字, 可以保证每一个候选名均有典故/出处                                             |
| 五道口   | 基于 国家自然科学研究基金资助项目 /国家社会科学研究基金资助项目/ 两院院士 / cnki 科研项目 整理的候选名库                                                       |
| 财富论   | 基于 [中国证券投资基金业协会](https://gs.amac.org.cn/amac-infodisc/res/pof/fund/index.html)公示的 215557 项私募基金名, 以及其所属的 21748 所公司生成的候选名库 |
| 他山石   | 基于政府公示信息(例如北京积分落户公示)整理的 16 万现代人名整理的候选名库                                                                                       |

基于这些数据源生成的候选名库, 显然有质量保证.

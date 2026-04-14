import type { Letter } from "@/lib/types";

type Bucket = "low" | "mid" | "high" | "peak";

function bucketize(score: number): Bucket {
  if (score >= 86) return "peak";
  if (score >= 71) return "high";
  if (score >= 56) return "mid";
  return "low";
}

const TABLE: Record<Bucket, Omit<Letter, "promptVersion" | "source">> = {
  low: {
    title: "젖은 장작과 마른 나뭇잎",
    body:
      "두 사람의 기운은 서둘러 타오르지 않는다. 불을 지피려면 바람을 고르게 하고, 장작을 한 번 더 말려야 한다.\n\n그러나 어느 관계든 한 번쯤은 젖은 계절을 지난다. 이 시간이 영영 젖어 있는 것은 아니다.\n\n오늘은 무리하지 말 것. 마주 앉는 것만으로도 충분한 날이 있다.",
    pullQuote: "마주 앉는 것만으로 충분한 날이 있다",
  },
  mid: {
    title: "서로 다른 바람의 자리",
    body:
      "한 사람은 동쪽에서, 다른 한 사람은 남쪽에서 분다. 같은 방향으로 불지 않지만, 가운데 나무 한 그루는 두 바람을 모두 맞는다.\n\n가끔 방향이 어긋나 잎을 흔들기도 한다. 그래도 뿌리는 깊어진다.\n\n서로의 바람을 없애려 하지 말 것. 각자의 방향을 그대로 두는 편이 낫다.",
    pullQuote: "뿌리는 두 바람을 모두 기억한다",
  },
  high: {
    title: "나무가 불을 만나면",
    body:
      "한 사람의 기운은 나무로 자라고, 다른 한 사람의 기운은 불로 피어오른다. 두 사람이 마주 앉은 자리엔 한 줄기의 연기와 한 움큼의 온기가 함께 머문다.\n\n다만 나무가 너무 젖어 있을 땐 불이 애를 먹는다. 속도가 다른 날에는 작은 균열도 생긴다. 다행히 저녁의 온도는 맞는다.\n\n서두르지 말 것. 천천히 서로의 연료가 되어가는 것으로 충분하다.",
    pullQuote: "너희는 서로에게 연료이자 불씨다",
  },
  peak: {
    title: "같은 강을 흐르는 두 줄기",
    body:
      "두 사람의 기운은 서로를 밀어내지 않는다. 같은 강을 이루는 두 지류처럼, 먼 곳에서 출발했지만 어느 순간 같은 방향으로 흐른다.\n\n다른 온도, 다른 속도로 와서 하나의 물이 되는 일은 드물다. 이 드묾을 가볍게 여기지 말 것.\n\n너무 붙잡지도, 너무 풀어놓지도 않은 자리에서 가장 오래 함께 흐른다.",
    pullQuote: "드문 일을 가볍게 여기지 말 것",
  },
};

export function fallbackLetter(score: number): Omit<Letter, "promptVersion" | "source"> {
  return TABLE[bucketize(score)];
}

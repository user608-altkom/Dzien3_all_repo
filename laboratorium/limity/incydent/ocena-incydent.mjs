export function limitWChwili({limitBazowyGrosze, wniosek, teraz}) {
  const t = Date.parse(teraz);
  if (Date.parse(wniosek.od) <= t && t < Date.parse(wniosek.do)) return wniosek.limitGrosze;
  return limitBazowyGrosze;
}

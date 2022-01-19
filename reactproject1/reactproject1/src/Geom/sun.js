  export const sunStr = '<sun><avLst><gd name="adj" fmla="val 25000" /></avLst><gdLst><gd name="a" fmla="pin 12500 adj 46875" />' +
  '<gd name="g0" fmla="+- 50000 0 a" /><gd name="g1" fmla="*/ g0 30274 32768" /><gd name="g2" fmla="*/ g0 12540 32768" />' + 
  '<gd name="g3" fmla="+- g1 50000 0" /><gd name="g4" fmla="+- g2 50000 0" /><gd name="g5" fmla="+- 50000 0 g1" /><gd name="g6" fmla="+- 50000 0 g2" />' +
  '<gd name="g7" fmla="*/ g0 23170 32768" /><gd name="g8" fmla="+- 50000 g7 0" /><gd name="g9" fmla="+- 50000 0 g7" /><gd name="g10" fmla="*/ g5 3 4" />' +
  '<gd name="g11" fmla="*/ g6 3 4" /><gd name="g12" fmla="+- g10 3662 0" /><gd name="g13" fmla="+- g11 3662 0" /><gd name="g14" fmla="+- g11 12500 0" />' +
  '<gd name="g15" fmla="+- 100000 0 g10" /><gd name="g16" fmla="+- 100000 0 g12" /><gd name="g17" fmla="+- 100000 0 g13" /><gd name="g18" fmla="+- 100000 0 g14" />' +
  '<gd name="ox1" fmla="*/ w 18436 21600" /><gd name="oy1" fmla="*/ h 3163 21600" /><gd name="ox2" fmla="*/ w 3163 21600" /><gd name="oy2" fmla="*/ h 18436 21600" />' +
  '<gd name="x8" fmla="*/ w g8 100000" /><gd name="x9" fmla="*/ w g9 100000" /><gd name="x10" fmla="*/ w g10 100000" /><gd name="x12" fmla="*/ w g12 100000" />' +
  '<gd name="x13" fmla="*/ w g13 100000" /><gd name="x14" fmla="*/ w g14 100000" /><gd name="x15" fmla="*/ w g15 100000" /><gd name="x16" fmla="*/ w g16 100000" />' +
  '<gd name="x17" fmla="*/ w g17 100000" /><gd name="x18" fmla="*/ w g18 100000" /><gd name="x19" fmla="*/ w a 100000" /><gd name="wR" fmla="*/ w g0 100000" />' +
  '<gd name="hR" fmla="*/ h g0 100000" /><gd name="y8" fmla="*/ h g8 100000" /><gd name="y9" fmla="*/ h g9 100000" /><gd name="y10" fmla="*/ h g10 100000" />' +
  '<gd name="y12" fmla="*/ h g12 100000" /><gd name="y13" fmla="*/ h g13 100000" /><gd name="y14" fmla="*/ h g14 100000" /><gd name="y15" fmla="*/ h g15 100000" />' +
  '<gd name="y16" fmla="*/ h g16 100000" /><gd name="y17" fmla="*/ h g17 100000" /><gd name="y18" fmla="*/ h g18 100000" /></gdLst><ahLst>' +
  '<ahXY gdRefX="adj" minX="12500" maxX="46875"><pos x="x19" y="vc" /></ahXY></ahLst><cxnLst><cxn ang="3cd4"><pos x="hc" y="t" /></cxn><cxn ang="cd2">' +
  '<pos x="l" y="vc" /></cxn><cxn ang="cd4"><pos x="hc" y="b" /></cxn><cxn ang="0"><pos x="r" y="vc" /></cxn></cxnLst><rect l="x9" t="y9" r="x8" b="y8" />' +
  '<pathLst><path><moveTo><pt x="r" y="vc" /></moveTo><lnTo><pt x="x15" y="y18" /></lnTo><lnTo><pt x="x15" y="y14" /></lnTo><close /><moveTo><pt x="ox1" y="oy1" />' +
  '</moveTo><lnTo><pt x="x16" y="y13" /></lnTo><lnTo><pt x="x17" y="y12" /></lnTo><close /><moveTo><pt x="hc" y="t" /></moveTo><lnTo><pt x="x18" y="y10" /></lnTo><lnTo>' +
  '<pt x="x14" y="y10" /></lnTo><close /><moveTo><pt x="ox2" y="oy1" /></moveTo><lnTo><pt x="x13" y="y12" /></lnTo><lnTo><pt x="x12" y="y13" /></lnTo><close /><moveTo>' +
  '<pt x="l" y="vc" /></moveTo><lnTo><pt x="x10" y="y14" /></lnTo><lnTo><pt x="x10" y="y18" /></lnTo><close /><moveTo><pt x="ox2" y="oy2" /></moveTo><lnTo><pt x="x12" y="y17" />' +
  '</lnTo><lnTo><pt x="x13" y="y16" /></lnTo><close /><moveTo><pt x="hc" y="b" /></moveTo><lnTo><pt x="x14" y="y15" /></lnTo><lnTo><pt x="x18" y="y15" /></lnTo>' +
  '<close /><moveTo><pt x="ox1" y="oy2" /></moveTo><lnTo><pt x="x17" y="y16" /></lnTo><lnTo><pt x="x16" y="y17" /></lnTo><close /><moveTo><pt x="x19" y="vc" /></moveTo>' +
  '<arcTo wR="wR" hR="hR" stAng="cd2" swAng="21600000" /><close /></path></pathLst></sun>'
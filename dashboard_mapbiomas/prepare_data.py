"""Atualiza os dados incorporados ao dashboard a partir dos outputs do Notebook 03."""
from pathlib import Path
import base64, json
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent
NOTEBOOK = ROOT.parent / "03_analise_mapbiomas.ipynb"
NAMES = {3:"Forma\u00e7\u00e3o Florestal",9:"Silvicultura",11:"Campo alagado e \u00e1rea pantanosa",12:"Forma\u00e7\u00e3o campestre",15:"Pastagem",21:"Mosaico de usos",24:"\u00c1rea urbanizada",25:"Outras \u00e1reas n\u00e3o vegetadas",29:"Afloramento rochoso",30:"Minera\u00e7\u00e3o",32:"Apicum",33:"Rio, lago e oceano",41:"Outras lavouras tempor\u00e1rias"}
class Tables(HTMLParser):
    def __init__(self): super().__init__(); self.rows=[]; self.row=None; self.cell=None
    def handle_starttag(self, tag, attrs):
        if tag=="tr": self.row=[]
        elif tag in ("td","th") and self.row is not None: self.cell=""
    def handle_data(self, data):
        if self.cell is not None: self.cell+=data
    def handle_endtag(self, tag):
        if tag in ("td","th") and self.cell is not None: self.row.append(self.cell.strip()); self.cell=None
        elif tag=="tr" and self.row is not None: self.rows.append(self.row); self.row=None
def get_table(nb, index):
    markup=next("".join(o["data"]["text/html"]) for o in nb["cells"][index]["outputs"] if "text/html" in o.get("data",{}))
    parser=Tables(); parser.feed(markup); return parser.rows
def number(value): return float(value.replace(",","").replace("%","").replace("+","").strip() or 0)
def build():
    nb=json.loads(NOTEBOOK.read_text(encoding="utf-8-sig")); classes=[]
    for row in get_table(nb,57)[1:]:
        if len(row)<9: continue
        ident=int(row[1]); classes.append({"id":ident,"name":NAMES[ident],"color":row[3],"area1985":number(row[4]),"area2025":number(row[5]),"delta":number(row[6]),"deltaPp":number(row[7]),"deltaPct":number(row[8])})
    table=get_table(nb,81); columns=[int(x.split()[0]) for x in table[0][1:]]; matrix=[]
    for row in table[1:]:
        origin=int(row[0].split()[0])
        for i,value in enumerate(row[1:]): matrix.append({"from":origin,"to":columns[i],"ha":number(value)})
    flows=sorted((x.copy() for x in matrix if x["from"]!=x["to"]),key=lambda x:x["ha"],reverse=True)[:10]
    for x in flows: x.update(fromName=NAMES[x["from"]],toName=NAMES[x["to"]])
    image=next(o["data"]["image/png"] for o in nb["cells"][39]["outputs"] if "image/png" in o.get("data",{}))
    (ROOT/"assets"/"mapas_1985_2025.png").write_bytes(base64.b64decode(image))
    data={"classes":classes,"matrix":matrix,"flows":flows,"names":NAMES,"indicators":{"areaHa":77337.524194,"validPixels":933319,"stableHa":54571.440563,"changedHa":22766.083632,"stablePct":70.562694,"changedPct":29.437306}}
    (ROOT/"data.js").write_text("window.DASHBOARD_DATA = "+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
if __name__=="__main__": build()

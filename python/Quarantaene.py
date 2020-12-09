# Python-Programm zum Exponat "Quarantäne"
import pygame
import time
import random
pygame.init()
#
# Parameter
#
## Geometrie
#
VidInfo = pygame.display.Info()          # Abfrage der Bildschirmparameter
streifen_rechts = 160                    # Platz für die Menueleiste      
streifen_unten  = 130                    # Platz für eine Fußleiste 
halbzellhh = 7                           # Anzahl der Pixel 
halbzellbr = 8                           # Anzahl der Pixel 
kreisradius = 7                          # Anzahl der Pixel
totalwidth = VidInfo.current_w           # Gesamtbreite in Pixeln
breite = (VidInfo.current_w - streifen_rechts) // (2 * halbzellbr) # Zellen
hoehe  = (VidInfo.current_h - streifen_unten) // (2 * halbzellhh)  # Zellen
totalheight = hoehe * halbzellhh * 2     # Gesamthoehe in Pixeln
fontname = "Comic Sans MS"
#
##  Verlaufsanzeige
#
dispbreite = 140      # Breite der Verlaufsanzeige in Pixeln
disphoehe = 250       # Höhe der Verlaufsanzeige in Pixeln
dispflug = 30         # Höhe der Nulllinie der Verlaufsanzeige
#
## Das Fenster für die Belehrungen 
#
lfw = 900              # Breite des Fensters in Pixeln 
lfh = 500              # Höhe   des Fensters in Pixeln 
lehrfenster = ((totalwidth-lfw)//2,(totalheight-lfh)//2,lfw,lfh)
#
## Agressivität
#
rstark = 0.039        # W des Ansteckens (jede Nachbarzelle, jeder Tag 6-9)
rreise = 0.003        # W des Ansteckens einer entfernten Zelle, Tag 4-6
#
## Maßnahmen#
#
impfbeginn = 500      # Anzahl der Tage bis zur Möglichkeit, zu impfen
qubeginn = 220        # Anzahl der Tage bis zur Möglichkeit für Quarantäne 
schutzbeginn = 80     # Anzahl der Tage bis zur Möglichkeit, zu schützen
quarant = False
maxquazones = 5       # Anzahl der Quarantänezonen plus Eins
quazone = 0           # Nummer der zuletzt eingerichteten Quarantänezone 
#
## Geschwindigkeit
#
delay = 0.1
#
# Weitere abgeleitete Parameter
#
zellbreite = 2 * halbzellbr                    # Anzahl der Pixel
zellhoehe  = 2 * halbzellhh                    # Anzahl der Pixel
feldhoehe = totalheight                        # Anzahl der Pixel  
feldbreite = breite * zellbreite+halbzellbr    # Anzahl der Pixel   
rand = totalwidth - feldbreite                 # Anzahl der Pixel
randmitte = feldbreite + (rand // 2)           # Anzahl der Pixel
unten = hoehe - 1
rschwach = rstark / 3
zellzahl = hoehe * breite
disprechts = feldbreite + dispbreite + 5
dispu = feldhoehe - dispflug                   # Nulllinie der Verlaufsanzeige
#
# Farbnamen
#
frot = (255,0,0)
fhell = (255,100,100)
fschwarz = (60,60,60)
fgruen = (24,100,0)
fblau = (0,0,200)
fhellblau = (100,100,200)
flind = (0,200,0)
fgelb = (155,155,0)

#
# Arrays vorbereiten
#
## tag[zeile][spalte] : Laufzeit der Infektion, negative Werte: nicht infiziert
## infcount[zeile][spalte] : Anzahl der bereits überstandenen Infektionen
## qua[zeile][spalte] : Zugehörigkeit zu einem Quarantänebereich
#
tag = [-1] * hoehe
infcount = [0] * hoehe
qua = [0] * hoehe
def allegesund():
  for z in range(hoehe):
    tag[z] = [-1] * breite
    infcount[z] = [0] * breite
    qua[z] = [0] * breite
#
## nachbar : Offset der Nachbarzellen
#
nachbars = [[0,-1,-1,-1,0,1],[1,0,-1,0,1,1]]  
nachbarz = [1,1,0,-1,-1,0]
#
## Quarantärezentren
#
quacenter = [[0,0]] * maxquazones
#
# Unterprogramm: Zeichne Kreislein
#
def rzeichne(z,s,col,rradius):
  jj = halbzellbr*(1 + (z % 2))
  pygame.draw.circle(win,col,(zellbreite*s+jj,zellhoehe*z+halbzellhh),rradius)
#
def zeichne(z,s,col):
  rzeichne(z,s,col,kreisradius)
#
def ganz_schwarz():        # Schwarzes Arbeitsfenster mit Randlinie rechts
  win.fill((0,0,0))
  pygame.draw.line(win,(60,60,60),(totalwidth - 2, 0),\
                   (totalwidth - 2,totalheight),2)
#
def spaltezeile(punkt):
  zellz = punkt[1] // zellhoehe
  zells = (punkt[0] - halbzellbr*(zellz % 2))// zellbreite
  return [zells,zellz]
#
def distquad(pa,pb):   # Distanz zweier Punkte, quadriert
  return (pa[0]-pb[0])**2 + (pa[1]-pb[1])**2
#
# Farbdarstellung für Tag d der Infektion   
#
def farbe(d):
  if d <= -9 : return fgruen            # dauerhaft immun
  elif (d == -8): return fblau          # geimpft, deshalb immun
  elif (d == -2): return (100,100,100)  # Mundschutz 
  elif d in (6,7,8,9): return frot      # ansteckend (Tage 4-5 ohne Farbe!)
  elif (d == 10): return (255,25,25)    # ansteckend
  elif (d == 11): return (255,50,50)    # ansteckend
  elif (d == 12): return (255,75,75)    # ansteckend
  elif d in (13,14): return fhell       # schwach ansteckend
  elif (d == 15): return (200,150,100)
  elif d in (16,17): return (0,200,0)   # vorübergehend immun 16-30
  elif d in (18,19): return (0,180,0)
  elif d in (20,21): return (0,160,0)
  elif d in (22,23): return (0,140,0)
  elif d in (24,25): return (0,120,0)
  elif d in (26,27): return (0,100,0)
  elif d in (28,29): return (0,80,0)
  elif (d == 30): return (0,60,0)
  else: return fschwarz                  # hat nix
#
# Spielfeld mit den Farben zeichnen
#
def spielfeld():
   for z in range(hoehe):
      for s in range(breite):
         zeichne(z,s,farbe(tag[z][s]))
#
#  Spielfeld einrichten
#
win = pygame.display.set_mode((totalwidth,totalheight))
pygame.display.set_caption("Quarantäne")
ELMIcon = pygame.image.load('biest5.png')
pygame.display.set_icon(ELMIcon)
pygame.display.init()
fenster = True
#
# Rand einrichten: Quarantaenesymbol
#
schutzcenter = (feldbreite+72,100)
qcenter = (schutzcenter[0], schutzcenter[1] + 176)
impfcenter = (qcenter[0], qcenter[1] + 176)
#
def draw_qu_symb():
  pygame.draw.circle(win,fgelb,qcenter,60,4)
  myfont = pygame.font.SysFont("Comic Sans MS", 84)
  label = myfont.render("Q", 1, fgelb)
  win.blit(label, (qcenter[0] - 24, qcenter[1]-32))
#
# Rand einrichten: Impfsymbol
#
#
def impfbereit():
  myfont = pygame.font.SysFont("Comic Sans MS", 44)
  label = myfont.render("Impfen", 1,fblau)
  win.blit(label, (impfcenter[0] - 48, impfcenter[1] -  18))
  pygame.draw.circle(win,(0,0,200),impfcenter,60,5)

#
# Rand einrichten: Mundschutz
#
myfont = pygame.font.SysFont("Comic Sans MS", 44)
pygame.draw.circle(win,(80,80,80),schutzcenter,60,3)
def schutzbereit():
  pygame.draw.circle(win,(150,150,150),schutzcenter,60,5)
  label = myfont.render("Schutz", 1, (100,100,100))
  win.blit(label, (feldbreite+22, schutzcenter[1] - 18))
#
# Die i-te Nachbarzelle bestimmen, i = 0,...,5
#
def nachbar(z,s,i):
  zz = (z + nachbarz[i]) % hoehe
  ss = (s + nachbars[z % 2][i]) % breite
  return (zz,ss)
#
# Nachbarzellen (z,s) im Quarantänekreis
#
wolke_g = [(0,0)] * 91
wolke_u = [(0,0)] * 91
count = 0
for im in range(-5,6):
  wolke_g[count] = (0,im)
  wolke_u[count] = (0,im)
  count += 1
for im in range(-4,5):
  wolke_g[count] = (-2,im)
  wolke_u[count] = (-2,im)
  count += 1
  wolke_g[count] = (2,im)
  wolke_u[count] = (2,im)
  count += 1
for im in range(-3,4):
  wolke_g[count] = (-4,im)
  wolke_u[count] = (-4,im)
  count += 1
  wolke_g[count] = (4,im)
  wolke_u[count] = (4,im)
  count += 1
for im in range(-4,6):
  wolke_u[count] = (-1,im)
  count += 1  
  wolke_u[count] = (+1,im)
  count += 1
count = count - 20
for im in range(-5,5):
  wolke_g[count] = (-1,im)
  count += 1  
  wolke_g[count] = (+1,im)
  count += 1
for im in range(-3,5):
  wolke_u[count] = (-3,im)
  count += 1  
  wolke_u[count] = (+3,im)
  count += 1
count = count - 16  
for im in range(-4,4):
  wolke_g[count] = (-3,im)
  count += 1  
  wolke_g[count] = (+3,im)
  count += 1
for im in range(-2,4):
  wolke_u[count] = (-5,im)
  count += 1  
  wolke_u[count] = (+5,im)
  count += 1
count = count - 12
for im in range(-3,3):
  wolke_g[count] = (-5,im)
  count += 1  
  wolke_g[count] = (+5,im)
  count += 1
#
def setquawolke(centrum,wert):
  for ii in range(91):
    if (centrum[1] % 2) == 0:
      qua[(centrum[1] + wolke_g[ii][0]) % hoehe]\
          [(centrum[0] + wolke_g[ii][1]) % breite] = wert
    else:  
      qua[(centrum[1] + wolke_u[ii][0]) % hoehe]\
          [(centrum[0] + wolke_u[ii][1]) % breite] = wert
#
def drawwolke(centrum,farbe):
  for ii in range(91):
    if (centrum[1] % 2) == 0:
      rzeichne((centrum[1] + wolke_g[ii][0]) % hoehe,\
               (centrum[0] + wolke_g[ii][1]) % breite,farbe,10)
    else:
      rzeichne((centrum[1] + wolke_u[ii][0]) % hoehe,\
               (centrum[0] + wolke_u[ii][1]) % breite,farbe,10)
#
# 
#
def quactive(zelle):
  global quazone, quacenter, qua
  quazone = (quazone + 1) % maxquazones
  if (quazone == 0): quazone += 1
  setquawolke(quacenter[quazone],0)   
  drawwolke(quacenter[quazone],(0,0,0))
  quacenter[quazone] = zelle
  setquawolke(quacenter[quazone],quazone)   
  drawwolke(quacenter[quazone],fgelb)
  spielfeld()
#
#  Zelle z,s infiziert Zelle zz,ss
#
def infect(z,s,zz,ss):
  global zinfiziert, zinfizbar
  if (qua[z][s] == qua[zz][ss]):
    if (tag[zz][ss] == -1) or ((tag[zz][ss] == -2) and (random.random() < 0.5)):
      if (zz < z) or ((zz == z) and (ss < s)): tag[zz][ss] = 0
      else: tag[zz][ss] = 1
      zinfiziert += 1
      zinfizbar -= 1
#
# Einen Tag weiter im Krankheitsverlauf
#
def nextday(z,s):
      global zimmun, zinfizbar, zinfiziert
      if (tag[z][s] in range(30)): tag[z][s] += 1
      elif (tag[z][s] == 30):
        infcount[z][s] += 1
        zinfiziert -= 1
        if (3 <= infcount[z][s]):
          tag[z][s] = -9
          zimmun += 1
        else:
          tag[z][s] = -1
          zinfizbar += 1
#
# Prozentuale Werte, mal Höhe der Verlaufsanzeige
#
def vonhundert(zahl):
  return (disphoehe * zahl) // zellzahl
#
# Verlaufsanzeige vorbereiten
#
def dispclear():
  global prozk, prozks, prozksi 
  prozk = [dispu] * dispbreite
  prozks = [dispu - disphoehe] * dispbreite
  prozksi = [dispu - disphoehe] * dispbreite
#
def vlinie():
  global prozk, prozks, prozksi 
  la = vonhundert(zinfiziert) 
  lc = vonhundert(zgeimpft)
  ld = vonhundert(zimmun)
  h2 = disphoehe - (lc + ld)
  h3 = h2 + lc
  u = pdtag % dispbreite
  prozk[u] = dispu - la
  prozks[u] = dispu - h2
  prozksi[u] = dispu - h3
#
# Verlauf anzeigen
#
def pandemieverlauf():
  u = pdtag % dispbreite
  for day in range(dispbreite):
    spalte = (u - day) % dispbreite
    fp = disprechts - day
    pygame.draw.line(win,frot,(fp,dispu),(fp,prozk[spalte]))
    pygame.draw.line(win,fschwarz,(fp,prozk[spalte]),(fp,prozks[spalte]))
    pygame.draw.line(win,fblau,(fp,prozks[spalte]),(fp,prozksi[spalte]))
    pygame.draw.line(win,fgruen,(fp,prozksi[spalte]),(fp,dispu-disphoehe))
    if ((pdtag-day) % 50) == 0:
      pygame.draw.line(win,fgelb,(fp,dispu),(fp,dispu+6))
    elif ((pdtag-day) % 50) == 1:
            pygame.draw.line(win,(0,0,0),(fp,dispu),(fp,dispu+6))
#
# Anstecken
#
def anstecken():
  global virulent
  virulent = False
  for z in range(hoehe):
    for s in range(breite):
      nextday(z,s)
      if -1 < tag[z][s]: virulent = True 
      if tag[z][s] in (4,5,6,7,8,9,10,11,12,13,14,15):
        rr = rstark
        if tag[z][s] in (13,14,15): rr = rschwach
        for i in range(6):
          if random.random() < rr:
            [zz,ss] = nachbar(z,s,i) 
            infect(z,s,zz,ss)
        if (tag[z][s] in (4,5,6)) and (random.random() < rreise):
          zz = random.randrange(0,hoehe)
          ss = random.randrange(0,breite)
          infect(z,s,zz,ss)
          if (0.6 < schutzfaktor) and (random.random() < .5):
            zz = random.randrange(0,hoehe)
            ss = random.randrange(0,breite)
            infect(z,s,zz,ss)
#          
def impfen():
  global zinfizbar,  zinfiziert, zgeimpft, zimmun
  zufallsz = random.randrange(0,hoehe)
  zufallss = random.randrange(0,breite)
  if (tag[zufallsz][zufallss] in (-2,-1)):  zinfizbar -= 1
  elif tag[zufallsz][zufallss] in range(31): zinfiziert -=1
  elif (tag[zufallsz][zufallss] == -8):  zgeimpft -= 1
  elif (tag[zufallsz][zufallss] == -9):  zimmun -= 1
  tag[zufallsz][zufallss] = -8;
  zgeimpft += 1
#  
def erstinfektion():
  global zinfiziert, zinfizbar
  a = random.randrange(hoehe)
  b = random.randrange(breite)
  tag[a][b] = 4
  tag[(a + 2) % hoehe][b] = random.randrange(7)
  tag[(a + 2) % hoehe][(b + 2) % breite] = random.randrange(7)
  tag[a][(b + 2) % breite] = random.randrange(7)
  zinfiziert += 4
  zinfizbar  -= 4
# fontname = "Comic Sans MS"
def text_to_rect(txt, chteck, offset, color, fontsize):
  thisfont = pygame.font.SysFont(fontname, fontsize)
  lbl = thisfont.render(txt, True, color)
  win.blit(lbl, (chteck[0]+offset[0], chteck[1]+offset[1]))
  pygame.display.flip()
#
def obenrechts(txt):
  global lehrfenster
  text_to_rect(txt,lehrfenster,((2 * lfw) // 3,20),fhellblau,64)
#
skip_eck = pygame.Rect((feldbreite + 10,feldhoehe - 120,130,100))
def skipsymb():
  pygame.draw.rect(win,fhellblau,skip_eck,3)
  text_to_rect("Skip",skip_eck,(30,10),fhellblau,44)
  text_to_rect("Intro",skip_eck,(30,50),fhellblau,44)
  pygame.display.flip()
#  
def skip_on_click():
  global sec   
  skipclick = False
  for event in pygame.event.get():
    if event.type == pygame.MOUSEBUTTONDOWN:
      if skip_eck.collidepoint(pygame.mouse.get_pos()): sec = 0
#
def warte(zahl):
  for iw in range(zahl):
    time.sleep(sec)
    skip_on_click()
#    
def Einfuehrung():
  global lehrfenster, sec
  sec = 1
  ganz_schwarz()
  lfchen = (lehrfenster[0]+5,lehrfenster[1]+5,lehrfenster[2]-10,\
            lehrfenster[3]-10)
  pygame.draw.rect(win,(200,200,200),lfchen)
  for a in range(hoehe):
    for b in range(breite):
      tag[a][b] = random.randrange(-8,30)
      if tag[a][b] in range(-7,-1): tag[a][b] = -1
  spielfeld()
  pygame.display.update()
  warte(2)
  pygame.draw.rect(win,(190,190,190),lehrfenster)
  pygame.display.flip()
  time.sleep(1 * sec)
  skipsymb()
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  tz = "Dieses Spiel ist keine Modellierung"
  offs = (90,120)
  text_to_rect(tz,lehrfenster, offs, frot, 60)
  warte(1)
  tz = " einer realen Pandemie."
  offs = (180,190)
  text_to_rect(tz,lehrfenster, offs, frot,60)
  warte(2)
  tz = "Die Wirklichkeit ist viel komplizierter."
  offs = (80,320)
  text_to_rect(tz,lehrfenster, offs, frot,60)
  warte(5)
  myfont = pygame.font.SysFont("Comic Sans MS", 40)
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  zeichne(29,33,fblau)
  zeichne(27,34,frot)
  zeichne(25,36,fschwarz)
  zeichne(24,38,fgruen)
  obenrechts("Spielidee")
  tz = "Die kleinen Kreise können sich gegenseitig anstecken."
  offs = (80,110)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  warte(1)
  tz = "An ihrer Farbe erkennt man, ob sie symptomfrei sind," 
  offs = (80,160)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "krank, "
  offs = (80,200)
  text_to_rect(tz,lehrfenster,offs,frot,40)
  tz = "immun  "
  offs = (180,200)
  text_to_rect(tz,lehrfenster,offs,fgruen,40)
  tz = "oder "
  offs = (280,200)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "geimpft."
  offs = (360,200)
  text_to_rect(tz,lehrfenster,offs,fblau,40)
  warte(4)
  tz = "Bekämpfe die Pandemie "
  offs = (80,300)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "durch Schutzmaßnahmen, Quarantäne und Impfung! "
  offs = (80,340)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  pygame.display.flip()
  warte(8)
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  pygame.display.flip()
  schutzcenter = (feldbreite+72,100)
  symbfont = pygame.font.SysFont("Comic Sans MS", 44)
  pygame.draw.circle(win,(150,150,150),schutzcenter,60,5)
  label = symbfont.render("Schutz", 1, (100,100,100))
  win.blit(label, (feldbreite+22, schutzcenter[1] - 18))
  obenrechts("Schutz")
  tz = "Ein Klick auf das Schutzsymbol (siehe oben rechts) "
  offs = (80,130)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "bewirkt, dass einige Kreise sich besser schützen."
  offs = (80,170)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "Man erkennt sie an ihrer hellgrauen Farbe."
  offs = (80,230)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "Erneutes Klicken erhöht die Anzahl, "
  offs = (80,290)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  tz = "senkt zugleich aber die allgemeine Vorsicht."
  offs = (80,330)
  text_to_rect(tz,lehrfenster,offs,fschwarz,40)
  pygame.display.flip()
  warte(8)
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  pygame.display.flip()
  pygame.draw.circle(win,(0,0,0),schutzcenter,62)
  impfcenter = (schutzcenter[0], schutzcenter[1] + 352)
  label = symbfont.render("Impfen", 1,fblau)
  win.blit(label, (impfcenter[0] - 48, impfcenter[1] -  18))
  pygame.draw.circle(win,(0,0,200),impfcenter,60,5)
  obenrechts("Impfen")
  tz = "Ein Klick auf das Impfsymbol startet die Impfkampagne."
  offs = (60,230)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  pygame.display.flip()
  warte(8)
  pygame.draw.circle(win,(0,0,0),impfcenter,62)
  drawwolke((10,10),fgelb)
  drawwolke((40,13),fgelb)
  drawwolke((100,19),fgelb)
  drawwolke((9,300),fgelb)
  spielfeld()  
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  draw_qu_symb()
  obenrechts("Quarantäne")
  tz = "Sobald das gelbe Q erscheint, kann man durch Klicks"
  offs = (80,170)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  tz = "auf das Spielfeld Quarantänezonen einrichten."
  offs = (80,210)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  pygame.display.flip()
  warte(4)
  tz = "Bis zu vier Quarantänezonen sind gleichzeitig möglich."
  offs = (80,270)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  pygame.display.flip()
  warte(7)
  pygame.draw.rect(win,(0,0,0),skip_eck)
  pygame.draw.circle(win,(0,0,0),qcenter,62) 
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  obenrechts("Spielziel")
  tz = "Je weniger Kreise zum Ende der Pandemie grün sind,"
  offs = (80,180)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  pygame.display.flip()
  time.sleep(1 * sec)
  tz = "desto besser. Denn die grünen Kreise stehen für "
  offs = (80,230)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  tz = "schwere Krankheitsverläufe."
  offs = (80,280)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  pygame.display.flip()
  time.sleep(5 * sec)
  pygame.draw.rect(win,(200,200,200),lehrfenster)
  obenrechts("Los geht's!")
  tz = "Zunächst entwickelt sich die Pandemie ungestört."
  offs = (70,200)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  tz = "Man muss etwas warten, bevor man sie bekämpfen kann."
  offs = (40,280)
  text_to_rect(tz,lehrfenster,offs,fschwarz,44)
  pygame.display.flip()
  time.sleep(4 * sec)   
  ganz_schwarz()
  allegesund()
  spielfeld()
  pygame.display.update()
  time.sleep(2 * sec)     
#
#  Main Loop
#
while fenster:
  #
  # Zähler, die sich verändern
  #
  allegesund()
  Einfuehrung()
  zinfizbar = hoehe * breite     # Anzahl der aktuell Infizierbaren
  zinfiziert = 0                 # Anzahl der aktuell Infizierten
  zimmun = 0                     # Anzahl der Immunen (ohne Geimpfte)
  zgeimpft = 0                   # Anzahl der Geimpften
  pdtag = 0                      # Dauer der Pandemie
  impfung = False
  schutz = False
  schutzfaktor = 0.2
  qustart = qubeginn
  ganz_schwarz()
  dispclear()
  spielfeld()
  #
  erstinfektion()
  #
  virulent = True
  qbereit = False
  while virulent:
  #
  # Mausereignisse abfragen und darauf reagieren
  #  
    impfclick = False
    for event in pygame.event.get():
      if event.type == pygame.QUIT: fenster = False
      elif event.type == pygame.MOUSEBUTTONDOWN:
        clickpt = pygame.mouse.get_pos()
        feldclick = (clickpt[0] in range(feldbreite))\
          and (clickpt[1] in range(feldhoehe))      # dafür gibt's ein Kommando
        if feldclick and qbereit: 
          quactive(spaltezeile(clickpt))
          feldclick = False
        impfclick = (distquad(clickpt,impfcenter) <= 3600)
        schutzclick = (distquad(clickpt,schutzcenter) <= 3600)
        if schutzclick:
          if (not schutz) and (schutzbeginn <= pdtag):
            schutz = True
            pygame.draw.circle(win,(0,0,0),schutzcenter,60)
          elif schutz:
            schutzfaktor = 0.3 + 0.7 * schutzfaktor
            if (pdtag < qustart): qustart += 20
          dicke = int(schutzfaktor * 60)
          pygame.draw.circle(win,(120,120,120),schutzcenter,60,dicke)     
        if (not impfung) and impfclick and (impfbeginn <= pdtag):
          impfung = True
          pygame.draw.circle(win,(0,0,180),impfcenter,60)
  #
    anstecken()
  #
  # Änderungen abhängig vom Pandemietag 
  #
    if virulent:
      vlinie()
      pandemieverlauf()
      pdtag += 1
      if (schutzbeginn == pdtag): schutzbereit()
      if (qustart == pdtag):
        draw_qu_symb()
        qbereit = True
      if (impfbeginn == pdtag): impfbereit()
    # Jeden Tag wird einer geimpft  
      elif impfung: impfen()
    # Jeden Tag ziehen 8 den Mundschutz neu an oder wieder aus
      if schutz:
        for iii in range(8):
          zufallsz = random.randrange(0,hoehe)
          zufallss = random.randrange(0,breite)
          if (tag[zufallsz][zufallss] == -1) and (random.random()<=schutzfaktor):
            tag[zufallsz][zufallss] = -2
          elif (tag[zufallsz][zufallss] == -2):
            tag[zufallsz][zufallss] = -1
    #
    # Neuzeichnen  
    #
      spielfeld()
      pygame.display.update()
      time.sleep(delay)
      virulent = virulent and fenster
    else:
      pygame.draw.rect(win,(80,80,80),lehrfenster)
      spielfeld()
      pygame.display.flip()
      time.sleep(1)  
      pygame.draw.rect(win,(200,200,200),lehrfenster)
      obenrechts("Bewertung")
      tz = "Nach " + str(pdtag) + " Tagen ist diese Pandemie nun erloschen."
      offs = (60,120)
      text_to_rect(tz,lehrfenster, offs, fschwarz, 44)  
      pygame.display.flip()
      time.sleep(2)
      if pdtag < qustart:
        tz = "Glück gehabt!"
        offs = (60,220)
        text_to_rect(tz,lehrfenster, offs, fschwarz, 44)  
        tz = "Gelegentlich versiegt eine Infektionskette durch Zufall."
        offs = (60,320)
        text_to_rect(tz,lehrfenster, offs, fschwarz, 44)  
        pygame.display.flip()
      else:  
        immunrate = (zimmun * 100) // zellzahl
        tz = str(immunrate) + \
          "% der Kreise hatten einen schweren Infektionsverlauf."
        offs = (60,220)
        text_to_rect(tz,lehrfenster, offs, fschwarz, 44)  
        pygame.display.flip()
        time.sleep(2)
        if immunrate < 20:
          tz = "Das ist ein ausgezeichnetes Ergebnis."
        elif (20 <= immunrate) and (immunrate < 32):
          tz = "Gut! Etwa halb so schlimm wie ohne Maßnahmen."
        elif (32 <= immunrate) and (immunrate < 47):
          tz = "Kein gutes Ergebnis. Die Maßnahmen reichten nicht aus!"
        else:
          tz = "Schlimm! Ein schlechtes Krisenmanagement!"
        offs = (60,320)
        text_to_rect(tz,lehrfenster, offs, fschwarz, 44)  
        pygame.display.flip()
        time.sleep(10)  
  print("Tage: ",pdtag)    
  print(" Geimpft: ",zgeimpft, "Immun: ",zimmun,"Infiziert: ",zinfiziert,"Infbar: ",zinfizbar,"Zusammen: ",zgeimpft+zimmun+zinfiziert+zinfizbar)
  pygame.display.update()
pygame.quit()
quit()

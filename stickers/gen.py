#!/usr/bin/env python3
# Набор стикеров SMR-26 — Саша и Витя, палитра сайта. Pillow, 512x512, прозрачный фон, белый контур.
import math, os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.expanduser('~/smr26-stickers')
FONT = '/System/Library/Fonts/Supplemental/Impact.ttf'

# палитра
TEAL=(35,93,90,255); TEAL2=(47,111,99,255); OCHRE=(200,132,30,255); OCHRE_D=(168,101,17,255)
CREAM=(244,236,217,255); SKIN=(241,203,166,255); EARSK=(233,189,149,255)
HAIR=(156,122,72,255); DARK=(42,32,24,255); WHITE=(255,255,255,255)
BEER=(232,169,58,255); BEER_D=(154,106,30,255); FOAM=(255,246,224,255)
BLUE=(63,134,196,255); RED=(181,72,46,255); MOUTH=(138,74,58,255)
SHIRT_S=(63,127,121,255); SHIRT_V=(176,106,24,255); RED_HEART=(214,72,59,255)
SUN=(230,178,90,255)

def blend(a,b,t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))+(255,)
CHEEK=blend(SKIN,(232,137,106,255),0.5)
STUB=blend(SKIN,(96,70,46,255),0.34)

def el(d,cx,cy,rx,ry,fill,outline=None,w=0):
    d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=fill,outline=outline,width=w)

def head(d,cx,cy,R,kind,expr):
    # уши
    el(d,cx-R+3,cy+2,6,8,EARSK); el(d,cx+R-3,cy+2,6,8,EARSK)
    # голова
    el(d,cx,cy,R,R,SKIN)
    # щёки
    el(d,cx-int(R*0.62),cy+int(R*0.28),int(R*0.26),int(R*0.2),CHEEK)
    el(d,cx+int(R*0.62),cy+int(R*0.28),int(R*0.26),int(R*0.2),CHEEK)
    eyo=int(R*0.28)  # отступ глаз от центра
    eyy=cy-int(R*0.05)
    # причёска / лысина / щетина
    if kind=='vitya':
        el(d,cx-int(R*0.3),cy-int(R*0.52),int(R*0.3),int(R*0.15),blend(SKIN,WHITE,0.55))
        # щетина — нижняя часть лица
        d.pieslice([cx-int(R*0.82),cy-int(R*0.2),cx+int(R*0.82),cy+int(R*0.95)],20,160,fill=STUB)
        el(d,cx,cy+int(R*0.28),int(R*0.5),int(R*0.22),SKIN)  # подбородок чище
    else:
        d.pieslice([cx-R-2,cy-R-6,cx+R+2,cy+int(R*0.5)],180,360,fill=HAIR)
        d.pieslice([cx-R,cy-int(R*0.2),cx+R,cy+int(R*0.55)],182,358,fill=SKIN)  # лоб
        for sx in (-1,1):
            d.line([(cx+sx*int(R*0.45),cy-int(R*0.35)),(cx+sx*int(R*0.2),cy-int(R*0.18))],fill=HAIR,width=max(3,R//12))
    # брови
    if expr not in ('sleep',):
        for sx in (-1,1):
            d.line([(cx+sx*eyo-8,eyy-int(R*0.36)),(cx+sx*eyo+8,eyy-int(R*0.37))],fill=blend(HAIR,DARK,0.45),width=max(3,R//13))
    # глаза/выражение
    er=max(4,int(R*0.11))
    if expr=='heart':
        for sx in (-1,1):
            hx,hy=cx+sx*eyo,eyy
            d.pieslice([hx-7,hy-7,hx,hy+1],0,200,fill=RED_HEART)
            d.pieslice([hx,hy-7,hx+7,hy+1],-20,180,fill=RED_HEART)
            d.polygon([(hx-7,hy-2),(hx+7,hy-2),(hx,hy+9)],fill=RED_HEART)
    elif expr=='cool':
        d.rounded_rectangle([cx-eyo-13,eyy-9,cx+eyo+13,eyy+9],radius=7,fill=DARK)
        d.line([(cx-eyo+13,eyy),(cx+eyo-13,eyy)],fill=DARK,width=5)
    elif expr=='sleep':
        for sx in (-1,1):
            d.arc([cx+sx*eyo-9,eyy-3,cx+sx*eyo+9,eyy+9],0,180,fill=DARK,width=4)
    elif expr=='wow':
        for sx in (-1,1): el(d,cx+sx*eyo,eyy,er,int(er*1.3),DARK)
    elif expr=='dizzy':
        for sx in (-1,1):
            hx=cx+sx*eyo
            d.line([(hx-7,eyy-7),(hx+7,eyy+7)],fill=DARK,width=4); d.line([(hx-7,eyy+7),(hx+7,eyy-7)],fill=DARK,width=4)
    elif expr=='wink':
        d.arc([cx-eyo-9,eyy-3,cx-eyo+9,eyy+9],190,350,fill=DARK,width=5)
        el(d,cx+eyo,eyy,er,er,DARK); el(d,cx+eyo-er//3,eyy-er//3,max(1,er//3),max(1,er//3),WHITE)
    else:
        for sx in (-1,1):
            el(d,cx+sx*eyo,eyy,er,er,DARK)
            el(d,cx+sx*eyo-er//3,eyy-er//3,max(1,er//3),max(1,er//3),WHITE)
    # очки Саши
    if kind=='sasha':
        gr=int(R*0.2)
        for sx in (-1,1): el(d,cx+sx*eyo,eyy,gr,gr,None,DARK,max(3,R//16))
        d.line([(cx-eyo+gr,eyy),(cx+eyo-gr,eyy)],fill=DARK,width=max(3,R//16))
    # рот
    my=cy+int(R*0.5)
    if expr in('grin','heart','cool','wink'):
        d.pieslice([cx-int(R*0.42),my-int(R*0.34),cx+int(R*0.42),my+int(R*0.3)],0,180,fill=(120,52,42,255))
        d.chord([cx-int(R*0.42),my-int(R*0.05),cx+int(R*0.42),my+int(R*0.05)],0,180,fill=WHITE)  # зубы
    elif expr=='dizzy':
        d.line([(cx-22,my),(cx-7,my+8),(cx+7,my-4),(cx+22,my+6)],fill=MOUTH,width=5,joint='curve')
    elif expr=='wow':
        el(d,cx,my+int(R*0.05),int(R*0.16),int(R*0.2),(120,52,42,255))
    elif expr=='sleep':
        el(d,cx,my,int(R*0.12),int(R*0.1),(120,52,42,255))
    elif expr=='shrug':
        d.line([(cx-int(R*0.25),my),(cx+int(R*0.25),my-int(R*0.05))],fill=MOUTH,width=max(3,R//12))
    else:  # smile
        d.arc([cx-int(R*0.4),my-int(R*0.4),cx+int(R*0.4),my+int(R*0.18)],10,170,fill=MOUTH,width=max(4,R//11))

def mug(d,cx,cy,s,tilt=0,hand='r'):
    # простая кружка (без поворота — tilt игнор для простоты, рисуем прямо)
    w=int(34*s); h=int(46*s)
    d.rounded_rectangle([cx-w//2,cy-h//2,cx+w//2,cy+h//2],radius=int(7*s),fill=BEER,outline=BEER_D,width=max(2,int(3*s)))
    d.rounded_rectangle([cx-w//2,cy-h//2,cx+w//2,cy-h//2+int(15*s)],radius=int(6*s),fill=FOAM)
    el(d,cx-int(8*s),cy-h//2+int(6*s),int(5*s),int(4*s),WHITE)
    hx=cx+w//2 if hand=='r' else cx-w//2
    d.arc([hx-int(6*s),cy-int(10*s),hx+int(16*s) if hand=='r' else hx+int(0),cy+int(14*s)],-90,90,fill=BEER_D,width=max(3,int(4*s)))

def body(d,cx,cy,R,color):
    d.pieslice([cx-int(R*1.05),cy-int(R*0.2),cx+int(R*1.05),cy+int(R*1.9)],180,360,fill=color)

def banner(img,text,color=OCHRE_D):
    d=ImageDraw.Draw(img)
    fs=60; f=ImageFont.truetype(FONT,fs)
    def tw(ff): bb=d.textbbox((0,0),text,font=ff); return bb[2]-bb[0]
    while tw(f)>442 and fs>30: fs-=2; f=ImageFont.truetype(FONT,fs)
    w=tw(f); bh=int(fs*1.2); bw=w+48
    bx=256-bw//2; by=512-bh-22
    d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=bh//2,fill=color,outline=WHITE,width=5)
    d.text((256,by+bh//2-int(fs*0.08)),text,font=f,fill=CREAM,anchor='mm')

def add_outline(art,radius=15):
    a=art.split()[3]
    solid=Image.new('RGBA',art.size,WHITE)
    sil=Image.composite(solid,Image.new('RGBA',art.size,(0,0,0,0)),a)
    out=Image.new('RGBA',art.size,(0,0,0,0))
    for r in (radius,int(radius*0.6)):
        for ang in range(0,360,18):
            dx=int(round(r*math.cos(math.radians(ang)))); dy=int(round(r*math.sin(math.radians(ang))))
            out.alpha_composite(sil,(dx,dy))
    out.alpha_composite(art)
    return out

def make(name,draw_fn,caption,bcolor=OCHRE_D):
    art=Image.new('RGBA',(512,512),(0,0,0,0))
    d=ImageDraw.Draw(art)
    draw_fn(d,art)
    art=add_outline(art,15)
    if caption: banner(art,caption,bcolor)
    art.save(os.path.join(OUT,name))
    print('  ✓',name)

# ===== реквизит =====
def sparkle(d,cx,cy,R):
    for a in range(0,360,45):
        d.line([(cx+int(R*0.4*math.cos(math.radians(a))),cy+int(R*0.4*math.sin(math.radians(a)))),
                (cx+int(R*math.cos(math.radians(a))),cy+int(R*math.sin(math.radians(a))))],fill=SUN,width=6)

def boat(d,cx,cy,s):
    d.polygon([(cx-110*s,cy),(cx+110*s,cy),(cx+78*s,cy+58*s),(cx-78*s,cy+58*s)],fill=RED)
    d.rectangle([cx-110*s,cy,cx+110*s,cy+13*s],fill=SUN)

def water(d,y):
    pts=[];
    for x in range(40,480,10): pts.append((x,y+int(10*math.sin(x/26))))
    d.line(pts,fill=BLUE,width=8)

def rocket(d,cx,cy,s):
    d.rounded_rectangle([cx-24*s,cy-58*s,cx+24*s,cy+48*s],radius=int(18*s),fill=CREAM,outline=(176,166,146,255),width=4)
    d.polygon([(cx-24*s,cy-48*s),(cx,cy-96*s),(cx+24*s,cy-48*s)],fill=RED)
    d.polygon([(cx-24*s,cy+18*s),(cx-48*s,cy+56*s),(cx-24*s,cy+48*s)],fill=RED)
    d.polygon([(cx+24*s,cy+18*s),(cx+48*s,cy+56*s),(cx+24*s,cy+48*s)],fill=RED)
    el(d,cx,cy-22*s,13*s,13*s,BLUE,WHITE,3)
    d.polygon([(cx-15*s,cy+48*s),(cx+15*s,cy+48*s),(cx,cy+92*s)],fill=OCHRE)
    d.polygon([(cx-8*s,cy+48*s),(cx+8*s,cy+48*s),(cx,cy+74*s)],fill=(255,212,120,255))

def vobla(d,cx,cy,s):
    fb=(196,150,90,255); fl=(150,110,60,255)
    d.polygon([(cx+28*s,cy),(cx+54*s,cy-18*s),(cx+54*s,cy+18*s)],fill=fb,outline=fl)
    el(d,cx-4*s,cy,38*s,18*s,fb,fl,3)
    el(d,cx-26*s,cy-4*s,4*s,4*s,DARK)
    d.arc([cx-18*s,cy-14*s,cx-2*s,cy+14*s],300,60,fill=fl,width=3)

def suitcase(d,cx,cy,s):
    br=(150,110,60,255); brd=(110,80,44,255)
    d.rounded_rectangle([cx-18*s,cy-50*s,cx+18*s,cy-32*s],radius=int(8*s),outline=brd,width=6)
    d.rounded_rectangle([cx-48*s,cy-34*s,cx+48*s,cy+40*s],radius=int(12*s),fill=br,outline=brd,width=5)
    d.line([(cx-48*s,cy-2*s),(cx+48*s,cy-2*s)],fill=CREAM,width=6)
    el(d,cx+30*s,cy+12*s,5*s,5*s,SUN)

def plane(d,cx,cy,s):
    d.polygon([(cx-44*s,cy),(cx+30*s,cy-12*s),(cx+44*s,cy-4*s),(cx+30*s,cy+4*s),(cx-44*s,cy+8*s)],fill=CREAM,outline=(176,166,146,255))
    d.polygon([(cx-6*s,cy-4*s),(cx+8*s,cy-30*s),(cx+16*s,cy-2*s)],fill=CREAM,outline=(176,166,146,255))

def sun(d,cx,cy,s):
    for a in range(0,360,30):
        d.line([(cx+int(30*s*math.cos(math.radians(a))),cy+int(30*s*math.sin(math.radians(a)))),
                (cx+int(46*s*math.cos(math.radians(a))),cy+int(46*s*math.sin(math.radians(a))))],fill=SUN,width=6)
    el(d,cx,cy,26*s,26*s,SUN)

def zzz(d,x,y):
    f=ImageFont.truetype(FONT,38); f2=ImageFont.truetype(FONT,28); f3=ImageFont.truetype(FONT,20)
    d.text((x,y),'Z',font=f,fill=OCHRE_D); d.text((x+34,y-26),'Z',font=f2,fill=OCHRE_D); d.text((x+60,y-46),'z',font=f3,fill=OCHRE_D)

def heart(d,cx,cy,s,col=RED_HEART):
    d.pieslice([cx-10*s,cy-9*s,cx,cy+3*s],150,360,fill=col)
    d.pieslice([cx,cy-9*s,cx+10*s,cy+3*s],180,30,fill=col)
    d.polygon([(cx-9*s,cy-1*s),(cx+9*s,cy-1*s),(cx,cy+12*s)],fill=col)

def hand(d,cx,cy,s,up=True):
    el(d,cx,cy,12*s,12*s,SKIN)

# ===== стикеры =====
def s_cheers(d,img):
    body(d,150,300,78,SHIRT_S); body(d,362,300,78,SHIRT_V)
    head(d,150,210,78,'sasha','grin'); head(d,362,210,78,'vitya','grin')
    mug(d,228,250,1.5,hand='r'); mug(d,284,250,1.5,hand='l')
    sparkle(d,256,205,26)

def s_beer(d,img):
    head(d,256,180,92,'vitya','heart')
    heart(d,120,150,2.2); heart(d,400,140,2.6)
    mug(d,256,360,2.6,hand='r')

def s_volga(d,img):
    sun(d,452,70,1)
    head(d,176,236,72,'sasha','cool'); head(d,338,236,72,'vitya','cool')
    boat(d,256,318,1.0)

def s_vobla(d,img):
    body(d,210,310,80,SHIRT_S)
    head(d,210,200,80,'sasha','grin')
    vobla(d,372,250,1.7)

def s_cosmos(d,img):
    rocket(d,165,240,1.5)
    body(d,360,330,72,SHIRT_V); head(d,360,225,72,'vitya','wow')

def s_shrug(d,img):
    body(d,256,330,86,SHIRT_S)
    el(d,150,322,16,16,SKIN); el(d,362,322,16,16,SKIN)
    head(d,256,200,92,'sasha','shrug')

def s_sleep(d,img):
    body(d,256,330,86,SHIRT_V)
    head(d,256,205,90,'vitya','sleep')
    zzz(d,360,150)

def s_poehali(d,img):
    plane(d,400,110,1.3)
    head(d,180,180,72,'sasha','wow'); body(d,180,272,60,SHIRT_S)
    suitcase(d,330,300,1.2)

def s_zozh(d,img):
    body(d,210,310,80,SHIRT_S)
    head(d,210,200,80,'sasha','grin')
    d.rounded_rectangle([210-58,168,210+58,188],radius=10,fill=RED)  # повязка
    mug(d,372,260,1.7,hand='l')

def s_privet(d,img):
    sun(d,256,70,0.9)
    body(d,170,330,72,SHIRT_S); body(d,342,330,72,SHIRT_V)
    head(d,170,230,72,'sasha','smile'); head(d,342,230,72,'vitya','smile')
    el(d,96,250,15,15,SKIN); el(d,416,250,15,15,SKIN)  # машут

def thumbsup(d,cx,cy,s):
    ol=blend(SKIN,DARK,0.18)
    d.rounded_rectangle([cx-15*s,cy-6*s,cx+15*s,cy+24*s],radius=int(8*s),fill=SKIN,outline=ol,width=2)
    d.rounded_rectangle([cx-7*s,cy-28*s,cx+9*s,cy-2*s],radius=int(7*s),fill=SKIN,outline=ol,width=2)
def fire(d,cx,cy,s):
    d.polygon([(cx,cy-42*s),(cx+22*s,cy-2*s),(cx+14*s,cy+24*s),(cx-14*s,cy+24*s),(cx-22*s,cy-2*s)],fill=OCHRE)
    d.polygon([(cx,cy-18*s),(cx+12*s,cy+6*s),(cx+6*s,cy+24*s),(cx-6*s,cy+24*s),(cx-12*s,cy+6*s)],fill=(255,212,120,255))
def qmark(d,cx,cy,s,col=OCHRE_D):
    f=ImageFont.truetype(FONT,int(96*s)); d.text((cx,cy),'?',font=f,fill=col,anchor='mm')

def s_odobr(d,img):
    body(d,210,310,80,SHIRT_V); head(d,210,200,80,'vitya','grin'); thumbsup(d,378,250,1.7)
def s_posle(d,img):
    body(d,256,330,86,SHIRT_V); head(d,256,205,92,'vitya','dizzy')
def s_gde(d,img):
    body(d,200,320,78,SHIRT_S); head(d,200,205,80,'sasha','wow'); qmark(d,378,205,1.3)
def s_eshe(d,img):
    body(d,256,320,84,SHIRT_S); head(d,256,200,86,'sasha','grin'); mug(d,118,300,1.5,hand='r'); mug(d,394,300,1.5,hand='l')
def s_ogon(d,img):
    body(d,256,330,84,SHIRT_V); head(d,256,205,86,'vitya','cool'); fire(d,116,308,1.5); fire(d,396,308,1.5)
def s_ekipazh(d,img):
    body(d,178,330,72,SHIRT_S); body(d,334,330,72,SHIRT_V); head(d,178,225,72,'sasha','smile'); head(d,334,225,72,'vitya','smile'); heart(d,256,176,2.6)
def s_puchkom(d,img):
    body(d,210,310,80,SHIRT_S); head(d,210,200,80,'sasha','wink'); thumbsup(d,378,250,1.7)
def s_romantika(d,img):
    head(d,176,236,70,'sasha','smile'); head(d,338,236,70,'vitya','smile'); heart(d,256,150,2.2); boat(d,256,318,1.0)

os.makedirs(OUT,exist_ok=True)
items=[
 ('01_cheers.png',s_cheers,'ЗА ВОЛГУ!',OCHRE_D),
 ('02_beer.png',s_beer,'ПИВО!',OCHRE_D),
 ('03_volga.png',s_volga,'VOLGA MODE: ON',TEAL),
 ('04_vobla.png',s_vobla,'ВОБЛА',TEAL),
 ('05_cosmos.png',s_cosmos,'КОСМОС',TEAL),
 ('06_netochno.png',s_shrug,'НЕ ТОЧНО',OCHRE_D),
 ('07_sleep.png',s_sleep,'ВСЁ, СПАТЬ',TEAL),
 ('08_poehali.png',s_poehali,'ПОЕХАЛИ!',OCHRE_D),
 ('09_zozh.png',s_zozh,'ЗОЖ ТУР',OCHRE_D),
 ('10_privet.png',s_privet,'ПРИВЕТ ИЗ САМАРЫ',TEAL),
 ('11_odobr.png',s_odobr,'ОДОБРЯЮ',OCHRE_D),
 ('12_posle.png',s_posle,'Я ПОСЛЕ ВОЛГИ',TEAL),
 ('13_gde.png',s_gde,'ГДЕ ПИВО?',OCHRE_D),
 ('14_eshe.png',s_eshe,'ЕЩЁ ПО ОДНОЙ?',OCHRE_D),
 ('15_ogon.png',s_ogon,'ОГОНЬ!',OCHRE_D),
 ('16_ekipazh.png',s_ekipazh,'ЛУЧШИЙ ЭКИПАЖ',TEAL),
 ('17_puchkom.png',s_puchkom,'ВСЁ ПУЧКОМ',TEAL),
 ('18_romantika.png',s_romantika,'РОМАНТИКА',TEAL),
]
for n,fn,cap,col in items: make(n,fn,cap,col)

# превью-сетка
cols=6; rows=3; cell=180; pad=8
sheet=Image.new('RGBA',(cols*cell+pad*(cols+1),rows*cell+pad*(rows+1)),(200,200,200,255))
for i,(n,_,_,_) in enumerate(items):
    im=Image.open(os.path.join(OUT,n)).resize((cell,cell))
    x=pad+(i%cols)*(cell+pad); y=pad+(i//cols)*(cell+pad)
    sheet.alpha_composite(im,(x,y))
sheet.convert('RGB').save('/tmp/sticker_sheet.png')
print('sheet saved')

"""Render the IELTS MAX INTENSIVE login introduction from original UI illustrations.

The drawings use the site's own labels, palette and public study examples. The
soundtrack is synthesized in this file; no audio from the reference is copied.
"""
from __future__ import annotations

import argparse
import math
import os
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H, FPS, DURATION = 1600, 900, 24, 28
INK = (25, 27, 55)
MUTED = (97, 105, 132)
PURPLE = (89, 69, 230)
LILAC = (244, 242, 255)
MINT = (226, 251, 246)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)


def text(d, xy, value, size=20, color=INK, bold=False, anchor=None):
    d.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def rr(d, box, radius, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def brand(d, x, y, scale=1):
    s = scale
    rr(d, (x, y, x + 42*s, y + 42*s), round(11*s), PURPLE)
    d.rounded_rectangle((x+10*s, y+11*s, x+31*s, y+31*s), radius=round(3*s), outline='white', width=round(3*s))
    d.line((x+21*s, y+12*s, x+21*s, y+31*s), fill='white', width=round(2*s))
    if s < .8:
        text(d, (x+55*s, y+6*s), "IELTS MAX", int(19*s), INK, True)
        text(d, (x+55*s, y+23*s), "INTENSIVE", int(16*s), INK, True)
    else:
        text(d, (x+55*s, y+8*s), "IELTS MAX INTENSIVE", int(20*s), INK, True)
        text(d, (x+55*s, y+31*s), "IELTS so‘zlarim", int(10*s), MUTED)


def panel_base(title, selected="Barcha so‘zlar"):
    im = Image.new("RGBA", (850, 560), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    rr(d, (0, 0, 849, 559), 21, "white", (224, 226, 242), 2)
    d.rounded_rectangle((1, 1, 196, 558), 20, fill=(250, 250, 254))
    d.rectangle((177, 1, 197, 558), fill=(250, 250, 254))
    d.line((196, 0, 196, 560), fill=(233, 234, 246), width=2)
    brand(d, 17, 20, .62)
    text(d, (22, 89), "O‘RGANISH", 11, (166, 173, 192), True)
    nav = ["Barcha so‘zlar", "Speaking", "Topiclar", "So‘z qidirish", "Xato daftar", "O‘yinlar", "Grammar", "100 kunlik jurnal"]
    for i, name in enumerate(nav):
        y = 117 + i*48
        if name == selected:
            rr(d, (11, y-4, 186, y+32), 10, (237, 233, 255))
        d.ellipse((25, y+7, 36, y+18), fill=PURPLE if name == selected else (157, 164, 187))
        text(d, (44, y+3), name, 12, PURPLE if name == selected else (87, 96, 125), name == selected)
    d.rectangle((198, 0, 849, 55), fill="white")
    text(d, (224, 18), "SHAXSIY IELTS LUG‘ATXONASI", 11, (103, 91, 169), True)
    rr(d, (697, 12, 828, 42), 14, (248, 249, 253), (226, 230, 239))
    text(d, (714, 20), "⌕  So‘z qidirish", 10, (143, 149, 170))
    d.rectangle((198, 55, 849, 559), fill=(248, 249, 253))
    text(d, (222, 75), title, 25, INK, True)
    return im, d


def stat(d, x, y, big, small, tint):
    rr(d, (x, y, x+183, y+80), 15, "white", (231, 233, 243))
    rr(d, (x+13, y+13, x+45, y+45), 8, tint)
    text(d, (x+57, y+13), big, 22, INK, True)
    text(d, (x+57, y+46), small, 10, MUTED)


def app_panel(kind):
    titles = {
        "overview": ("Barcha so‘zlar", "Barcha so‘zlar"),
        "words": ("Barcha so‘zlar", "Barcha so‘zlar"),
        "cards": ("Flashcardlar", "Barcha so‘zlar"),
        "games": ("O‘yinlar", "O‘yinlar"),
        "speaking": ("Speaking Part 1–3", "Speaking"),
        "grammar": ("Grammar structures", "Grammar"),
        "mistakes": ("Xato daftar", "Xato daftar"),
        "journal": ("100 kunlik jurnal", "100 kunlik jurnal"),
    }
    im, d = panel_base(*titles[kind])
    x = 222
    if kind in ("overview", "words"):
        text(d, (x, 108), "So‘zlarni 30 talik to‘plamlarda o‘rganing.", 12, MUTED)
        stat(d, x, 137, "4 396", "so‘z va ibora", (239, 234, 255))
        stat(d, x+200, 137, "844", "Speaking iboralari", (231, 249, 242))
        stat(d, x+400, 137, "147", "30 talik to‘plam", (255, 245, 226))
        for i in range(6):
            px=x+(i%3)*115; py=238+(i//3)*125
            rr(d, (px, py, px+102, py+109), 13, "white", (226, 228, 241))
            rr(d, (px+11, py+12, px+38, py+39), 6, (238, 233, 255))
            text(d, (px+13, py+17), "▦", 15, PURPLE)
            text(d, (px+11, py+50), f"To‘plam {i+1:02}", 12, INK, True)
            text(d, (px+11, py+74), "30 ta karta", 10, MUTED)
            rr(d, (px+11, py+95, px+87, py+99), 2, (232, 233, 242))
        rr(d, (x+369, 238, 823, 485), 22, (65, 45, 204))
        text(d, (x+397, 270), "INGLIZCHA SO‘Z / IBORA", 12, (199, 188, 255), True)
        text(d, (x+397, 323), "a carefree period", 22, "white", True)
        text(d, (x+397, 357), "of my childhood", 22, "white", True)
        text(d, (x+397, 443), "Bosib tarjimasini ko‘ring  ↗", 11, (218, 210, 255))
        rr(d, (x+372, 501, 822, 538), 10, (240, 237, 255))
        text(d, (x+438, 511), "Shu to‘plamning quizini boshlash →", 12, PURPLE, True)
    elif kind == "cards":
        text(d, (x, 108), "TO‘PLAM 01 · 1 / 30", 12, PURPLE, True)
        rr(d, (x, 140, 806, 411), 23, (70, 48, 211))
        text(d, (x+30, 175), "INGLIZCHA SO‘Z / IBORA", 13, (210, 199, 255), True)
        text(d, (x+30, 230), "a carefree period", 29, "white", True)
        text(d, (x+30, 272), "of my childhood", 29, "white", True)
        text(d, (x+30, 369), "Bosib orqasini ko‘ring  ↗", 12, (211, 204, 255))
        for i, (label, color) in enumerate([("🔊 Talaffuz", (238,234,255)), ("☆ Saqlash", (245,246,252)), ("Aylantirish", (242,239,255))]):
            bx=x+i*194; rr(d, (bx, 433, bx+180, 477), 11, color)
            text(d, (bx+15, 446), label, 13, PURPLE, True)
        rr(d, (x, 495, 806, 538), 11, (230, 249, 240))
        text(d, (x+86, 507), "30 ta so‘zni 7 ta o‘yinda o‘rganish  →", 13, (25, 119, 87), True)
    elif kind == "games":
        text(d, (x, 109), "Tanlangan so‘zlarni 7 turdagi o‘yinda mustahkamlang.", 12, MUTED)
        games = [("Flashcards", "Kartani eslab qoling"), ("Multiple choice", "Javobni tanlang"), ("Matching pairs", "Juftlarni toping"), ("Fill the gap", "Bo‘shliqni to‘ldiring"), ("Word Rush", "Tez javob bering"), ("Typing race", "So‘zni yozing"), ("Sentence builder", "Gap tuzing")]
        colors = [(237,232,255),(230,240,255),(227,250,240),(255,242,225),(255,231,234),(238,233,255),(255,235,246)]
        for i,(title,desc) in enumerate(games):
            col=i%3; row=i//3; px=x+col*198; py=144+row*131
            rr(d, (px,py,px+184,py+117), 16, "white", (230,232,242))
            rr(d, (px+14,py+14,px+51,py+51), 10, colors[i])
            text(d, (px+25,py+22), str(i+1), 14, PURPLE, True)
            text(d, (px+14,py+64), title, 14, INK, True)
            text(d, (px+14,py+89), desc, 10, MUTED)
    elif kind == "speaking":
        text(d, (x, 109), "Part 1   ·   Part 2   ·   Part 3", 13, PURPLE, True)
        rr(d, (x, 146, x+152, 533), 14, "white", (229,231,241))
        text(d, (x+15,166), "Topiclar", 16, INK, True)
        for i, topic in enumerate(["Mirrors", "Work or Studies", "Hometown", "Friends", "Technology", "Travel"]):
            py=205+i*50
            if i==0: rr(d,(x+9,py-5,x+143,py+29),8,(239,235,255))
            text(d,(x+15,py+3),topic,11,PURPLE if i==0 else MUTED,i==0)
        rr(d, (x+169, 146, 822, 533), 14, "white", (229,231,241))
        text(d, (x+187, 167), "Do you often use a mirror?", 20, INK, True)
        rr(d,(x+187,208,x+570,250),10,PURPLE)
        text(d,(x+205,220),"Sample answerni ko‘rish  ↓",13,"white",True)
        text(d,(x+187,274),"Ideas · tabiiy javoblar · kollokatsiyalar",12,MUTED)
        for i,(en,uz) in enumerate([("on a daily basis","har kuni"),("get ready","tayyorlanmoq"),("a quick glance","tez qarash"),("look presentable","ozoda ko‘rinmoq")]):
            py=306+i*47; rr(d,(x+187,py,x+572,py+38),8,(250,249,255),(235,231,249))
            text(d,(x+200,py+10),en,11,INK,True);text(d,(x+412,py+10),uz,10,MUTED)
    elif kind == "grammar":
        text(d, (x, 108), "Strukturalarni misol bilan o‘rganing.", 12, MUTED)
        rr(d,(x,143,x+203,530),14,"white",(229,232,242))
        for i,pattern in enumerate(["What I find ... is ...","Not only ... but also ...","If I had ...","One reason why ...","Having + V3 ..."]):
            py=165+i*70
            if i==0:rr(d,(x+10,py-6,x+191,py+51),9,(239,235,255))
            text(d,(x+18,py),pattern,12,PURPLE if i==0 else INK,i==0)
            text(d,(x+18,py+26),"Grammar structure",10,MUTED)
        rr(d,(x+220,143,822,530),15,"white",(229,232,242))
        rr(d,(x+238,163,x+400,190),13,(239,235,255))
        text(d,(x+250,169),"SPEAKING GRAMMAR",10,PURPLE,True)
        text(d,(x+238,221),"What I find ... is ...",23,INK,True)
        text(d,(x+238,265),"Fikrning asosiy nuqtasini ta’kidlash",12,MUTED)
        rr(d,(x+238,310,x+576,407),11,(247,246,255))
        text(d,(x+255,327),"What I find interesting is",14,INK,True)
        text(d,(x+255,354),"how cities keep changing.",14,INK)
        rr(d,(x+238,444,x+520,491),10,PURPLE)
        text(d,(x+264,458),"7 ta o‘yinda mashq qilish →",12,"white",True)
    elif kind == "mistakes":
        text(d, (x, 108), "Qiyin bo‘lgan so‘z va strukturalarga qayting.", 12, MUTED)
        rr(d,(x,149,x+136,187),17,PURPLE)
        text(d,(x+31,160),"So‘zlar",12,"white",True)
        rr(d,(x+148,149,x+301,187),17,(240,238,253))
        text(d,(x+179,160),"Grammar",12,PURPLE,True)
        for i,(en,desc) in enumerate([("retain information","ma’lumotni eslab qolmoq"),("make steady progress","izchil rivojlanmoq"),("a sense of purpose","aniq maqsad hissi")]):
            py=209+i*99
            rr(d,(x,py,822,py+86),13,"white",(229,232,242))
            rr(d,(x+13,py+14,x+55,py+56),11,(239,235,255))
            text(d,(x+25,py+25),"↺",19,PURPLE,True)
            text(d,(x+72,py+17),en,16,INK,True)
            text(d,(x+72,py+47),desc,12,MUTED)
            text(d,(x+505,py+32),"Qayta o‘rganish →",11,PURPLE,True)
        rr(d,(x,515,822,542),10,(229,250,240))
        text(d,(x+79,522),"Ikki marta to‘g‘ri javob bersangiz ro‘yxatdan chiqadi",10,(28,116,85),True)
    elif kind == "journal":
        text(d, (x, 108), "O‘qish rejangiz va har kunlik natijalar.", 12, MUTED)
        for i in range(28):
            col=i%7;row=i//7;px=x+col*84;py=150+row*82
            active=i<11
            rr(d,(px,py,px+72,py+69),12,(234,230,255) if active else "white",(220,216,249) if active else (232,234,243))
            text(d,(px+12,py+12),f"{i+1:02}",16,PURPLE if active else MUTED,True)
            if active: d.ellipse((px+50,py+48,px+59,py+57),fill=(40,174,132))
        rr(d,(x,494,812,542),11,(230,250,241))
        text(d,(x+21,510),"Kunlik mashqlar · lug‘at · Speaking · Grammar",12,(28,116,85),True)
    return im


SCENES = [
    ("01 / KIRISH", "IELTS so‘zlaringiz", "bir joyda.", "O‘rganish, mashq va natijalar bitta saytda.", "overview", "Reading + Speaking"),
    ("02 / SO‘ZLAR", "4 396 so‘z.", "30 talik to‘plamlar.", "Har bir so‘zga izoh, tarjima va misol.", "words", "147 ta to‘plam"),
    ("03 / FLASHCARDS", "Kartani aylantir.", "Eslab qol.", "Talaffuzni eshitib, o‘zingni sinab ko‘r.", "cards", "30 ta karta"),
    ("04 / O‘YINLAR", "7 xil o‘yin.", "Zerikmasdan mashq qil.", "Quiz, juftlik, gap tuzish va boshqalar.", "games", "7 xil mashq"),
    ("05 / SPEAKING", "Part 1, 2 va 3.", "Tabiiy javoblar.", "Savollar, ideas va foydali kollokatsiyalar.", "speaking", "Sample answers"),
    ("06 / GRAMMAR", "Strukturani bil.", "Gapda ishlat.", "Misollar va o‘yinlar bilan mustahkamla.", "grammar", "Amaliy grammar"),
    ("07 / XATO DAFTAR", "Xatoni ko‘r.", "Qayta o‘rgan.", "So‘zlar va grammarga alohida qayt.", "mistakes", "Shaxsiy takrorlash"),
    ("08 / 100 KUN", "Rejani tuz.", "O‘sishni kuzat.", "100 kunlik jurnal bilan izchil davom et.", "journal", "Har kuni bir qadam"),
    ("09 / BOSHLASH", "IELTS MAX", "INTENSIVE.", "Har kuni bir qadam. Bugun boshlang.", "outro", "Boshlash →"),
]


def make_background():
    yy, xx = np.mgrid[0:H, 0:W]
    base = np.empty((H, W, 3), dtype=np.float32)
    base[:] = [249, 250, 253]
    purple = np.exp(-(((xx-1400)/620)**2 + ((yy-80)/520)**2)*1.7)[...,None]
    mint = np.exp(-(((xx-45)/630)**2 + ((yy-820)/520)**2)*1.7)[...,None]
    base += purple*np.array([[-4,-7,2]])
    base += mint*np.array([[-14,3,-6]])
    return Image.fromarray(np.uint8(np.clip(base, 0, 255)), 'RGB')


def prep_panel(kind):
    screen = app_panel(kind)
    screen = screen.rotate(2.2, resample=Image.Resampling.BICUBIC, expand=True)
    shadow = Image.new('RGBA', screen.size, (28, 22, 69, 0))
    shadow.putalpha(screen.getchannel('A').filter(ImageFilter.GaussianBlur(27)).point(lambda v: int(v*.20)))
    return screen, shadow


def ease(u):
    u = max(0., min(1., u))
    return 1 - (1-u)**3


def scene_frame(idx, local, background, panels):
    im = background.copy().convert('RGBA')
    d = ImageDraw.Draw(im)
    # Calm details echo the reference without duplicating its art or footage.
    d.ellipse((1330, 20, 1835, 525), outline=(234, 231, 254), width=2)
    d.ellipse((1380, 70, 1785, 475), outline=(238, 235, 255), width=2)
    for gx in range(12, 1650, 48):
        for gy in range(610, 910, 48):
            d.ellipse((gx,gy,gx+2,gy+2),fill=(232,232,244))
    brand(d, 50, 42)
    text(d, (1455, 53), f"{idx+1:02} / 09", 16, MUTED, True)
    d.line((0, 843, W, 843), fill=(230, 231, 241), width=2)
    d.line((0, 843, int(W*(idx+min(local/(DURATION/9),1))/9), 843), fill=PURPLE, width=5)
    text(d, (50, 858), "IELTS MAX INTENSIVE  /  IELTS SO‘ZLARIM", 13, (117, 123, 148), True)
    over, a, b, detail, kind, badge = SCENES[idx]
    slide = int((1-ease(local/.7))*-65)
    rr(d, (105+slide, 219, 105+slide+max(180,len(over)*11), 254), 17, PURPLE)
    text(d, (124+slide, 229), over, 14, "white", True)
    text(d, (103+slide, 309), a, 58, INK, True)
    text(d, (103+slide, 391), b, 53, PURPLE, True)
    d.line((105+slide, 488, 315+slide, 488), fill=(57, 192, 172), width=5)
    text(d, (105+slide, 518), detail, 19, MUTED)
    if kind != 'outro':
        panel, shadow = panels[kind]
        float_y = int(math.sin(local*1.6)*7)
        x = 714 + int((1-ease(local/.85))*115)
        y = 154 + float_y
        im.alpha_composite(shadow, (x+15,y+34))
        im.alpha_composite(panel, (x,y))
        d = ImageDraw.Draw(im)
        rr(d, (1173, 677+float_y, 1500, 737+float_y), 16, 'white', (229, 230, 244))
        rr(d, (1187, 690+float_y, 1222, 724+float_y), 10, (233, 250, 245))
        text(d, (1197, 695+float_y), "✓", 18, (43, 156, 116), True)
        text(d, (1233, 697+float_y), badge, 14, INK, True)
    else:
        # A simple closing invitation; the actual login form remains beside the video.
        rr(d, (825, 205, 1450, 674), 30, 'white', (226, 225, 245), 2)
        brand(d, 880, 258, 1.6)
        text(d, (880, 402), "Bugun bir qadam.", 42, INK, True)
        text(d, (880, 468), "Ertaga yanada osonroq.", 24, MUTED)
        rr(d, (880, 557, 1180, 621), 16, PURPLE)
        text(d, (941, 576), "O‘rganishni boshlash  →", 17, "white", True)
    return im.convert('RGB')


def make_music(path):
    rate = 32000
    n = rate*DURATION
    t = np.arange(n, dtype=np.float32)/rate
    sound = np.zeros(n, dtype=np.float32)
    # Warm, original synthesizer chords and sparse bell notes.
    chords = [(220, 261.63, 329.63), (174.61, 220, 261.63), (196, 246.94, 293.66), (164.81, 196, 246.94)]
    span = DURATION/9
    for j in range(9):
        left = int(j*span*rate); right = min(n,int((j+1)*span*rate))
        tt = t[left:right]-j*span
        envelope = np.minimum(1,tt/.38)*np.minimum(1,(span-tt)/.42)
        for f in chords[j%len(chords)]:
            sound[left:right] += .032*envelope*(np.sin(2*np.pi*f*tt) + .25*np.sin(2*np.pi*2*f*tt))
        for k in range(6):
            start = left + int((.2+k*.48)*rate)
            end = min(n,start+int(.46*rate))
            if end<=start: continue
            bt = np.arange(end-start,dtype=np.float32)/rate
            frequency=chords[j%len(chords)][k%3]*2
            sound[start:end] += .09*np.exp(-bt*10)*(np.sin(2*np.pi*frequency*bt)+.28*np.sin(2*np.pi*2*frequency*bt))
    for j in range(1,9):
        start=int(j*span*rate); end=min(n,start+int(.32*rate))
        tt=np.arange(end-start,dtype=np.float32)/rate
        rng=np.random.default_rng(200+j)
        noise=rng.normal(size=len(tt)).astype(np.float32)
        smooth=np.convolve(noise,np.ones(10)/10,mode='same')
        sound[start:end]+=.04*np.exp(-tt*14)*smooth
    sound*=np.minimum(1,t/.5)*np.minimum(1,(DURATION-t)/.75)
    sound=np.clip(sound,-.75,.75)
    with wave.open(str(path),'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
        wav.writeframes((sound*32767).astype('<i2').tobytes())


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--preview',action='store_true')
    parser.add_argument('--output',type=Path,default=ROOT/'dist'/'intro-ielts-max-v1.mp4')
    parser.add_argument('--poster',type=Path,default=ROOT/'dist'/'intro-ielts-max-poster.jpg')
    args=parser.parse_args()
    background=make_background()
    panels={kind:prep_panel(kind) for kind in {scene[4] for scene in SCENES if scene[4]!='outro'}}
    args.poster.parent.mkdir(parents=True,exist_ok=True)
    scene_frame(0, 1.5, background, panels).resize((1280,720), Image.Resampling.LANCZOS).save(args.poster, quality=88)
    span=DURATION/len(SCENES)
    if args.preview:
        thumbs=[]
        for i in range(len(SCENES)):
            frame=scene_frame(i,1.5,background,panels)
            thumbs.append(frame.resize((640,360),Image.Resampling.LANCZOS))
        contact=Image.new('RGB',(1920,1080),'white')
        for i,thumb in enumerate(thumbs):contact.paste(thumb,((i%3)*640,(i//3)*360))
        args.output.parent.mkdir(parents=True,exist_ok=True)
        contact.save(args.output.with_suffix('.jpg'),quality=92)
        print(args.output.with_suffix('.jpg'))
        return
    args.output.parent.mkdir(parents=True,exist_ok=True)
    audio=args.output.with_suffix('.wav')
    make_music(audio)
    command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(audio),'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','144k','-movflags','+faststart','-shortest',str(args.output)]
    encoder=subprocess.Popen(command,stdin=subprocess.PIPE)
    try:
        for frame_index in range(DURATION*FPS):
            current=frame_index/FPS
            i=min(8,int(current/span));local=current-i*span
            image=scene_frame(i,local,background,panels)
            if i<8 and local>span-.34:
                nxt=scene_frame(i+1,local-(span-.34),background,panels)
                image=Image.blend(image,nxt,(local-(span-.34))/.34)
            encoder.stdin.write(image.tobytes())
            if frame_index%120==0:print(f"{current:.0f}/{DURATION} s",flush=True)
    finally:
        encoder.stdin.close()
    if encoder.wait()!=0:raise RuntimeError('Video encoding failed')
    audio.unlink(missing_ok=True)
    print(args.output)


if __name__=='__main__':main()

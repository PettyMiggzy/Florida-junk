#!/usr/bin/env python3
"""Generates /services/*, /areas/* pages, sitemap.xml and robots.txt. Run: python3 scripts/build_seo.py"""
import json, os, datetime, html
from seo_data import *
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = datetime.date.today().isoformat()
e = html.escape
OG = f"{SITE}/assets/og-image.jpg"

def write(path, content):
    full = os.path.join(ROOT, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)

def ld(obj): return f'<script type="application/ld+json">{json.dumps(obj, ensure_ascii=False)}</script>'
def business_ref(): return {"@id": f"{SITE}/#business"}

def head(title, desc, path, extra=""):
    url = f"{SITE}{path}"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#050505">
<meta property="og:type" content="website"><meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{OG}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{OG}">
<link rel="icon" type="image/png" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
{extra}
</head>'''

def nav():
    return f'''<div class="bar"><span>🟢 Serving Haines City &amp; Central Florida</span><a href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a></div>
<header class="nav" id="nav">
  <a class="brand" href="/"><img src="/assets/logo-640.png" alt="{BRAND} logo" width="62" height="62"><span>JUNK JUNKIES <b>FLORIDA</b></span></a>
  <nav id="menu"><a href="/#services">Services</a><a href="/#why">Why Us</a><a href="/#how">Process</a><a href="/#areas">Areas</a><a href="/#faq">FAQ</a></nav>
  <a class="btn sm" href="#quote">Free Quote</a>
  <button class="burger" id="burger" aria-label="Menu"><i></i><i></i><i></i></button>
</header>'''

def footer():
    sv = "".join(f'<a href="/services/{s["slug"]}/">{e(s["name"])}</a>' for s in SERVICES)
    ar = "".join(f'<a href="/areas/{c["slug"]}/">Junk Removal {e(c["name"])}</a>' for c in CITIES)
    return f'''<footer class="foot">
  <div class="fcols">
    <div><img src="/assets/logo-640.png" alt="" width="120" height="120" loading="lazy"><h4>{BRAND}</h4><p>Residential &amp; Commercial Junk Removal</p><p>180 Dyson Rd, Haines City, FL 33844</p><p><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></p><p><a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
    <div><h5>Services</h5>{sv}</div>
    <div><h5>Service Areas</h5>{ar}</div>
  </div>
  <p class="mut copy">© <span id="y"></span> {BRAND} · <a href="/">Home</a> · Also serving Central Indiana: <a href="https://junkjunkiesindiana.com/">Junk Removal Indianapolis, IN</a> · <a href="/admin/">Staff</a></p>
</footer>
<a class="sticky" href="tel:{PHONE_TEL}">📞 Call {PHONE_DISPLAY}</a>
<script src="/main.js"></script>
</body></html>'''

def hero_form(pre=""):
    opts = "".join(f'<option{" selected" if s["name"]==pre else ""}>{e(s["name"])}</option>' for s in SERVICES)
    return f'''<div id="quote" class="herof"><h3>Get your free quote in minutes</h3><p class="hfs">Tell us what you need. We reach out fast with a flat price.</p>
  <form class="leadform" novalidate>
    <input type="text" name="company" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input name="name" required autocomplete="name" placeholder="Your name" aria-label="Your name">
    <input name="phone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="Phone number" aria-label="Phone number">
    <div class="row"><input name="city" required placeholder="City / ZIP" aria-label="City or ZIP"><select name="service" aria-label="Service needed"><option value="">Service needed</option>{opts}</select></div>
    <button class="btn" type="submit">Get My Free Quote</button><p class="fmsg" role="status"></p>
  </form><p class="hfo">or call / text <a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></p></div>'''

def form(pre=""):
    opts = "".join(f'<option{" selected" if s["name"]==pre else ""}>{e(s["name"])}</option>' for s in SERVICES)
    return f'''<section id="quote-more" class="sec dark quote"><div class="quote-wrap">
  <div><p class="eyebrow">Free quote</p><h2>Get a <em>flat price</em></h2><p class="lead">Tell us what you need hauled. We reach out fast with an upfront quote.</p><a class="bigphone" href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></div>
  <form id="lead" class="leadform" novalidate>
    <input type="text" name="company" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="row"><label>Name<input name="name" required autocomplete="name"></label><label>Phone<input name="phone" type="tel" required autocomplete="tel"></label></div>
    <div class="row"><label>Email (optional)<input name="email" type="email" autocomplete="email"></label><label>City / ZIP<input name="city" required></label></div>
    <div class="row"><label>Service<select name="service" id="svc"><option value="">Select a service…</option>{opts}</select></label><label>Timing<select name="timing"><option>ASAP / Same day</option><option>This week</option><option>Flexible</option></select></label></div>
    <label>What needs to go?<textarea name="details" rows="4" required placeholder="Describe the items or space…"></textarea></label>
    <button class="btn" type="submit">Send My Request</button><p id="msg" class="fmsg" role="status"></p>
  </form></div></section>'''

def faq_html(faqs):
    return '<div class="faq">' + "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faqs) + '</div>'
def faq_ld(faqs):
    return ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})
def crumbs_ld(items):
    return ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":SITE+u} for i,(n,u) in enumerate(items)]})
def crumbs_html(items):
    return '<nav class="crumbs" aria-label="Breadcrumb">' + " › ".join(f'<a href="{u}">{e(n)}</a>' if i < len(items)-1 else f'<span>{e(n)}</span>' for i,(n,u) in enumerate(items)) + '</nav>'

def service_page(s):
    path = f"/services/{s['slug']}/"
    title = f"{s['name']} in Haines City | {BRAND}"
    desc = f"{s['name']} in Haines City, Davenport, Winter Haven, Lakeland & Central Florida. {s['blurb']} Flat upfront pricing — call {PHONE_DISPLAY}."
    items = [("Home","/"),("Services","/#services"),(s["name"],path)]
    sd = ld({"@context":"https://schema.org","@type":"Service","name":s["name"],"serviceType":s["name"],"description":s["intro"],"url":SITE+path,
             "provider":business_ref(),"areaServed":[{"@type":"City","name":c["name"]} for c in CITIES],"image":f"{SITE}/assets/{s['img']}.jpg"})
    others = "".join(f'<a href="/services/{o["slug"]}/">{e(o["name"])}</a>' for o in SERVICES if o["slug"] != s["slug"])
    cities = "".join(f'<a href="/areas/{c["slug"]}/">{e(s["name"])} in {e(c["name"])}</a>' for c in CITIES)
    body = f'''<body>
{nav()}
<main>
<section class="pg-hero"><div class="pg-in">
  {crumbs_html(items)}
  <p class="kicker"><i></i> Junk Junkies Florida · Haines City, FL</p>
  <h1>{e(s["name"])} <span>in Haines City &amp; Central Florida</span></h1>
  <p class="sub">{e(s["intro"])}</p>
  <div class="cta"><a class="btn" href="#quote">Get a Free Quote</a><a class="btn ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a></div>
</div>{hero_form(s["name"])}</section>

<section class="sec"><div class="prose">
  <img class="pg-img" src="/assets/{s["img"]}.jpg" alt="{e(s["name"])} by Junk Junkies Florida in Central Florida" width="800" height="450" loading="lazy">
  <h2>What our {e(s["name"].lower())} service covers</h2>
  <ul class="ticks">{"".join(f"<li>{e(t)}</li>" for t in s["takes"])}</ul>
  <h2>How it works and what it costs</h2>
  <p>{e(s["how"])}</p>
  <p>Ready to get started? Use the quote form below or call <a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a>. We serve Haines City, Davenport, Winter Haven, Lakeland, Kissimmee, Poinciana, Auburndale, Orlando and Tampa.</p>
</div></section>

<section class="sec dark"><div class="prose"><h2>{e(s["name"])} FAQs</h2>{faq_html(s["faqs"])}</div></section>

<section class="sec"><div class="prose"><h2>{e(s["name"])} near you</h2><div class="linkgrid">{cities}</div>
<h2>Other junk removal services</h2><div class="linkgrid">{others}</div></div></section>
{form(s["name"])}
</main>
{footer()}'''
    write(f"services/{s['slug']}/index.html", head(title, desc, path, sd + crumbs_ld(items) + faq_ld(s["faqs"])) + body)

def city_faqs(c):
    n = c["name"]
    return [
     (f"How much does junk removal cost in {n}?", f"Pricing depends on how much space your items take in our truck and the labor involved. We give a flat, upfront quote before we load anything, so there are no surprises. Submit the form or call {PHONE_DISPLAY} for a quote."),
     (f"Do you offer same-day junk removal in {n}?", "We often have same-day or next-day availability depending on our schedule. Tell us how soon you need it and we will do our best to fit you in."),
     (f"What can you haul away in {n}?", "Furniture, appliances, mattresses, yard waste, construction debris, garage and estate cleanouts, hot tubs, sheds and commercial junk. We cannot take hazardous materials such as asbestos or chemicals."),
    ]

def city_page(c):
    n = c["name"]; path = f"/areas/{c['slug']}/"
    title = f"Junk Removal in {n}, FL | {BRAND}"
    desc = f"Junk removal in {n}, FL — furniture, appliances, cleanouts, yard waste & more. Flat upfront pricing from a local Central Florida crew. Call {PHONE_DISPLAY}."
    items = [("Home","/"),("Service Areas","/#areas"),(f"Junk Removal {n}",path)]
    faqs = city_faqs(c)
    sd = ld({"@context":"https://schema.org","@type":"Service","name":f"Junk Removal in {n}, FL","serviceType":"Junk removal","url":SITE+path,
             "provider":business_ref(),"areaServed":{"@type":"City","name":n,"containedInPlace":{"@type":"State","name":"Florida"}},"description":c["intro"]})
    svc = "".join(f'<a href="/services/{s["slug"]}/">{e(s["name"])} in {e(n)}</a>' for s in SERVICES)
    near = "".join(f'<a href="/areas/{x.lower().replace(" ","-")}/">Junk Removal {e(x)}</a>' for x in c["nearby"])
    hq = f"<p>Our shop is at <strong>180 Dyson Rd, Haines City, FL 33844</strong>.</p>" if c.get("hq") else f"<p>We are based at 180 Dyson Rd in Haines City and travel to {e(n)} ({e(c['county'])}) for jobs of every size.</p>"
    body = f'''<body>
{nav()}
<main>
<section class="pg-hero"><div class="pg-in">
  {crumbs_html(items)}
  <p class="kicker"><i></i> {e(c["county"])} · Florida</p>
  <h1>Junk Removal <span>in {e(n)}, FL</span></h1>
  <p class="sub">{e(c["intro"])}</p>
  <div class="cta"><a class="btn" href="#quote">Get a Free Quote</a><a class="btn ghost" href="tel:{PHONE_TEL}">Call {PHONE_DISPLAY}</a></div>
</div>{hero_form()}</section>

<section class="sec"><div class="prose">
  <img class="pg-img" src="/assets/truck-branded.jpg" alt="Junk Junkies Florida junk removal truck serving {e(n)}, FL" width="1280" height="960" loading="lazy">
  <h2>{e(n)} junk removal you can count on</h2>
  <p>{e(c["local"])}</p>
  {hq}
  <h2>Services in {e(n)}</h2>
  <div class="linkgrid">{svc}</div>
</div></section>

<section class="sec dark"><div class="prose"><h2>Junk removal in {e(n)} — FAQs</h2>{faq_html(faqs)}</div></section>

<section class="sec"><div class="prose"><h2>Also serving nearby</h2><div class="linkgrid">{near}</div></div></section>
{form()}
</main>
{footer()}'''
    write(f"areas/{c['slug']}/index.html", head(title, desc, path, sd + crumbs_ld(items) + faq_ld(faqs)) + body)

for s in SERVICES: service_page(s)
for c in CITIES: city_page(c)

urls = [("/", "1.0")] + [(f"/areas/{c['slug']}/", "0.9") for c in CITIES] + [(f"/services/{s['slug']}/", "0.8") for s in SERVICES]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>{p}</priority></url>\n" for u, p in urls) + "</urlset>\n")
write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")
print(len(SERVICES), "service pages,", len(CITIES), "city pages,", len(urls), "sitemap urls")

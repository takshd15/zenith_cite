"""Apply the shared bilingual layout to every page: canonical + hreflang tags, NL/EN switcher and footer.

Run from the project root after adding or moving a page:  python scripts/i18n_layout.py
Dutch is the default (site root); English lives under /en/. Route pairs come from i18n_routes.py.
"""
import io, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from i18n_routes import ORIGIN, EN_TO_NL, NL_TO_EN

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKING = {'/boeken/', '/en/book/'}

FOOTER = {
    'nl': {
        'summary': 'Zenith Cite is een geo bureau voor AI-zichtbaarheid. We doen AI-zichtbaarheid audits, generative engine optimisation (GEO), AI SEO, optimalisatie voor ChatGPT en Perplexity, white-label GEO en doorlopende metingen voor bedrijven in de hele EU, in het Nederlands en Engels.',
        'cols': [
            ('Diensten', [('/ai-zichtbaarheid-audit/', 'AI-zichtbaarheid audit'), ('/geo-diensten/', 'GEO-diensten'), ('/ai-zoekoptimalisatie/', 'AI-zoekoptimalisatie'), ('/ai-vindbaarheid/', 'AI-vindbaarheid'), ('/chatgpt-vindbaarheid/', 'ChatGPT-vindbaarheid'), ('/perplexity-optimalisatie/', 'Perplexity-optimalisatie'), ('/white-label/', 'White-label GEO'), ('/boeken/?interest=custom', 'Offerte op maat')]),
            ('Branches', [('/branches/tandartsen/', 'Tandartspraktijken'), ('/branches/advocatenkantoren/', 'Advocatenkantoren'), ('/branches/makelaars/', 'Makelaars'), ('/branches/e-commerce/', 'E-commerce'), ('/branches/saas/', 'SaaS'), ('/branches/', 'Alle branches')]),
            ('Ontdek', [('/over-ons/', 'Over Zenith Cite'), ('/#pricing', 'Pakketten en prijzen'), ('/europa/', 'Werken in de hele EU'), ('/kennisbank/', 'Kennisbank'), ('/#faqs', 'Veelgestelde vragen'), ('/boeken/', 'Gratis snapshot')]),
        ],
        'bottom': '© 2026 Zenith Cite · Resultaten in zoekmachines en AI-antwoorden zijn niet gegarandeerd.',
        'legal': [('/privacybeleid/', 'Privacybeleid'), ('/voorwaarden/', 'Voorwaarden')],
        'cookies': 'Cookie-instellingen',
        'legal_label': 'Juridisch',
    },
    'en': {
        'summary': 'Zenith Cite is an AI visibility agency offering AI visibility audits, generative engine optimisation (GEO), AI SEO, ChatGPT and Perplexity optimisation, white-label GEO and ongoing measurement for businesses across the EU, in English and Dutch.',
        'cols': [
            ('Services', [('/en/ai-visibility-audit/', 'AI visibility audit'), ('/en/generative-engine-optimisation/', 'GEO services'), ('/en/ai-seo/', 'AI SEO'), ('/en/ai-findability/', 'AI findability'), ('/en/chatgpt-visibility/', 'Visibility in ChatGPT'), ('/en/perplexity-optimization/', 'Perplexity optimization'), ('/en/white-label-geo/', 'White-label GEO'), ('/en/book/?interest=custom', 'Custom quote')]),
            ('Industries', [('/en/industries/dental-clinics/', 'Dental clinics'), ('/en/industries/law-firms/', 'Law firms'), ('/en/industries/real-estate/', 'Real estate'), ('/en/industries/ecommerce/', 'E-commerce'), ('/en/industries/saas/', 'SaaS'), ('/en/industries/', 'All industries')]),
            ('Explore', [('/en/about/', 'About Zenith Cite'), ('/en/#pricing', 'Packages and pricing'), ('/en/europe/', 'Working across the EU'), ('/en/insights/', 'Insights and guides'), ('/en/#faqs', 'FAQ'), ('/en/book/', 'Free visibility snapshot')]),
        ],
        'bottom': '© 2026 Zenith Cite · Search and AI visibility outcomes are not guaranteed.',
        'legal': [('/en/privacy/', 'Privacy policy'), ('/en/terms/', 'Website terms')],
        'cookies': 'Cookie settings',
        'legal_label': 'Legal',
    },
}


def route_of(path):
    rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
    return '/' if rel == 'index.html' else '/' + rel[:-len('index.html')]


def pair(route):
    if route.startswith('/en/') or route == '/en/':
        return 'en', route, EN_TO_NL[route]
    return 'nl', route, NL_TO_EN[route]


def switcher(lang, nl, en):
    cur = {'nl': ' aria-current="true"', 'en': ''} if lang == 'nl' else {'nl': '', 'en': ' aria-current="true"'}
    return (f'<div class="lang-switch" role="group" aria-label="Taal / Language">'
            f'<a href="{nl}" hreflang="nl" lang="nl"{cur["nl"]}>NL</a>'
            f'<a href="{en}" hreflang="en" lang="en"{cur["en"]}>EN</a></div>')


def footer(lang, route, nl, en):
    f = FOOTER[lang]
    legal = ''.join(f'<a href="{h}">{t}</a>' for h, t in f['legal']) + f'<a href="#" data-cookie-settings>{f["cookies"]}</a>'
    if route in BOOKING:
        return (f'<footer class="site-footer site-footer-slim"><div class="site-footer-bottom"><span>© 2026 Zenith Cite · '
                f'<a href="mailto:takshdange@gmail.com">takshdange@gmail.com</a></span><nav class="site-footer-legal" aria-label="{f["legal_label"]}">'
                f'<a href="{"/" if lang == "nl" else "/en/"}">Home</a>{legal}</nav></div></footer>')
    cols = ''.join(
        f'\n        <nav class="site-footer-col" aria-label="{title}"><h2>{title}</h2><ul>' + ''.join(f'<li><a href="{h}">{t}</a></li>' for h, t in links) + '</ul></nav>'
        for title, links in f['cols'])
    home = '/' if lang == 'nl' else '/en/'
    return (f'<footer class="site-footer">\n      <div class="site-footer-top">\n'
            f'        <div class="site-footer-brand"><a class="site-footer-logo" href="{home}">zenith cite</a><p>{f["summary"]}</p>'
            f'<a class="site-footer-email" href="mailto:takshdange@gmail.com">takshdange@gmail.com</a>{switcher(lang, nl, en)}</div>{cols}\n      </div>\n'
            f'      <div class="site-footer-bottom"><span>{f["bottom"]}</span><nav class="site-footer-legal" aria-label="{f["legal_label"]}">{legal}</nav></div>\n    </footer>')


def process(path):
    s = io.open(path, encoding='utf-8').read()
    route = route_of(path)
    lang, here, other = pair(route)
    nl, en = (here, other) if lang == 'nl' else (other, here)

    s = re.sub(r'<html lang="[^"]*">', f'<html lang="{"nl" if lang == "nl" else "en-GB"}">', s, count=1)
    s = re.sub(r'<meta property="og:locale" content="[^"]*">', f'<meta property="og:locale" content="{"nl_NL" if lang == "nl" else "en_GB"}">', s, count=1)
    s = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{ORIGIN}{route}">', s, count=1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{ORIGIN}{route}">', s, count=1)
    s = re.sub(r'\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">', '', s)
    alt = (f'\n  <link rel="alternate" hreflang="nl" href="{ORIGIN}{nl}">\n  <link rel="alternate" hreflang="en" href="{ORIGIN}{en}">'
           f'\n  <link rel="alternate" hreflang="x-default" href="{ORIGIN}{nl}">')
    s = re.sub(r'(<link rel="canonical" href="[^"]*">)', lambda m: m.group(1) + alt, s, count=1)

    # Header switcher: remove any previous one / old "English" nav link, then insert.
    s = re.sub(r'<div class="nav-end">(.*?)</div><!--/nav-end-->', r'\1', s, flags=re.S)
    s = re.sub(r'<div class="lang-switch"[^>]*>.*?</div>', '', s, flags=re.S)
    s = re.sub(r'<a href="[^"]*" hreflang="en" lang="en">English</a>', '', s)
    sw = switcher(lang, nl, en)
    if 'data-booking-cta="navigation"' in s:  # homepages
        s = re.sub(r'(<a class="button" href="[^"]*" data-booking-cta="navigation">.*?</a>)', lambda m: f'<div class="nav-end">{sw}{m.group(1)}</div><!--/nav-end-->', s, count=1, flags=re.S)
    elif '<a class="back"' in s:  # booking pages
        s = re.sub(r'(<a class="back" href="[^"]*">[^<]*</a>)', lambda m: f'<div class="nav-end">{sw}{m.group(1)}</div><!--/nav-end-->', s, count=1)
    else:  # content pages: inside .nav-links, before the CTA button
        s = re.sub(r'(<div class="nav-links">.*?)(<a class="button")', lambda m: m.group(1) + sw + m.group(2), s, count=1, flags=re.S)
    # Footer (the in-footer switcher was removed above with the header one, so rebuild)
    s = re.sub(r'<footer\b.*?</footer>', lambda m: footer(lang, route, nl, en), s, count=1, flags=re.S)
    io.open(path, 'w', encoding='utf-8', newline='\n').write(s)
    return route


if __name__ == '__main__':
    pages = []
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '.vercel', 'api', 'lib', 'db', 'scripts', 'assets')]
        if 'index.html' in files:
            pages.append(os.path.join(dirpath, 'index.html'))
    for p in sorted(pages):
        print(process(p))

"""English <-> Dutch route pairs. Dutch is the default language at the site root; English lives under /en/.

Used by the one-off migration scripts and kept as the reference for adding new page pairs.
"""

ORIGIN = 'https://zenith-cite.com'

# (old English path before the move, new English path, Dutch path)
PAIRS = [
    ('/', '/en/', '/'),
    ('/about/', '/en/about/', '/over-ons/'),
    ('/ai-visibility-audit/', '/en/ai-visibility-audit/', '/ai-zichtbaarheid-audit/'),
    ('/generative-engine-optimisation/', '/en/generative-engine-optimisation/', '/geo-diensten/'),
    ('/ai-seo/', '/en/ai-seo/', '/ai-zoekoptimalisatie/'),
    ('/ai-findability/', '/en/ai-findability/', '/ai-vindbaarheid/'),
    ('/chatgpt-visibility/', '/en/chatgpt-visibility/', '/chatgpt-vindbaarheid/'),
    ('/perplexity-optimization/', '/en/perplexity-optimization/', '/perplexity-optimalisatie/'),
    ('/white-label-geo/', '/en/white-label-geo/', '/white-label/'),
    ('/europe/', '/en/europe/', '/europa/'),
    ('/industries/', '/en/industries/', '/branches/'),
    ('/industries/dental-clinics/', '/en/industries/dental-clinics/', '/branches/tandartsen/'),
    ('/industries/law-firms/', '/en/industries/law-firms/', '/branches/advocatenkantoren/'),
    ('/industries/real-estate/', '/en/industries/real-estate/', '/branches/makelaars/'),
    ('/industries/ecommerce/', '/en/industries/ecommerce/', '/branches/e-commerce/'),
    ('/industries/saas/', '/en/industries/saas/', '/branches/saas/'),
    ('/insights/', '/en/insights/', '/kennisbank/'),
    ('/insights/check-business-in-chatgpt/', '/en/insights/check-business-in-chatgpt/', '/kennisbank/bedrijf-controleren-in-chatgpt/'),
    ('/insights/geo-and-seo-measurement/', '/en/insights/geo-and-seo-measurement/', '/kennisbank/geo-en-seo-meten/'),
    ('/insights/what-an-ai-visibility-audit-includes/', '/en/insights/what-an-ai-visibility-audit-includes/', '/kennisbank/wat-een-ai-zichtbaarheid-audit-omvat/'),
    ('/insights/why-chatgpt-recommends-your-competitor/', '/en/insights/why-chatgpt-recommends-your-competitor/', '/kennisbank/waarom-chatgpt-je-concurrent-aanbeveelt/'),
    ('/book/', '/en/book/', '/boeken/'),
    ('/privacy/', '/en/privacy/', '/privacybeleid/'),
    ('/terms/', '/en/terms/', '/voorwaarden/'),
]

# Dutch pages that existed under /nl/ before Dutch became the default.
OLD_NL = {
    '/nl/': '/',
    '/nl/geo-diensten/': '/geo-diensten/',
    '/nl/ai-zichtbaarheid-audit/': '/ai-zichtbaarheid-audit/',
    '/nl/ai-zoekoptimalisatie/': '/ai-zoekoptimalisatie/',
    '/nl/ai-vindbaarheid/': '/ai-vindbaarheid/',
    '/nl/chatgpt-vindbaarheid/': '/chatgpt-vindbaarheid/',
    '/nl/boeken/': '/boeken/',
}

OLD_EN_TO_EN = {old: en for old, en, _ in PAIRS}
EN_TO_NL = {en: nl for _, en, nl in PAIRS}
NL_TO_EN = {nl: en for _, en, nl in PAIRS}


def split(href):
    """Split '/path/?q#h' into ('/path/', '?q#h')."""
    for i, ch in enumerate(href):
        if ch in '?#':
            return href[:i], href[i:]
    return href, ''

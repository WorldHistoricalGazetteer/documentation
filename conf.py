# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'World Historical Gazetteer'
copyright = '2024, World Historical Gazetteer'
author = 'Stephen Gadd'
release = '3.1'

extensions = [
    'myst_parser', 
    'sphinx_panels', 
    'sphinx_copybutton', 
    'sphinx.ext.autodoc', 
    'sphinx.ext.napoleon',
]

myst_enable_extensions = [
    "amsmath",         # for math support
    "colon_fence",     # for colon-fenced code blocks
    "deflist",         # for definition lists
    "html_admonition", # for HTML-style admonitions
    "html_image",      # for <img> tags
    "replacements",    # for simple text replacements
    "smartquotes",     # for smart quotes
    "substitution",    # for substitution definitions
    "tasklist",        # for GitHub-style task lists
]

# Allow parsing of standard Markdown headers (#, ##, etc.)
myst_heading_anchors = 5

# Automatically number figures, tables, code-blocks
numfig = True

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

html_theme = 'furo'
html_theme_options = {
    "navigation_with_keys": True,
    "source_repository": "https://github.com/WorldHistoricalGazetteer/documentation/",
    "source_branch": "main",
}
html_title = """
<span style="display: flex; flex-direction: column; align-items: center; text-align: center;">
    <span style="font-size: 0.6em; color: #666; margin-bottom: 0.5em;">Documentation for</span>
    World Historical Gazetteer
    <img src="https://img.shields.io/github/v/release/WorldHistoricalGazetteer/website?display_name=tag&color=success" 
         alt="Latest Release" style="margin-top: 0.5em;">
</span>
"""
html_baseurl = "https://whgazetteer.org/"
html_static_path = ['_static']
html_favicon = '_static/favicon.ico'
html_logo = "_static/whg_logo.png"
html_css_files = [
    'css/custom.css',
]

# Plausible Analytics tracking
PLAUSIBLE_DOMAIN = "whgazetteer.org"
PLAUSIBLE_BASE_URL = "https://analytics.whgazetteer.org"
PLAUSIBLE_SNIPPET = """
<script defer data-domain="docs.whgazetteer.org" src="https://analytics.whgazetteer.org/js/script.hash.outbound-links.js"></script>
<script>window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
"""

html_context = globals().get("html_context", {})
html_context.update({
    "plausible_script": PLAUSIBLE_SNIPPET
})
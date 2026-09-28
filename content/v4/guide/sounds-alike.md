# Sounds-alike Search

Historical place names reach us spelled in many ways and written in many scripts. *München*,
*Munich* and *Мюнхен* are one name, heard three ways. A search that only compares letters misses
these connections. WHG also compares how names **sound**.

## What it does

When you search, or when Map your Data looks for matches, WHG considers names that sound alike
even when they are spelled differently or written in a different script. Results are **ranked** by
how close the sounds are, rather than simply matched or not matched.

It helps most with:

- **historical and variant spellings** of the same name;
- **transliterations** of one name into different alphabets;
- **cross-script matches**, for example Latin and Cyrillic, Greek or Arabic forms.

It does *not* treat different names for one place as sound-alikes: *Deutschland*, *Germany* and
*Allemagne* are different names, and they are connected through the records' other evidence
(location, type, source links), not through sound.

## How it works, in brief

Each distinct name is converted into a description of how it is pronounced. Language-specific
rules turn written letters into sounds, and a model trained on place names from many languages
turns those sounds into a numerical "fingerprint". Names whose fingerprints are close sound alike.
The same method runs on WHG's servers and inside Map your Data in your browser, so both give the
same answers.

For the technical design, see [Toponym Phonetics](../../phonetics.md).

## Its limits

Sounds-alike search is a **discovery aid**, not a verdict. It can:

- miss a variant that looks unlike anything it has learned from;
- work less well for scripts and languages that are poorly represented in its training data;
- rest on sound rules that are imperfect for some languages.

Always check a suggested match against the record's other evidence.

## Help improve it

The letter-to-sound rules for each language can be wrong, incomplete, or missing letters the
language uses. WHG provides a page where people who know a language can check its rules against
real place names from the index, say what is wrong, and propose a correction. Reading it is open to
everyone. Contributing needs an account, and contributions are dedicated to the public domain
(CC0), so they can be used by anyone, including the open-source project the rules come from.

% TODO(release): link the phonetic rule review page once its public URL is fixed.

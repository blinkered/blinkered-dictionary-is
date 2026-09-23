# Blinkered dictionary: Icelandic

The Icelandic word list, and the evidence for every word in it.

Built by [`blinkered-attestation`](https://github.com/blinkered/blinkered-attestation). The rule,
the evidence format and the reasoning live there; what lives here is Icelandic.

**27,162 of 68,689 candidates proved: 39.5%**, across 6 independent
families, 5 of which a stranger could check by fetching.

## What is in this repository

```
sources.mjs        which collections attest Icelandic, and why those
ATTESTATIONS.tsv   the evidence: every candidate, what saw it, and where
words.txt          what survived, in Blinkered's own format
dropped.tsv        what did not, and how close it came
SATURATION.md      what each family was worth, measured from the evidence
COLLECTIONS.md     every collection read, and where to get it again
status.json        the numbers, whether this ships, and what the list is under
```

`.cache/` holds the downloaded collections and is not tracked. Everything here is regenerable
with `pnpm build`.

## Where the words come from

Candidates come from Blinkered's Icelandic list, which lives in
[`blinkered-attestation/candidates/is`](https://github.com/blinkered/blinkered-attestation/tree/main/candidates/is).
The dictionaries that built it are demoted to **proposing words worth looking up**. What earns a
word its place here is evidence that it occurs in the world: three independent collections, each
recorded with a locator somebody else can fetch.

`SATURATION.md` says what each family was worth. `COLLECTIONS.md` names every collection read and
where to get it again, which is what makes the downloads disposable.

## What is particular to Icelandic

**Every ready-made family is small.** Icelandic has an 11.8-million-token Wikipedia, Leipzig news
crawls from 2011 and 2019 and nothing newer, seven Gutenberg texts, a few thousand Tatoeba
sentences, and a New Testament with Psalms. The candidate list is 68,689 words, most of them
inflected forms of a language with four cases, three genders and a strong-verb system, so the
drop list is long and 19,120 of its words are one family short.

**The Archive shelf was weeded, and here that meant Old Norse.** Most of what the Archive files as
Icelandic is scholarship about it: Zoëga's *Concise Dictionary of Old Icelandic*, Fritzner's *Ordbog over det gamle norske
Sprog*, Sveinbjörn Egilsson's *Lexicon Poeticum*, an etymological dictionary in German, English
translations of the Eddas. Before the build a book was removed if its English or German function
words outnumbered its Icelandic ones, if Icelandic function words were under 5% of it, if
unambiguously English words passed 0.8% of it, or if its name says it is a dictionary; a dictionary
prints the candidate list back as headwords, which is not usage. The 5% floor also removes saga
editions in normalised Old Norse spelling (OK for OG, AT for AÐ), which is a different language
from the one these candidates are in. Each removal is in the shelf's `rejected.tsv`.

**REF ranks absurdly high, and that is a reader artefact.** It is a real word, a fox, and six
collections attest it, so it belongs in the list. But 201,214 of its sightings are in Wikipedia,
where they are the `<ref>` citation tags the Wikipedia reader does not strip. Its tier comes from
that rate, not from Icelandic. The fix belongs in the shared reader, not here.

**Icelandic is almost free of English.** 1.8% of the shipped list is also in Blinkered's English
candidates, and the top of the list is Icelandic function words. Every one of the 32 tiles
spells something, Þ and Ð included.

**No FineWeb-2.** Its 4.8GB Icelandic shard was not fetched because the disk was nearly full. It is
declared in `sources.mjs` and skipped when absent.

Of the 41,527 dropped candidates, 19,120 were seen by two families and are one short;
14,836 were seen by one, and 7,571 by none at all.

## Rebuilding

```
pnpm install
pnpm build        # reads whatever collections are in .cache/raw, reuses the record for the rest
pnpm conform      # the list says only what the evidence supports
pnpm saturation   # recomputes the curve and status.json
```

A collection that is not on disk is skipped with a warning and its recorded testimony is reused,
so a rebuild after more books arrive is short rather than a re-read of everything.

## Before this ships

Nobody has played this list yet. `status.json` says `"ships": "pending"`, and it stays that way
until somebody has checked the boards it deals against Blinkered's usability floor and decided.
`COMMON_CUT` in `sources.mjs` is carried over from Blinkered's old calibration against a
differently sized list, and has to be re-measured before this list reaches the game.

## Licensing

Three kinds of thing live here and they do not share terms. The distinction is the project: a
licence that claimed more than we can support would undo the argument the evidence is here to
make. [NOTICE](NOTICE) is the authority; this is the summary.

| | terms | what |
| --- | --- | --- |
| **Code and docs** | [Apache-2.0](LICENSE) | `build.mjs`, `sources.mjs`, `harvest.mjs`, `conform.mjs`, `saturation.mjs`, and the Markdown |
| **The list and its evidence** | [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `words.txt`, the evidence, `status.json`, `SATURATION.md`, `COLLECTIONS.md`, `searched.tsv` |
| **The words we could not prove** | `CC-BY-SA-3.0` | `dropped.tsv`; **not ours to license** |

**Why the list is CC0.** A word ships because three independent collections of text were found to
contain it. The record of which collections, and where in them, is a statement of fact about those
texts rather than a copy of them, and nothing a licence governs was taken from the dictionary that
proposed the candidates.

**Why `dropped.tsv` is not.** It is the candidates that failed, and a candidate that failed is a
word we have nothing to say about except that somebody's dictionary proposed it. That makes the
file a subset of that dictionary and it carries that dictionary's terms: here `CC-BY-SA-3.0`.

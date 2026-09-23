/**
 * The collections that attest Icelandic, and where each comes from.
 *
 * Icelandic is small in every ready-made corpus: no Leipzig news package newer than a 2019 crawl,
 * seven Gutenberg texts, and a Tatoeba of a few thousand sentences. Its candidate list is 68,689
 * words, most of them inflected forms of a heavily inflected language.
 *
 * Every URL here was probed before it was written down. A collection that 404s does not fail
 * loudly; the build skips it with a warning and reports a healthy number over fewer families.
 */
import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import {
  fileDocuments,
  fineweb2Documents,
  gutenbergBody,
  harvestDocuments,
  leipzigLocators,
  leipzigSentences,
  tatoebaDocuments,
  verseDocuments,
  wikiDocuments,
} from '@blinkered/attestation'

export const LANGUAGE = 'is'

const CACHE = new URL('.cache/raw/', import.meta.url).pathname

/** A Leipzig package, with its sentence-to-URL index resolved up front. */
function leipzig(pkg) {
  const base = `${CACHE}${pkg}/${pkg}`
  // A few crawled URLs contain a literal space, and the evidence format spends spaces as
  // separators, so the build refuses them. Percent-encoded they name the same page.
  const locators = leipzigLocators(
    readFileSync(`${base}-inv_so.txt`, 'utf8'),
    readFileSync(`${base}-sources.txt`, 'utf8').replaceAll(' ', '%20'),
  )
  const lines = createInterface({
    input: createReadStream(`${base}-sentences.txt`),
    crlfDelay: Infinity,
  })
  return leipzigSentences(lines, locators)
}

// News only. The Leipzig Wikipedia packages are deliberately absent: they are Wikipedia text
// wearing a Leipzig label, so including one would corroborate `wiki:is` while looking like
// another family. Icelandic has no `isl_news_*` package; these are its two news crawls.
const LEIPZIG = ['isl_newscrawl_2011_1M', 'isl_newscrawl_2019_300K']

const ARCHIVE_QUERY = '(language:"Icelandic" OR language:ice OR language:isl) AND mediatype:texts'

const ALL = [
  {
    id: 'wiki:is',
    what: 'Icelandic Wikipedia; modern encyclopedic prose',
    needs: `${CACHE}iswiki.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}iswiki.xml.bz2`),
  },
  {
    id: 'wikisource:is',
    what: 'Icelandic Wikisource; same Wikimedia family, so it corroborates rather than counts',
    needs: `${CACHE}iswikisource.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}iswikisource.xml.bz2`),
  },
  ...LEIPZIG.map((pkg) => ({
    id: `lz:${pkg}`,
    from: `https://downloads.wortschatz-leipzig.de/corpora/${pkg}.tar.gz`,
    what: `Leipzig ${pkg}; modern news, cited by the page each sentence came from`,
    needs: `${CACHE}${pkg}`,
    documents: () => leipzig(pkg),
  })),
  {
    id: 'tat',
    from: 'https://downloads.tatoeba.org/exports/per_language/isl/isl_sentences.tsv.bz2',
    what: 'Tatoeba Icelandic; contemporary and conversational',
    needs: `${CACHE}isl_sentences.tsv`,
    documents: () => tatoebaDocuments(`${CACHE}isl_sentences.tsv`),
  },
  {
    id: 'fw2',
    from: 'https://huggingface.co/datasets/HuggingFaceFW/fineweb-2/resolve/main/data/isl_Latn/train/000_00000.parquet',
    what: 'FineWeb-2 Icelandic; a web crawl nobody here made',
    needs: `${CACHE}fineweb2-isl.parquet`,
    documents: () => fineweb2Documents(`${CACHE}fineweb2-isl.parquet`),
  },
  {
    id: 'gut',
    from: 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv',
    what: 'Project Gutenberg Icelandic',
    needs: `${CACHE}gutenberg-is`,
    documents: () => {
      const dir = `${CACHE}gutenberg-is`
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => ({ locator: file.replace('.txt', ''), path: `${dir}/${file}` }))
      return fileDocuments(books, async (path) => gutenbergBody(readFileSync(path, 'utf8')))
    },
  },
  {
    id: 'ebible:isl',
    from: 'https://ebible.org/Scriptures/isl_vpl.zip',
    what: 'Opna Lifandi Orð, an Icelandic New Testament and Psalms; a family nothing else here belongs to',
    needs: `${CACHE}ebible-isl/isl_vpl.txt`,
    documents: () => verseDocuments(`${CACHE}ebible-isl/isl_vpl.txt`),
  },
  {
    id: 'ia',
    // Scanned books are OCR, and OCR fails in a way that looks like text. Clean Gutenberg scores
    // a median 52% known words and never below 36%; below this floor a book is not legible
    // enough to attest anything.
    legible: 0.35,
    what: 'Internet Archive Icelandic books; literature, and the register a newspaper never reaches',
    needs: `${CACHE}archive-is`,
    from: `https://archive.org/search?query=${encodeURIComponent(ARCHIVE_QUERY)}`,
    documents: () => {
      const dir = `${CACHE}archive-is`
      // A locator names the text, not the item: the catalogue page holds no word of the book.
      const named = new Map(
        readFileSync(`${dir}/files.tsv`, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t')),
      )
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => file.replace('.txt', ''))
        .filter((id) => named.has(id))
        // Percent-encoded: two thirds of Archive filenames contain spaces, and the evidence
        // format spends spaces as separators.
        .map((id) => ({
          locator: `${id}/${encodeURIComponent(named.get(id))}`,
          path: `${dir}/${id}.txt`,
        }))
      return fileDocuments(books, async (path) => readFileSync(path, 'utf8'))
    },
  },
]

export const SOURCES = ALL.filter((source) => {
  if (source.needs === undefined || existsSync(source.needs)) return true
  process.stderr.write(`  (skipping ${source.id}: ${source.needs} is not in .cache/raw)\n`)
  return false
})

/**
 * Icelandic publishers, for the harvest.
 *
 * Chosen because they publish in Icelandic rather than because they are large. A harvester reads
 * whatever it fetches and has no idea what language it is in, so a domain that publishes mostly
 * in another language would attest that language's words against these candidates.
 */
export const DOMAINS = [
  'ruv.is', 'mbl.is', 'visir.is', 'dv.is', 'heimildin.is',
  'vb.is', 'bb.is', 'mannlif.is', 'kjarninn.is', 'frettabladid.is',
]

export const HARVEST = existsSync(new URL('searched.tsv', import.meta.url).pathname)
  ? () => harvestDocuments(new URL('searched.tsv', import.meta.url).pathname)
  : undefined

/** Carried over from Blinkered's calibration; must be re-measured before anything ships. */
export const COMMON_CUT = 17000

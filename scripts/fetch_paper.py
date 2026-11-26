#!/usr/bin/env python3
"""Zero-dependency paper fetcher for arXiv, Open-Access DOI, direct PDF URLs, and Zotero 7 local API.

Uses only the Python standard library so external users need zero extra packages or MCP servers
to fetch arXiv preprints, legal Open-Access DOI PDFs, or local Zotero 7 attachments.
Paywalled DOIs without a legal Open-Access PDF never fall back to unauthorized sources;
they save verified bibliographic metadata and exit with code 2 so the caller can supply a local PDF.

Usage:
  python scripts/fetch_paper.py --source 2301.12345 --out temp/task
  python scripts/fetch_paper.py --source https://arxiv.org/abs/1706.03762 --out temp/task
  python scripts/fetch_paper.py --source 10.1038/s41586-021-03819-2 --out temp/task
  python scripts/fetch_paper.py --source 10.1109/97.988715 --out temp/task
  python scripts/fetch_paper.py --zotero-query "sparse histograms" --out temp/task
  python scripts/fetch_paper.py --zotero-key ABCD1234 --out temp/task
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

USER_AGENT = "paper-deep-reader/1.0 (+https://github.com/yangyannick/paper-deep-reader)"
ARXIV_NEW_RE = re.compile(r"^(?:arxiv:)?(\d{4}\.\d{4,5}(?:v\d+)?)$", re.IGNORECASE)
ARXIV_OLD_RE = re.compile(r"^(?:arxiv:)?([a-z\-]+(?:\.[a-z\-]+)?/\d{7}(?:v\d+)?)$", re.IGNORECASE)
ARXIV_URL_RE = re.compile(
    r"https?://(?:www\.|export\.)?arxiv\.org/(?:abs|pdf|html)/([^?#]+?)(?:\.pdf)?$",
    re.IGNORECASE,
)
DOI_RE = re.compile(r"(10\.\d{4,9}/[^\s\"<>]+)", re.IGNORECASE)


def http_get(url: str, accept: str = "*/*", timeout: int = 25) -> tuple[bytes, dict[str, str]]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": accept,
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
        headers = {k.lower(): v for k, v in resp.headers.items()}
        return data, headers


def http_get_json(url: str, timeout: int = 20) -> dict[str, Any] | list[Any] | None:
    try:
        data, _ = http_get(url, accept="application/json", timeout=timeout)
        return json.loads(data.decode("utf-8", errors="replace"))
    except Exception:
        return None


def is_valid_pdf_bytes(data: bytes) -> bool:
    if len(data) < 4096:
        return False
    # Allow minor leading whitespace/BOM before %PDF-
    return b"%PDF-" in data[:1024]


def download_pdf(url: str, dest: Path, timeout: int = 60, retries: int = 2) -> bool:
    for _ in range(max(1, retries)):
        try:
            data, _ = http_get(url, accept="application/pdf,*/*;q=0.8", timeout=timeout)
            if not is_valid_pdf_bytes(data):
                return False
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            return True
        except Exception:
            continue
    return False


def slugify(text: str, max_len: int = 64) -> str:
    s = re.sub(r"[^A-Za-z0-9._-]+", "_", text).strip("._-")
    return (s[:max_len] or "paper").rstrip("._-")


def strip_html(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", text or "")).strip()


def detect_arxiv_id(raw: str) -> str | None:
    s = raw.strip()
    m = ARXIV_URL_RE.match(s)
    if m:
        return m.group(1).strip("/")
    m = ARXIV_NEW_RE.match(s)
    if m:
        return m.group(1)
    m = ARXIV_OLD_RE.match(s)
    if m:
        return m.group(1)
    return None


def detect_doi(raw: str) -> str | None:
    s = raw.strip()
    s = re.sub(r"^doi:\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", s, flags=re.IGNORECASE)
    m = DOI_RE.search(s)
    if m:
        return m.group(1).rstrip(".,;)")
    return None


def fetch_arxiv_metadata(arxiv_id: str) -> dict[str, Any]:
    meta: dict[str, Any] = {
        "source_type": "arxiv",
        "arxiv_id": arxiv_id,
        "title": "",
        "authors": [],
        "year": None,
        "venue": "arXiv",
        "doi": None,
        "abstract": "",
        "url": f"https://arxiv.org/abs/{arxiv_id}",
        "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}.pdf",
    }
    api_url = f"https://export.arxiv.org/api/query?id_list={urllib.parse.quote(arxiv_id)}"
    try:
        raw, _ = http_get(api_url, accept="application/atom+xml", timeout=20)
        root = ET.fromstring(raw)
        ns = {
            "atom": "http://www.w3.org/2005/Atom",
            "arxiv": "http://arxiv.org/schemas/atom",
        }
        entry = root.find("atom:entry", ns)
        if entry is not None:
            title_el = entry.find("atom:title", ns)
            if title_el is not None and title_el.text:
                meta["title"] = re.sub(r"\s+", " ", title_el.text).strip()
            summary_el = entry.find("atom:summary", ns)
            if summary_el is not None and summary_el.text:
                meta["abstract"] = re.sub(r"\s+", " ", summary_el.text).strip()
            pub_el = entry.find("atom:published", ns)
            if pub_el is not None and pub_el.text and len(pub_el.text) >= 4:
                meta["year"] = int(pub_el.text[:4])
            authors = []
            for a in entry.findall("atom:author/atom:name", ns):
                if a.text:
                    authors.append(a.text.strip())
            meta["authors"] = authors
            doi_el = entry.find("arxiv:doi", ns)
            if doi_el is not None and doi_el.text:
                meta["doi"] = doi_el.text.strip()
            jref_el = entry.find("arxiv:journal_ref", ns)
            if jref_el is not None and jref_el.text:
                meta["venue"] = jref_el.text.strip()
    except Exception:
        pass
    return meta


def handle_arxiv(arxiv_id: str, out_dir: Path) -> int:
    meta = fetch_arxiv_metadata(arxiv_id)
    pdf_path = out_dir / f"arxiv_{slugify(arxiv_id)}.pdf"
    ok = download_pdf(meta["pdf_url"], pdf_path)
    meta["pdf_obtained"] = ok
    meta["pdf_path"] = str(pdf_path.resolve()) if ok else None
    meta["oa_source"] = "arxiv" if ok else None
    meta_path = out_dir / "paper_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    if ok:
        print(f"FETCH_OK | source=arxiv | pdf={pdf_path.resolve()} | meta={meta_path.resolve()}")
        return 0
    print(f"FETCH_FAILED | source=arxiv | arxiv_id={arxiv_id} | meta={meta_path.resolve()}")
    return 1


def fetch_crossref(doi: str) -> tuple[dict[str, Any], list[tuple[str, str]]]:
    quoted = urllib.parse.quote(doi, safe="")
    data = http_get_json(f"https://api.crossref.org/works/{quoted}")
    meta: dict[str, Any] = {
        "source_type": "doi",
        "doi": doi,
        "title": "",
        "authors": [],
        "year": None,
        "venue": "",
        "volume": None,
        "issue": None,
        "pages": None,
        "abstract": "",
        "url": f"https://doi.org/{doi}",
    }
    candidates: list[tuple[str, str]] = []
    if not isinstance(data, dict) or "message" not in data:
        return meta, candidates
    msg = data["message"]
    titles = msg.get("title") or []
    if titles:
        meta["title"] = strip_html(titles[0])
    authors = []
    for a in msg.get("author") or []:
        given = (a.get("given") or "").strip()
        family = (a.get("family") or "").strip()
        full = f"{given} {family}".strip() or (a.get("name") or "").strip()
        if full:
            authors.append(full)
    meta["authors"] = authors
    for key in ("published-print", "published-online", "issued", "created"):
        parts = (msg.get(key) or {}).get("date-parts") or []
        if parts and parts[0]:
            meta["year"] = parts[0][0]
            break
    venues = msg.get("container-title") or []
    if venues:
        meta["venue"] = venues[0]
    meta["volume"] = msg.get("volume")
    meta["issue"] = msg.get("issue")
    meta["pages"] = msg.get("page")
    if msg.get("abstract"):
        meta["abstract"] = strip_html(msg["abstract"])
    for link in msg.get("link") or []:
        url = link.get("URL")
        ctype = (link.get("content-type") or "").lower()
        if url and ("pdf" in ctype or url.lower().endswith(".pdf")):
            candidates.append(("crossref", url))
    return meta, candidates


def collect_oa_candidates_openalex(doi: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    quoted = urllib.parse.quote(f"https://doi.org/{doi}", safe="")
    data = http_get_json(f"https://api.openalex.org/works/{quoted}")
    if not isinstance(data, dict):
        return out
    best = data.get("best_oa_location") or {}
    if best.get("pdf_url"):
        out.append(("openalex", best["pdf_url"]))
    for loc in data.get("locations") or []:
        if not isinstance(loc, dict):
            continue
        if loc.get("pdf_url"):
            out.append(("openalex", loc["pdf_url"]))
        lp = loc.get("landing_page_url") or ""
        ax = detect_arxiv_id(lp)
        if ax:
            out.append(("openalex-arxiv", f"https://arxiv.org/pdf/{ax}.pdf"))
    return out


def collect_oa_candidates_s2(doi: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    quoted = urllib.parse.quote(doi, safe="")
    url = (
        f"https://api.semanticscholar.org/graph/v1/paper/DOI:{quoted}"
        "?fields=openAccessPdf,externalIds"
    )
    data = http_get_json(url)
    if not isinstance(data, dict):
        return out
    oa = data.get("openAccessPdf") or {}
    if oa.get("url"):
        out.append(("semantic_scholar", oa["url"]))
    ext = data.get("externalIds") or {}
    ax = ext.get("ArXiv")
    if ax:
        out.append(("semantic_scholar-arxiv", f"https://arxiv.org/pdf/{ax}.pdf"))
    return out


def collect_oa_candidates_unpaywall(doi: str, email: str | None) -> list[tuple[str, str]]:
    if not email:
        return []
    out: list[tuple[str, str]] = []
    quoted = urllib.parse.quote(doi, safe="")
    url = f"https://api.unpaywall.org/v2/{quoted}?email={urllib.parse.quote(email)}"
    data = http_get_json(url)
    if not isinstance(data, dict):
        return out
    best = data.get("best_oa_location") or {}
    if best.get("url_for_pdf"):
        out.append(("unpaywall", best["url_for_pdf"]))
    for loc in data.get("oa_locations") or []:
        if isinstance(loc, dict) and loc.get("url_for_pdf"):
            out.append(("unpaywall", loc["url_for_pdf"]))
    return out


def collect_oa_candidates_europepmc(doi: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    q = urllib.parse.quote(f'DOI:"{doi}"')
    url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&resultType=core"
    data = http_get_json(url)
    if not isinstance(data, dict):
        return out
    results = (data.get("resultList") or {}).get("result") or []
    for item in results[:2]:
        if not isinstance(item, dict):
            continue
        for fu in (item.get("fullTextUrlList") or {}).get("fullTextUrl") or []:
            if not isinstance(fu, dict):
                continue
            if (fu.get("documentStyle") or "").lower() == "pdf" and (fu.get("availabilityCode") or "").upper() == "OA":
                if fu.get("url"):
                    out.append(("europepmc", fu["url"]))
        pmcid = item.get("pmcid")
        if pmcid and item.get("isOpenAccess") == "Y":
            out.append(("europepmc", f"https://europepmc.org/articles/{pmcid}?pdf=render"))
    return out


def handle_doi(doi: str, out_dir: Path, email: str | None) -> int:
    meta, cr_cands = fetch_crossref(doi)
    candidates: list[tuple[str, str]] = []
    candidates.extend(collect_oa_candidates_openalex(doi))
    candidates.extend(collect_oa_candidates_europepmc(doi))
    candidates.extend(collect_oa_candidates_s2(doi))
    candidates.extend(collect_oa_candidates_unpaywall(doi, email))
    candidates.extend(cr_cands)

    seen: set[str] = set()
    deduped: list[tuple[str, str]] = []
    for src, url in candidates:
        if url and url not in seen:
            seen.add(url)
            deduped.append((src, url))

    pdf_path = out_dir / f"doi_{slugify(doi)}.pdf"
    oa_source = None
    tried: list[dict[str, str]] = []
    for src, url in deduped:
        tried.append({"source": src, "url": url})
        if download_pdf(url, pdf_path):
            oa_source = src
            break

    meta["pdf_obtained"] = oa_source is not None
    meta["pdf_path"] = str(pdf_path.resolve()) if oa_source else None
    meta["oa_source"] = oa_source
    meta["oa_candidates_checked"] = tried
    meta_path = out_dir / "paper_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    if oa_source:
        print(
            f"FETCH_OK | source={oa_source} | doi={doi} | "
            f"pdf={pdf_path.resolve()} | meta={meta_path.resolve()}"
        )
        return 0

    print(
        f"PAYWALL_OR_NO_OA_PDF | doi={doi} | title={meta.get('title') or 'Unknown'} | "
        f"meta={meta_path.resolve()} | "
        "Action: Provide a local PDF path or locate this item in your Zotero library."
    )
    return 2


def handle_direct_url(url: str, out_dir: Path) -> int:
    parsed = urllib.parse.urlparse(url)
    base = Path(parsed.path).name or "paper.pdf"
    if not base.lower().endswith(".pdf"):
        base = slugify(base) + ".pdf"
    pdf_path = out_dir / slugify(base)
    if not pdf_path.name.lower().endswith(".pdf"):
        pdf_path = pdf_path.with_suffix(".pdf")
    ok = download_pdf(url, pdf_path)
    meta = {
        "source_type": "url",
        "url": url,
        "pdf_obtained": ok,
        "pdf_path": str(pdf_path.resolve()) if ok else None,
    }
    meta_path = out_dir / "paper_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    if ok:
        print(f"FETCH_OK | source=url | pdf={pdf_path.resolve()} | meta={meta_path.resolve()}")
        return 0
    print(f"FETCH_FAILED | source=url | url={url} | Reason: Response was not a valid PDF.")
    return 1


def resolve_zotero_attachment_pdf(att_data: dict[str, Any], att_key: str, zotero_dir: Path) -> Path | None:
    link_mode = att_data.get("linkMode", "")
    raw_path = att_data.get("path", "") or ""
    if link_mode == "linked_file" and raw_path:
        p = Path(raw_path.replace("attachments:", "")).expanduser()
        if p.exists() and p.is_file():
            return p
    storage_dir = zotero_dir / "storage" / att_key
    if storage_dir.exists():
        pdfs = sorted(storage_dir.glob("*.pdf"))
        if pdfs:
            return pdfs[0]
    return None


def handle_zotero_local(
    out_dir: Path,
    zotero_key: str | None,
    zotero_query: str | None,
    zotero_dir: Path,
) -> int:
    base = "http://127.0.0.1:23119/api/users/0"
    item: dict[str, Any] | None = None
    if zotero_key:
        res = http_get_json(f"{base}/items/{urllib.parse.quote(zotero_key)}", timeout=8)
        if isinstance(res, dict) and "data" in res:
            item = res
    elif zotero_query:
        q = urllib.parse.urlencode({"q": zotero_query, "itemType": "-attachment", "limit": 10})
        res = http_get_json(f"{base}/items?{q}", timeout=8)
        if isinstance(res, list) and res:
            item = res[0]
            if len(res) > 1:
                print(
                    f"ZOTERO_INFO | matched={len(res)} items for query={zotero_query!r}; "
                    f"using top hit key={item.get('key')} title={item.get('data', {}).get('title', '')!r}"
                )
    else:
        print("ZOTERO_ERROR: Provide --zotero-key or --zotero-query.")
        return 1

    if item is None:
        print(
            "ZOTERO_LOCAL_UNREACHABLE_OR_NOT_FOUND | "
            "Make sure Zotero 7 is running and 'Allow other applications on this computer "
            "to communicate with Zotero' is enabled in Settings -> Advanced, or pass a local PDF."
        )
        return 3

    key = item.get("key") or ""
    d = item.get("data") or {}
    children = http_get_json(f"{base}/items/{urllib.parse.quote(key)}/children", timeout=8) or []

    pdf_src: Path | None = None
    notes: list[str] = []
    if isinstance(children, list):
        for ch in children:
            cd = ch.get("data") or {}
            if cd.get("itemType") == "attachment" and cd.get("contentType") == "application/pdf":
                cand = resolve_zotero_attachment_pdf(cd, ch.get("key", ""), zotero_dir)
                if cand is not None and pdf_src is None:
                    pdf_src = cand
            elif cd.get("itemType") == "note" and cd.get("note"):
                notes.append(strip_html(cd["note"]))

    creators = []
    for c in d.get("creators") or []:
        full = f"{c.get('firstName', '')} {c.get('lastName', '')}".strip() or c.get("name", "")
        if full:
            creators.append(full)

    meta = {
        "source_type": "zotero_local_api",
        "zotero_key": key,
        "title": d.get("title", ""),
        "authors": creators,
        "date": d.get("date", ""),
        "venue": d.get("publicationTitle") or d.get("proceedingsTitle") or "",
        "doi": d.get("DOI", ""),
        "url": d.get("url", ""),
        "tags": [t.get("tag") for t in d.get("tags") or [] if t.get("tag")],
        "notes": notes,
        "pdf_obtained": pdf_src is not None,
        "pdf_path": str(pdf_src.resolve()) if pdf_src else None,
    }
    meta_path = out_dir / "paper_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    if pdf_src:
        print(f"FETCH_OK | source=zotero_local_api | key={key} | pdf={pdf_src.resolve()} | meta={meta_path.resolve()}")
        return 0
    print(
        f"ZOTERO_NO_LOCAL_PDF | key={key} | title={meta['title']!r} | meta={meta_path.resolve()} | "
        f"Checked storage under {zotero_dir}. Provide --zotero-dir if your Zotero data folder is custom."
    )
    return 2


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Fetch paper metadata & PDF from arXiv, Open-Access DOI, direct PDF URL, or Zotero 7 local API."
    )
    ap.add_argument("--source", help="Local PDF path, arXiv ID/URL, DOI, or direct PDF URL.")
    ap.add_argument("--zotero-key", help="Zotero item key (requires running Zotero 7 local API).")
    ap.add_argument("--zotero-query", help="Search query against Zotero 7 local API.")
    ap.add_argument(
        "--zotero-dir",
        default=str(Path.home() / "Zotero"),
        help="Local Zotero data directory containing storage/ (default: ~/Zotero).",
    )
    ap.add_argument(
        "--email",
        default=os.environ.get("UNPAYWALL_EMAIL"),
        help="Optional email for Unpaywall API (or set UNPAYWALL_EMAIL env var).",
    )
    ap.add_argument("--out", required=True, help="Temporary working directory for metadata and downloaded PDF.")
    args = ap.parse_args()

    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.zotero_key or args.zotero_query:
        sys.exit(
            handle_zotero_local(
                out_dir=out_dir,
                zotero_key=args.zotero_key,
                zotero_query=args.zotero_query,
                zotero_dir=Path(args.zotero_dir).expanduser(),
            )
        )

    if not args.source:
        ap.error("Provide either --source, --zotero-key, or --zotero-query.")

    src = args.source.strip()
    local_p = Path(src).expanduser()
    if local_p.exists() and local_p.is_file():
        data = local_p.read_bytes()
        if not is_valid_pdf_bytes(data):
            print(f"FETCH_FAILED | source=local | path={local_p.resolve()} | Not a valid PDF file.")
            sys.exit(1)
        meta = {
            "source_type": "local",
            "pdf_obtained": True,
            "pdf_path": str(local_p.resolve()),
        }
        meta_path = out_dir / "paper_meta.json"
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"FETCH_OK | source=local | pdf={local_p.resolve()} | meta={meta_path.resolve()}")
        sys.exit(0)

    arxiv_id = detect_arxiv_id(src)
    if arxiv_id:
        sys.exit(handle_arxiv(arxiv_id, out_dir))

    doi = detect_doi(src)
    if doi:
        sys.exit(handle_doi(doi, out_dir, args.email))

    if src.lower().startswith(("http://", "https://")):
        sys.exit(handle_direct_url(src, out_dir))

    print(f"FETCH_FAILED | Unrecognized source: {src!r}. Pass a local PDF, arXiv ID/URL, DOI, or PDF URL.")
    sys.exit(1)


if __name__ == "__main__":
    main()

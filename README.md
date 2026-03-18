# DuaCrypo.org

Landing page statike (në shqip) për edukim mbi investimet në kriptomonedha.

## Çfarë përmban faqja

- Hero section me CTA dhe navigim me anchor links.
- Seksione edukative: strategji, këshilla, menaxhim rreziku.
- Mjete interaktive:
  - Simulator i thjeshtë i portofolit.
  - DCA calculator.
  - Grafik i animuar i historikut të Bitcoin.
  - Efekt vizual “Bitcoin Rain” 60 sekonda.
- Seksione informative për tregun shqiptar:
  - Adoptimi i kriptos në Shqipëri (vlerësim orientues).
  - Përmbledhje rregullatore/ligjore.
  - Banka që operojnë në Shqipëri dhe qasje ndaj transaksioneve kripto.

## Struktura e projektit

- `index.html` — faqja kryesore (HTML + CSS + JavaScript vanilla).
- `.github/workflows/deploy-pages.yml` — workflow për deploy automatik në GitHub Pages.

## Zhvillim lokal

Nga root i projektit:

```bash
python3 -m http.server 4173
```

Hape në browser:

- `http://127.0.0.1:4173`

## Deploy në GitHub Pages

Ky repo përdor GitHub Actions për deploy.

1. Shko te **Settings → Pages**.
2. Te **Build and deployment**, zgjidh **Source = GitHub Actions**.
3. Bëj push në një nga branch-et e konfiguruara: `work`, `main`, ose `master`.

Workflow i deploy-t:

- checkout kodin
- konfigurim pages
- upload artifact statik
- deploy në GitHub Pages

## Push i branch-it aktual

Nëse branch-i yt lokal është `work`:

```bash
git push -u origin work
```

## Shënim i rëndësishëm

Përmbajtja është edukative dhe **nuk përbën këshillë financiare**.
Gjithmonë bëj kërkimin tënd dhe konsultohu me specialistë të licencuar kur duhet.

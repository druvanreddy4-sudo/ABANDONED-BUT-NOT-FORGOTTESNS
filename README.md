# Abandoned But Not Forgotten

An interactive digital museum of human-made objects left on the Moon and Mars. Built for NASA Space Apps 2026.

## Features
- Moon / Mars explorer with interactive map markers (Leaflet + NASA Solar System Treks base maps)
- Abandoned-object database (`data/objects.json`)
- Story mode: three chapters per object, plus optional spoken narration
- Mission timeline
- Live photos from the NASA Image and Video Library
- Preservation awareness section

## Run it
Open the folder in VS Code and use the Live Server extension, or run:

    python -m http.server 8000

then visit http://localhost:8000

## Data sources
- NASA Image and Video Library: https://images.nasa.gov
- NASA Solar System Treks (LRO and Viking base maps): https://trek.nasa.gov
- NASA mission records (Apollo 11, Apollo 15, Mars 2020)

**Challenge requirement:** the official Space Apps challenge requires using at least one data source from the challenge's own Resources tab. Check that list, and make sure the source you use here is on it. Update this section to name it.

## Accuracy notes
Landing-site coordinates for the Apollo objects are site-level. Mars debris positions are approximate and labelled as such. Please verify each record against NASA sources before presenting it as confirmed.

## AI disclosure
Built with the assistance of Claude (Anthropic). AI tools are permitted by the challenge rules.

# Tests – Content Blocks GUI

## Voraussetzungen

- DDEV läuft (`ddev start`)
- PHP-Dependencies installiert (`ddev composer install`)

Die Test-Dependencies (`phpunit/phpunit`, `typo3/testing-framework`) sind in der `composer.json` der Extension als `require-dev` definiert.

---

## Unit Tests

```bash
ddev exec php vendor/bin/phpunit -c packages/content_blocks_gui/Tests/phpunit.unit.xml
```

**Einzelnen Test ausführen:**
```bash
ddev exec php vendor/bin/phpunit -c packages/content_blocks_gui/Tests/phpunit.unit.xml --filter="successAnswerIsSuccess"
```

**Einzelne Test-Klasse:**
```bash
ddev exec php vendor/bin/phpunit -c packages/content_blocks_gui/Tests/phpunit.unit.xml packages/content_blocks_gui/Tests/Unit/Answer/AnswerClassesTest.php
```

| Datei | Tests | Was wird getestet |
|-------|-------|-------------------|
| `Unit/Answer/AnswerClassesTest.php` | 9 | Answer Value Objects (Success, Error, Data) |
| `Unit/Factory/UsageFactoryTest.php` | 3 | Repository-Routing per ContentType |
| `Unit/Service/ContentBlockImportAnalyzerTest.php` | 6 | ZIP-Validierung, Type-Mapping, Basic-Erkennung |

---

## Functional Tests

Benötigen Datenbank-Credentials als Environment-Variablen.

```bash
ddev exec bash -c '\
  typo3DatabaseName=func_test \
  typo3DatabaseHost=db \
  typo3DatabaseUsername=root \
  typo3DatabasePassword=root \
  typo3DatabasePort=3306 \
  php vendor/bin/phpunit \
    -c packages/content_blocks_gui/Tests/phpunit.functional.xml'
```

**Einzelne Test-Klasse:**
```bash
ddev exec bash -c '\
  typo3DatabaseName=func_test \
  typo3DatabaseHost=db \
  typo3DatabaseUsername=root \
  typo3DatabasePassword=root \
  typo3DatabasePort=3306 \
  php vendor/bin/phpunit \
    -c packages/content_blocks_gui/Tests/phpunit.functional.xml \
    packages/content_blocks_gui/Tests/Functional/Service/BasicsServiceTest.php'
```

| Datei | Tests | Was wird getestet |
|-------|-------|-------------------|
| `Functional/Service/BasicsServiceTest.php` | 4 | Basics laden, listen, validieren |
| `Functional/Service/ContentTypeServiceTest.php` | 4 | ContentType-Defaults, Validierung |
| `Functional/Repository/ContentElementRepositoryTest.php` | 3 | DB-Queries, Hidden/Deleted-Handling |
| `Functional/Controller/AjaxControllerTest.php` | 2 | Parameter-Validierung, HTTP-Status-Codes |

### Fixtures

| Datei | Inhalt |
|-------|--------|
| `Functional/Fixtures/be_users.csv` | Admin-Backend-User für Controller-Tests |
| `Functional/Fixtures/tt_content.csv` | Sample-Records für Repository-Tests |
| `Functional/Fixtures/BasicFixture.yaml` | Beispiel-Basic für Service-Tests |

---

## Playwright E2E Tests

Test-Setup in `Playwright/` mit eigenen npm-Dependencies. Testet die GUI im echten TYPO3-Backend mit Chromium. Benötigt eine laufende TYPO3-Instanz und einen Backend-User.

### Dateistruktur

```
Playwright/
├── package.json              # Dependencies (@playwright/test, dotenv, @types/node)
├── playwright.config.ts      # Playwright-Konfiguration, lädt .env automatisch
├── tsconfig.json             # TypeScript-Konfiguration für IDE-Support (Autocomplete, Fehleranzeige)
├── content-blocks-gui.spec.ts # Testcases
├── .env.example              # Template für lokale Konfiguration
├── .gitignore                # Schützt node_modules, .env, auth.json, Reports
```

### Setup (einmalig)

```bash
cd packages/content_blocks_gui/Tests/Playwright
npm run setup
```

Das installiert die npm-Dependencies und den Chromium-Browser.

### Konfiguration

Kopiere `.env.example` nach `.env` und passe die Werte an:

```bash
cd packages/content_blocks_gui/Tests/Playwright
cp .env.example .env
```

Die `.env`-Datei wird automatisch von der Playwright-Config via `dotenv` geladen.

| Env-Variable | Default | Beschreibung |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | — | TYPO3 Backend URL (Trailing Slash erforderlich) |
| `BACKEND_ADMIN_USERNAME` | — | Backend-Username |
| `BACKEND_ADMIN_PASSWORD` | — | Backend-Passwort |

### Tests ausführen

```bash
cd packages/content_blocks_gui/Tests/Playwright
npm test
```

**Mit UI-Modus (interaktiv):**
```bash
npm run test:ui
```

**Mit Debug-Modus (Schritt für Schritt):**
```bash
npm run test:debug
```

### Testcases

| Testcase | Was wird getestet |
|----------|-------------------|
| `login and save session` | Backend-Login funktioniert, Session wird als `auth.json` für folgende Tests gespeichert |
| `module loads list component` | `content-block-list` Web Component rendert im Backend-Modul (iframe) |
| `list view shows tab navigation` | Tab-Navigation (Content Elements, Page Types, etc.) sichtbar |
| `editor loads with three panes` | Editor hat Left/Middle/Right Pane nach Klick auf "Neu" |
| `editor settings tab has form fields` | Vendor, Name, Extension Felder im Settings-Tab vorhanden |
| `editor components tab shows field types` | Draggable FieldTypes werden im Components-Tab angezeigt |

### Hinweise

- Die Tests laufen **seriell** (nicht parallel), da sie eine gemeinsame Login-Session teilen (`auth.json`).
- TYPO3 rendert Backend-Module in einem **iframe** — die Tests nutzen `page.frameLocator('typo3-iframe-module iframe')` um auf die Modul-Inhalte zuzugreifen.
- Die `tsconfig.json` ist nur für IDE-Support (Autocomplete, Fehleranzeige in PhpStorm/VS Code). Playwright nutzt seinen eigenen Transpiler.

---

## Alle Tests auf einmal

```bash
# Unit + Functional (aus Projekt-Root)
ddev exec bash -c '\
  php vendor/bin/phpunit -c packages/content_blocks_gui/Tests/phpunit.unit.xml \
  && typo3DatabaseName=func_test typo3DatabaseHost=db typo3DatabaseUsername=root typo3DatabasePassword=root typo3DatabasePort=3306 \
     php vendor/bin/phpunit -c packages/content_blocks_gui/Tests/phpunit.functional.xml'

# Playwright E2E (aus Playwright-Verzeichnis)
cd packages/content_blocks_gui/Tests/Playwright && npm test
```

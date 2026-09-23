---
name: gitlab-code-review
description: 'Przeprowadza rygorystyczne review kodu z GitLab Merge Request lub wskazanej galezi. Uzyj, gdy uzytkownik prosi o code review, przeglad MR, analize diffa, ocene zmian z GitLaba, wykrycie regresji, luk bezpieczenstwa albo brakujacych testow.'
argument-hint: 'URL lub IID Merge Requestu, opcjonalnie zakres i kryteria review'
---

# GitLab Code Review

Przeprowadz review zmian z GitLaba jak senior reviewer. Szukaj przede wszystkim defektow, regresji, ryzyk bezpieczenstwa i brakujacych testow. Nie oceniaj stylu, jesli nie wplywa na poprawnosc, utrzymanie lub zgodnosc z zasadami projektu.

## Dane wejsciowe

Przyjmij URL Merge Requestu, IID MR albo nazwe galezi. Ustal tez repozytorium, galezie bazowa i zrodlowa oraz wymagania powiazane ze zmiana. Jesli brakuje informacji koniecznej do pobrania jednoznacznego diffa, popros o nia przed review.

Nigdy nie pros o token, haslo ani klucz w rozmowie. Gdy uwierzytelnienie jest wymagane, polec uzytkownikowi wykonanie logowania bezposrednio w terminalu.

## Procedura

### 1. Ustal zakres i stan roboczy

1. Przeczytaj instrukcje repozytorium, dokumentacje dotyczaca zmienianego obszaru i kryteria akceptacji.
2. Sprawdz `git status` i nie modyfikuj ani nie cofaj lokalnych zmian uzytkownika.
3. Potwierdz, czy review dotyczy calego MR, wybranych plikow, bezpieczenstwa, wydajnosci lub innego ograniczonego zakresu.
4. Zanotuj SHA bazowy i zrodlowy. Review zawsze przypisz do konkretnej pary commitow.

### 2. Pobierz wiarygodne dane z GitLaba

Preferuj GitLab CLI, jesli jest dostepne i uwierzytelnione:

```powershell
glab mr view <iid-lub-galaz> --comments -R <url-lub-namespace-repo>
glab mr diff <iid-lub-galaz> --raw -R <url-lub-namespace-repo>
```

Parametr `-R` moze wskazywac pelny URL repozytorium, dlatego stosuj ten sam workflow dla GitLab.com i instancji self-managed. Jesli `glab` nie jest uwierzytelnione, popros uzytkownika o samodzielne wykonanie `glab auth login`; narzedzie wykrywa host z remote, a dla innej instancji obsluguje `--hostname`.

Pobierz opis MR, powiazane wymaganie lub issue, status pipeline, dyskusje oraz nazwy galezi. Nie opieraj review tylko na opisie autora.

Gdy `glab` nie jest dostepne, uzyj istniejacego remote GitLaba i pobierz konkretne referencje bez przelaczania galezi ani nadpisywania drzewa roboczego:

```powershell
git remote -v
git fetch <remote> <base-branch> <source-branch>
git diff --find-renames <base-sha>...<head-sha>
```

Nie uzywaj GitHub CLI `gh` do obslugi GitLaba. Nie uruchamiaj kodu z niezaufanego MR, skryptow instalacyjnych ani komend wymagajacych sekretow bez wyraznej zgody uzytkownika.

### 3. Zbuduj model zmiany

1. Przejrzyj liste zmienionych plikow i statystyke diffa.
2. Zidentyfikuj kontrakty, punkty wejscia, przeplyw danych i zachowanie zmieniane przez MR.
3. Czytaj diff razem z niezbednym kontekstem pliku. Dla istotnego symbolu sprawdz jego definicje, wywolania, testy i konfiguracje.
4. Porownaj implementacje z wymaganiem. Wskaz zachowania dodane niejawnie albo wymagania pominiete.
5. Traktuj kod wygenerowany, zaleznosci i pliki lock jako osobne powierzchnie ryzyka; nie recenzuj ich jak recznie pisanego kodu.

### 4. Sprawdz ryzyka systematycznie

Dla kazdej zmienionej sciezki ocen:

- poprawnosc logiki, warunki brzegowe, wartosci puste, bledne i skrajne;
- zgodnosc API, typow, schematow danych, migracji i kompatybilnosc wsteczna;
- obsluge bledow, retry, timeouty, anulowanie, idempotencje i czesciowe awarie;
- wspolbieznosc, kolejnosc zdarzen, transakcje, stan i wycieki zasobow;
- autoryzacje, walidacje wejscia, ekspozycje sekretow, injection i granice zaufania;
- wydajnosc, zlozonosc, zapytania N+1, pamiec, I/O i zachowanie przy duzej skali;
- obserwowalnosc: logi bez danych wrazliwych, metryki i diagnozowalnosc awarii;
- testy pozytywne, negatywne, regresyjne i integracyjne adekwatne do ryzyka.

Nie zglaszaj problemu na podstawie samej mozliwosci. Przesledz osiagalna sciezke wykonania i wskaz konkretny scenariusz, ktory wywoluje blad.

### 5. Zweryfikuj ustalenia

1. Dla kazdego kandydata na finding sprobuj go obalic przez odczyt najblizszego call site, testu albo kontraktu.
2. Uruchom najwezsze dostepne testy, lint lub typecheck, ktore moga potwierdzic problem. Nie instaluj zaleznosci ani nie wykonuj niezaufanych skryptow bez zgody.
3. Odrzuc uwagi czysto preferencyjne i duplikaty tego samego root cause.
4. Jesli nie da sie potwierdzic zachowania, oznacz je jako pytanie lub ryzyko, nie jako udowodniony defekt.
5. Przed odpowiedzia sprawdz, czy lokalizacja nadal istnieje w reviewowanym SHA.

## Klasyfikacja waznosci

- **Krytyczny**: mozliwa kompromitacja bezpieczenstwa, utrata lub korupcja danych, globalna awaria albo brak mozliwosci bezpiecznego wdrozenia.
- **Wysoki**: prawdopodobna awaria glownego przeplywu, powazna regresja lub naruszenie kontraktu bez praktycznego obejscia.
- **Sredni**: realny blad w okreslonych warunkach, problem operacyjny, wydajnosciowy albo istotna luka w obsludze bledow.
- **Niski**: ograniczone ryzyko utrzymaniowe lub testowe, ktore ma konkretny koszt i warto poprawic przed merge.

Nie zawyzaj waznosci. Styl i opcjonalne ulepszenia umiesc poza findings albo pomin.

## Format odpowiedzi

Zacznij od findings uporzadkowanych malejaco wedlug waznosci. Kazdy finding powinien zawierac:

```markdown
### [Wysoki] Krotki opis skutku
`sciezka/do/pliku.ts:42`

Wyjasnij scenariusz wywolujacy problem, obserwowalny skutek i dlaczego obecny kod go powoduje. Podaj najmniejsza sensowna korekte lub kierunek naprawy.
```

Lokalizuj uwage na najmniejszym zmienionym fragmencie, ktory pozwala zrozumiec problem. Nie podawaj zakresu dluzszego niz potrzeba. Gdy finding dotyczy interakcji kilku miejsc, wskaz miejsce najlepsze do komentarza i wymien pozostale w tresci.

Po findings dodaj kolejno:

1. **Pytania i zalozenia** - tylko te, ktore moga zmienic wynik review.
2. **Podsumowanie zmiany** - maksymalnie kilka zdan, drugorzedne wobec findings.
3. **Weryfikacja** - wykonane komendy i ich wynik oraz testy, ktorych nie udalo sie uruchomic.

Jesli nie znaleziono problemow, napisz to wprost i wymien pozostale ryzyko lub luki w weryfikacji. Nie tworz uwag, aby wypelnic raport.

## Publikacja w Merge Request

Domyslnie pokaz caly raport w czacie i nie zmieniaj niczego w GitLabie. Nastepnie zapytaj, czy uzytkownik zatwierdza publikacje wskazanych findings. Brak odpowiedzi, odpowiedz niejednoznaczna albo prosba o poprawki nie sa zgoda.

Po jednoznacznym potwierdzeniu:

1. Ponownie pobierz dane MR i upewnij sie, ze zrodlowy SHA nie zmienil sie od czasu review. Jesli sie zmienil, wstrzymaj publikacje i zaktualizuj review.
2. Pokaz liste komentarzy, ktore zostana opublikowane, jesli potwierdzenie nie wskazywalo ich jednoznacznie.
3. Publikuj finding przy odpowiedniej linii najnowszego diffa:

```powershell
glab mr note create <iid> --file <sciezka> --line <linia> -m '<tresc>' -R <url-lub-namespace-repo>
```

Uzyj `--old-line` dla usunietej linii. Gdy komentarza nie da sie poprawnie przypiac do diffa, dodaj komentarz ogolny z dokladna sciezka i lokalizacja zamiast wybierac przypadkowa linie. Nie publikuj duplikatow ani pytan przedstawionych jako defekty.

`glab mr note create` oraz tryb pending review sa oznaczone w dokumentacji `glab` jako eksperymentalne. Jesli dostepna wersja CLI ich nie obsluguje, nie obchodz tego automatycznie przez API: poinformuj uzytkownika i przedstaw gotowe komentarze do recznej publikacji.

Po publikacji odczytaj dyskusje przez `glab mr view <iid> --comments -R <repo>` i potwierdz, ktore komentarze faktycznie utworzono. Nie zatwierdzaj MR i nie ustawiaj decyzji `requested_changes` bez osobnej, wyraznej dyspozycji.

## Kryteria zakonczenia

Review jest kompletne, gdy:

- zakres odpowiada konkretnym SHA bazowym i zrodlowym;
- wymagania zostaly zestawione z implementacja;
- istotne zmiany przeanalizowano wraz z call sites i testami;
- kazdy finding ma osiagalny scenariusz, skutek, dowod i adekwatna waznosc;
- wykonano mozliwie najwezsza weryfikacje albo jawnie opisano jej brak;
- odpowiedz oddziela potwierdzone defekty od pytan, zalozen i sugestii.
- zadne komentarze ani decyzje nie trafily do GitLaba bez jednoznacznego potwierdzenia uzytkownika.
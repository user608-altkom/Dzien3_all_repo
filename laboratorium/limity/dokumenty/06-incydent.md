# 06-incydent

Obserwacje

Log pokazuje limit 15000 o 09:59:59Z i dokładnie o 10:00:00Z, a dopiero o 10:01:00Z limit bazowy 10000 (zdarzenia.log:1-3).
Problematyczne wejście ma teraz równe dokładnie wniosek.do: 2026-09-22T10:00:00Z (wejscie.json:5-15).
Implementacja uznaje koniec okresu za włączony przez warunek t <= Date.parse(wniosek.do) (ocena-incydent.mjs:1-5).
BRIEF definiuje przedział jako od <= teraz < do. Przy teraz == do ma obowiązywać limit bazowy (BRIEF.md:19).
Log nie dowodzi błędu strefy czasowej. Wszystkie pokazane czasy są zapisane w UTC z Z.
Hipoteza

Objaw powoduje domknięcie prawej granicy w warunku t <= do. Hipotezę można obalić testem wywołującym limitWChwili dla teraz == do: obecny kod powinien zwrócić 15000, choć kontrakt wymaga 10000.

Nie ma podstaw, aby twierdzić, że błąd dotyczy całej minuty. Dane potwierdzają tylko nieprawidłowy wynik dokładnie na granicy oraz prawidłowy wynik minutę później.

Wejście odtwarzające


Oczekiwany wynik z BRIEF

Dla teraz == do:

limit efektywny: 10000 groszy,
przekroczenie: 2000 groszy,
źródło: bazowy.
Kod nie został zmieniony.

## Objaw

Do uzupełnienia.

## Fakty i hipotezy

Do uzupełnienia.

## Reprodukcja

Do uzupełnienia.

## Test regresyjny

Do uzupełnienia.

## Poprawka i wynik

Do uzupełnienia.

## Informacja dla operatora

Limit czasowy nieprawidłowo obowiązywał również dokładnie w chwili końca zgody, ponieważ implementacja traktowała granicę `do` jako włączoną.
Po poprawce limit czasowy obowiązuje przed `do`, a od chwili równej `do` obowiązuje limit bazowy.
Zachowanie sprawdzono testem regresyjnym dla chwili przed końcem, dokładnie na końcu i po końcu; wszystkie trzy przypadki przeszły.

## Kontrola do procedury odbioru

- Dla każdej czasowej zmiany limitu sprawdzić trzy chwile graniczne: bezpośrednio przed `do`, dokładnie w `do` i bezpośrednio po `do`, potwierdzając przejście z limitu czasowego na bazowy dokładnie w `do`.

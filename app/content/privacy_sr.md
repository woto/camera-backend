# Politika privatnosti za VolleyCam

**Poslednje ažuriranje:** 5. januar 2026.

## 1. Pregled
VolleyCam obuhvata Android aplikaciju i VolleyCam veb‑sajt na `volleycam.com`. Aplikacija snima odbojkaške utakmice uz „dashcam“ bafer mehanizam, a veb‑sajt omogućava pregled i upravljanje snimcima. Korisnici se pridružuju određenoj „sobi“ pomoću 6‑cifrenog koda kako bi povezali klipove sa sesijom igre.

## 2. Informacije koje prikupljamo

### 2.1. Video i audio podaci
- **Šta prikupljamo:** aplikacija pristupa kameri i mikrofonu uređaja radi snimanja videa i zvuka odbojkaških utakmica.
- **Kako se koristi:** aplikacija kontinuirano baferuje video u memoriji. Tek kada dođe do „trigger“ događaja (pokrenutog od strane korisnika sa mobilnog telefona ili sa veb‑sajta uz korišćenje koda sobe), relevantni segment (video i audio) se trajno čuva i otprema na naše servere (`volleycam.com`).
- **Rad u pozadini:** aplikacija nastavlja snimanje dok je ekran isključen kako bi se sačuvala baterija tokom dugih utakmica (obično 3 sata).

### 2.2. Identifikacija sobe
- **Šta prikupljamo:** 6‑cifreni ID sobe koji korisnici proizvoljno kreiraju za svoju sesiju.
- **Kako se koristi:** za povezivanje otpremljenih klipova sa određenom sesijom igre i kontrolu pristupa na veb‑sajtu.

### 2.3. Podaci o korišćenju veb‑sajta
- **Šta prikupljamo:** standardni podaci veb logova kao što su IP adresa, tip pregledača i posećene stranice. Veb‑sajt takođe koristi kolačiće kako bi vas zadržao prijavljenim, zapamtio jezik i sačuvao trenutni izbor sobe.
- **Kako se koristi:** za rad veb‑sajta, obezbeđivanje pristupa snimcima i pružanje traženih stranica i funkcija.

### 2.4. Identifikator uređaja
- **Šta prikupljamo:** tehnički identifikator uređaja (nasumični UUID) sačuvan na uređaju.
- **Kako se koristi:** za formiranje jedinstvenih naziva fajlova i ispravnu obradu otpremanja na serveru.

## 3. Deljenje i prenos podataka
- **Otpremanje na server:** snimljeni klipovi se otpremaju na naš bezbedni server `volleycam.com`.
- **Šifrovanje:** sav prenos podataka je šifrovan standardnim HTTPS/WSS protokolima.
- **Javna vidljivost:**
    - Klipovi povezani sa ID‑jem sobe dostupni su svima koji poseduju taj važeći 6‑cifreni kod.
    - **Važno:** kada je klip „objavljen“ ili otpremljen, može biti javno dostupan svakom korisniku na internetu koji ima tačan link ili ID sobe putem veb‑sajta. Nemojte koristiti ovaj servis za snimanje privatnih ili osetljivih trenutaka.

## 4. Period čuvanja
Otpremljeni klipovi se čuvaju neograničeno dok ih korisnik ne obriše. Korisnici mogu da obrišu klipove putem veb‑sajta ako znaju ID sobe. Takođe možete kontaktirati administratora sajta da biste zatražili brisanje. U nekim slučajevima, klipovi mogu biti uklonjeni po nahođenju administratora. Baferovani snimci u memoriji uređaja se ne čuvaju ako nije poslat trigger.

## 5. Prava i kontrola korisnika
- **Otpremanje:** vi kontrolišete kada je aplikacija aktivna i snima.
- **Brisanje:** korisnici sa pristupom ID‑ju sobe mogu obrisati klipove preko VolleyCam veb‑sajta. Takođe možete zatražiti brisanje kontaktiranjem podrške.
- **Prijava:** možete prijaviti neprimeren sadržaj preko sajta.

## 6. Kontakt
Ako imate pitanja o ovoj politici privatnosti, kontaktirajte nas na: oganer@gmail.com

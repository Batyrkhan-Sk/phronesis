---
title: "Julius Caesar’s secret code (and why it failed)"
hook: "Caesar hid messages by shifting each letter three places. It worked until a 9th-century scholar invented a way to break any cipher like it."
short: "The Caesar cipher replaces each letter with one a fixed number of places further along the alphabet. It is trivially breakable, and Al-Kindi’s 9th-century method of frequency analysis broke all such substitution ciphers. A version of it, ROT13, lives on in internet culture."
kind: concept
era: "1st century BC"
glyph: "A→D"
topics: [history, mathematics, technology, internet-culture]
modes: [useful, learn-in-5, story]
connections:
  - to: birthday-paradox
    kind: leads-to
    why: "Modern cryptography relies on probability, and the birthday paradox is one of its most important attacks."
claims:
  - text: "Suetonius records that Caesar used a shift of three letters."
    status: established
  - text: "Al-Kindi described frequency analysis in the 9th century."
    status: established
sources:
  - title: "The Code Book"
    author: "Simon Singh"
    year: 1999
    type: book
  - title: "Caesar cipher"
    url: "https://en.wikipedia.org/wiki/Caesar_cipher"
    type: reference
---

According to the Roman historian **Suetonius**, Caesar wrote sensitive letters by replacing each letter with the one **three places later**: A→D, B→E, and so on.

```
Plain:   VENI VIDI VICI
Cipher:  YHQL YLGL YLFL
```

## How it was broken

There are only 25 possible shifts, so you can simply try them all. But the deeper break came in 9th-century Baghdad. The polymath **Al-Kindi** observed that in any language **some letters are much more common than others**. Count the symbols in a long ciphertext, match the most frequent to the most common letters of the language, and the message emerges.

Frequency analysis defeats **every simple substitution cipher**, however scrambled the alphabet. Cryptographers spent the next thousand years inventing ways to hide letter frequencies, and other people kept finding ways to break them.

## Its internet afterlife

On Usenet in the 1980s, people hid spoilers and punchlines with **ROT13**, a shift of 13. Because the alphabet has 26 letters, applying it twice gives back the original. It is not meant to keep secrets, only to stop you reading something by accident.

---
title: "In a room of 23 people, two probably share a birthday"
hook: "It sounds impossible with 365 days to choose from, but the odds pass 50% with just 23 people and reach 99.9% with 70."
short: "The birthday paradox works because you are not comparing one person to everyone. You are comparing every pair, and 23 people form 253 pairs. The same maths is used to attack digital security."
kind: concept
glyph: "23"
topics: [mathematics, technology, everyday-life]
modes: [useful, strange, conversation, learn-in-5]
conversationStarter: "In a group of just 23 people, it’s more likely than not that two of them share a birthday. Want to test it?"
connections:
  - to: frequency-illusion
    kind: related
    why: "Coincidences feel meaningful because intuition is bad at counting how many chances there are."
claims:
  - text: "With 23 people, the probability that at least two share a birthday is about 50.7%."
    status: established
  - text: "Birthday attacks find hash collisions with roughly √N attempts instead of N."
    status: established
sources:
  - title: "Birthday problem"
    url: "https://en.wikipedia.org/wiki/Birthday_problem"
    type: reference
  - title: "Fifty Challenging Problems in Probability"
    author: "Frederick Mosteller"
    year: 1965
    type: book
---

Ask most people how many are needed for a 50% chance of a shared birthday and they guess around 180. The answer is **23**.

## Why intuition fails

We imagine **ourselves** finding a match, which really is unlikely. But the question is about **any two people**. With 23 people there are

> 23 × 22 ÷ 2 = **253 pairs**,

and each pair is a separate chance. The easiest way to calculate it is through the opposite: the chance that *everyone* is different.

> 365/365 × 364/365 × 363/365 × … × 343/365 ≈ 0.493

So the chance of at least one match is about **50.7%**. With 70 people it reaches **99.9%**.

| People | Chance of a shared birthday |
| --- | --- |
| 10 | 12% |
| 23 | 51% |
| 50 | 97% |
| 70 | 99.9% |

## Why security engineers care

Cryptographic hash functions give data a fingerprint. If two different documents ever share a fingerprint, called a **collision**, forgeries become possible. The birthday effect means an attacker needs only about the **square root** of the number of possible fingerprints to find one. That is why modern hashes have 256-bit outputs.

**A useful takeaway:** when something seems like an amazing coincidence, count how many chances there were for *some* coincidence to occur.

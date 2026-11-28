---
title: "The Scunthorpe problem: when a filter bans an innocent town"
hook: "In 1996 an internet company’s profanity filter refused to let people from a perfectly respectable English town sign up, and the same mistake has been repeating ever since."
short: "The Scunthorpe problem is the name for false-positive censorship: a filter that blocks harmless text because it contains a string of letters found in an obscenity. It is named after an April 1996 incident in which AOL’s filter stopped residents of Scunthorpe, England, from creating accounts. Its cousin, the “clbuttic mistake”, happens when a filter replaces the offending letters instead of blocking them."
kind: phenomenon
era: "1996"
glyph: "S***"
topics: [internet-culture, technology, language, society]
modes: [story, strange, didnt-know, learn-in-5]
conversationStarter: "There’s a famous bug called the Scunthorpe problem: in 1996 a profanity filter wouldn’t let people from the English town of Scunthorpe sign up, because of the letters hiding inside its name."
connections:
  - to: mondegreen
    kind: same-pattern
    why: "Both are mistakes made by hearing or reading a word as the wrong chunks: a listener misparses a lyric, a filter misparses a name."
  - to: goodharts-law
    kind: same-pattern
    why: "A crude rule that stands in for a goal (“block rude words” for “keep things civil”) gets gamed, or misfires, once it is applied mechanically."
  - to: eliza-effect
    kind: contrast
    why: "ELIZA seemed to understand language it was only pattern-matching; a naive filter shows how little pattern-matching understands."
claims:
  - text: "In April 1996 AOL’s profanity filter prevented people in Scunthorpe, England, from creating accounts, because the town’s name contains a substring of an obscenity."
    status: established
  - text: "Other British place names, including Penistone, Lightwater and Clitheroe, have been caught by similar filters."
    status: established
  - text: "Sources differ on details of the 1996 incident, such as how many people were affected and how AOL responded; one account says AOL briefly treated the town as having a different spelling in its own systems."
    status: anecdote
  - text: "The “clbuttic mistake” is a filter that blindly replaces “ass” with “butt”, turning “classic” into “clbuttic” and “assassinate” into “buttbuttinate”."
    status: established
  - text: "Matching on meaning rather than letters, for example with human review or context-aware software, reduces the problem but has never fully removed it."
    status: interpretation
sources:
  - title: "Scunthorpe problem"
    url: "https://en.wikipedia.org/wiki/Scunthorpe_problem"
    type: reference
  - title: "The Scunthorpe problem and the history of profanity filters"
    author: "Tedium"
    year: 2016
    url: "https://tedium.co/2016/07/26/scunthorpe-problem-profanity-filter-history"
    type: article
  - title: "Obscenity Filters: Bad Idea, or Incredibly Intercoursing Bad Idea?"
    author: "Jeff Atwood, Coding Horror"
    url: "https://blog.codinghorror.com/obscenity-filters-bad-idea-or-incredibly-intercoursing-bad-idea/"
    type: article
  - title: "More clbuttic idiocy from lexical censors on the web"
    author: "Language Log"
    url: "https://languagelog.ldc.upenn.edu/nll/?p=556"
    type: article
---

Scunthorpe is a steel town in Lincolnshire, England. In **April 1996**, some of its residents found they could not create an account with **AOL**, then one of the biggest online services. The reason was not their behaviour. A four-letter obscenity happens to sit in the middle of the town’s name, and the company’s **profanity filter** simply looked for that string of letters anywhere in what people typed.

That mistake gave its name to a whole class of error: the **Scunthorpe problem**, or false-positive censorship. A filter built to catch rude words ends up blocking innocent ones.

## Why it keeps happening

A computer matching letters does not know where one word ends and another begins, let alone what a word means. It sees a forbidden string and acts. Real examples include place names such as **Penistone**, **Lightwater** and **Clitheroe**, and people whose surnames contain the wrong letters and find that forms refuse to accept them.

Programmers can fix this by matching whole words only. But then people dodge the filter with misspellings or spaces, the filter grows more aggressive, and the cycle starts again.

## The clbuttic mistake

A related failure happens when the software does not block text but **rewrites** it. A filter that swaps every “ass” for “butt” turns “classic” into **“clbuttic”**, and “assassinate” into “buttbuttinate”. The word “clbuttic” is now used for any such over-eager replacement, and examples have turned up on thousands of websites.

## Telling it well

The story is a good one to share because it is gentle: nobody did anything wrong except a rule that was too simple. It is also a reminder for anyone who builds or relies on automatic moderation. Details of the 1996 incident vary between retellings, so it is safest to say what is well documented: AOL’s filter blocked sign-ups from the town, and the lesson has been relearned many times since.

<!-- deep-dive -->

## A problem of meaning

Linguists would call this a failure to separate **form** from **meaning**. The same letters can be an obscenity in one context and a town, a surname or a classic car in another. Modern moderation systems use context, but they still make mistakes in both directions, which is why many platforms keep humans in the loop.

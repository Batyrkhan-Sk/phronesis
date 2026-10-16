---
title: "Buridan’s ass: the donkey Buridan never mentioned"
hook: "A donkey starves between two identical bales of hay. The philosopher it is named after never wrote about it, but electronic engineers still have to deal with it."
short: "The famous donkey is named after the 14th-century philosopher Jean Buridan, yet it does not appear in his surviving writings. Versions of the puzzle are far older: Aristotle used a man between food and drink, and al-Ghazali used two dates. The image may have begun as a jibe at Buridan’s views on free will. Today, engineers see the same problem when a circuit must choose between two equal inputs."
kind: concept
era: "4th century BC · 11th century · 14th century"
glyph: "🫏"
topics: [philosophy, science, technology]
modes: [didnt-know, story, strange, learn-in-5]
conversationStarter: "Buridan’s ass is named after a philosopher who never wrote about it, and the same puzzle crashes real computer circuits."
connections:
  - to: ship-of-theseus
    kind: same-pattern
    why: "Another thought experiment with ancient roots that picked up its famous form and name much later."
  - to: elementary-my-dear-watson
    kind: same-pattern
    why: "A famous phrase credited to someone who did not quite say it."
  - to: veil-of-ignorance
    kind: related
    why: "Another thought experiment about how a rational chooser should decide, here when reason alone offers no reason to prefer either option."
claims:
  - text: "The donkey does not appear in Jean Buridan’s surviving writings."
    status: established
  - text: "Aristotle, in On the Heavens, describes a man as hungry as he is thirsty who stays still between food and drink."
    status: established
  - text: "Al-Ghazali used a version with two equally attractive dates, arguing that free will breaks the tie."
    status: established
  - text: "The image began as a mocking caricature of Buridan’s views on the will by his critics."
    status: interpretation
  - text: "Digital circuits that must pick between near-equal inputs can enter a metastable state and take unpredictably long to settle, a real-world analogue of the donkey."
    status: established
sources:
  - title: "Buridan’s ass"
    url: "https://en.wikipedia.org/wiki/Buridan%27s_ass"
    type: reference
  - title: "Metastability (electronics)"
    url: "https://en.wikipedia.org/wiki/Metastability_(electronics)"
    type: reference
  - title: "Buridan’s Principle"
    author: "Leslie Lamport"
    url: "https://www.microsoft.com/en-us/research/publication/buridans-principle/"
    type: paper
  - title: "Buridan’s Ass"
    url: "https://www.philosophyprofessor.com/thought-experiments/buridans-ass/"
    type: article
---

Picture a donkey placed exactly halfway between two identical bales of hay. With no reason to choose one over the other, it can never decide, and it starves. That is **Buridan’s ass**.

## Named for someone who didn’t say it

The puzzle is named after **Jean Buridan**, a French philosopher of the 14th century. But the donkey does not appear in any of his surviving works. The usual explanation is that it began as a caricature by his critics, aimed at his view that the will can be moved by reasons. That is an interpretation, not a documented fact.

## Far older than Buridan

- **Aristotle**, in *On the Heavens*, mentions a man who is just as hungry as he is thirsty and stands between food and drink. He used it for a different argument, about why the Earth stays still.
- **Al-Ghazali**, in the 11th century, offered a man faced with two equal dates. His answer was that he will take one, because the will can break a tie that reason cannot. **Averroes** later took the opposite side.

## The donkey in your phone

Engineers know this as **metastability**. A circuit that must decide between two states, such as a 0 and a 1, can be given an input exactly in between. It may then hover for an unpredictably long time before settling, causing the occasional glitch. **Leslie Lamport**’s paper “Buridan’s Principle” argued that this follows from continuity: a decision made in bounded time from continuous inputs can sometimes fail. Real systems get around it by waiting long enough that failure becomes astronomically unlikely, rather than eliminating it.

## For the dinner table

People often use the tale as a warning about overthinking. The sensible answer, given by al-Ghazali and by most of us in a supermarket aisle, is simply to pick one. A tie in reasons does not need to become a tie in action.

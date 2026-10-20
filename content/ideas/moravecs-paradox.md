---
title: "Moravec’s paradox: hard is easy, and easy is hard"
hook: "A computer can beat a grandmaster at chess, yet folding laundry or walking over rough ground stayed a research problem for decades."
short: "Moravec’s paradox is the observation, stated by Hans Moravec in 1988 and reached independently by Marvin Minsky, Rodney Brooks and others, that machines find adult-level reasoning comparatively easy and the perception and movement of a small child very hard. The usual explanation is evolution: we have had hundreds of millions of years of practice at moving and sensing, and only a moment at abstract thought."
kind: concept
era: "1980s"
glyph: "♟ ✋"
topics: [ai, technology, psychology]
modes: [didnt-know, useful, learn-in-5]
conversationStarter: "It is oddly easier to make a computer beat a chess champion than to make a robot fold a towel, and the reason is that what feels effortless to us took evolution the longest."
connections:
  - to: ai-winters
    kind: related
    why: "Over-confident early predictions that human-level skills would be quickly solved ran into exactly this wall."
  - to: perceptron-hype
    kind: related
    why: "Early optimism about perception and learning, which turned out much harder than the first demos suggested."
  - to: mechanical-turk
    kind: contrast
    why: "The Turk faked the impressive part, chess, with a hidden person; real machines found chess the easier part and physical skill the harder."
claims:
  - text: "Hans Moravec stated the idea in his 1988 book Mind Children, and Marvin Minsky and Rodney Brooks reached similar conclusions in the 1980s."
    status: established
  - text: "Machines found tasks like chess and intelligence tests comparatively easy, and perception and mobility at a toddler’s level very hard."
    status: established
  - text: "Steven Pinker popularised the idea in 1994 with the line that the hard problems are easy and the easy problems are hard."
    status: established
  - text: "The best-known explanation is that perception and movement were shaped by hundreds of millions of years of evolution, while abstract reasoning is evolutionarily recent."
    status: interpretation
sources:
  - title: "Moravec’s paradox"
    url: "https://en.wikipedia.org/wiki/Moravec%27s_paradox"
    type: reference
  - title: "Mind Children: The Future of Robot and Human Intelligence"
    author: "Hans Moravec"
    year: 1988
    type: book
  - title: "The Language Instinct"
    author: "Steven Pinker"
    year: 1994
    type: book
---

Ask most people which is harder: playing grandmaster chess, or picking up a coffee cup without spilling it. They will say chess. Early AI research found the opposite.

## The observation

In the 1980s several researchers noticed the same pattern. **Hans Moravec** put it in its best-known form in his 1988 book *Mind Children*: it is comparatively easy to make computers do well at adult-level reasoning, such as intelligence tests or checkers, and difficult or impossible to give them the perception and mobility of a one-year-old. **Marvin Minsky** and **Rodney Brooks** reached similar conclusions independently. In 1994 **Steven Pinker** summed it up as the hard problems being easy, and the easy problems being hard.

The pattern kept showing up. A chess program beat world champion Garry Kasparov in 1997, but a robot that could reliably load a dishwasher in an ordinary kitchen stayed out of reach for far longer.

## Why would that be?

The usual explanation is **evolution**. Seeing, grasping and balancing have been refined over hundreds of millions of years, and they run so smoothly that we do not notice the work. Abstract reasoning is recent in evolutionary terms and feels hard precisely because we are not well optimised for it, so it is simpler to describe in rules a computer can follow. Minsky made a related point: the skills we are least aware of are the hardest to reverse-engineer. This is an interpretation, not a proven law, but it is the account most people give.

## A useful habit of mind

The paradox is a gentle warning about **judging difficulty by how it feels**. What seems effortless may be enormously complex, and what feels impressive may be simple to automate. It also explains why forecasts about machines that can think so often went wrong: the early successes were at the parts that looked like intelligence to us, not the parts that were hardest to build. It is a good thing to bring up when someone asks which jobs robots will take, because the honest answer is that the manual ones may be harder than the clever ones.

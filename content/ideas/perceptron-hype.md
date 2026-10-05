---
title: "In 1958 the Navy said its neural network would one day be conscious"
hook: "The first trainable neural network, the perceptron, was announced as the embryo of a computer that would “walk, talk, see, write, reproduce itself and be conscious of its existence”."
short: "Frank Rosenblatt built the perceptron at Cornell Aeronautical Laboratory: a learning system loosely modelled on neurons, later built in hardware with 400 light sensors. A 1958 New York Times report about a Navy press conference made sweeping predictions. In 1969 Minsky and Papert showed the limits of single-layer perceptrons, and neural-network research lost funding for years. Rosenblatt died in 1971; the approach he championed returned decades later."
kind: story
era: "1958"
glyph: "⊙→"
topics: [ai, technology, history, people]
modes: [story, didnt-know, connections, deep-dive]
conversationStarter: "In 1958 a newspaper reported the Navy expected its new learning machine to eventually be conscious of its own existence."
connections:
  - to: dartmouth-1956
    kind: related
    why: "The same era of bold promises."
  - to: ai-winters
    kind: leads-to
    why: "Overpromising and a famous critique pushed neural networks out of favour."
  - to: deep-learning-comeback
    kind: leads-to
    why: "Modern AI is built on the multi-layer descendants of Rosenblatt’s idea."
claims:
  - text: "Rosenblatt simulated the perceptron on an IBM 704 in 1957 and described it in 1958."
    status: established
  - text: "The Mark I Perceptron used a 20×20 grid of photocells (400 pixels)."
    status: established
  - text: "The New York Times reported the Navy expected it to “walk, talk, see, write, reproduce itself and be conscious of its existence”."
    status: established
  - text: "Minsky and Papert’s 1969 book Perceptrons alone caused the decline of neural network research."
    status: disputed
sources:
  - title: "Perceptron"
    url: "https://en.wikipedia.org/wiki/Perceptron"
    type: reference
  - title: "Professor’s perceptron paved the way for AI – 60 years too soon"
    author: "Cornell Chronicle"
    year: 2019
    url: "https://news.cornell.edu/stories/2019/09/professors-perceptron-paved-way-ai-60-years-too-soon"
    type: article
  - title: "Did Minsky and Papert know that multi-layer perceptrons could solve XOR? (AI Stack Exchange)"
    url: "https://ai.stackexchange.com/questions/1288/did-minsky-and-papert-know-that-multi-layer-perceptrons-could-solve-xor"
    type: discussion
---

## Neurons as logic

In **1943**, the neuroscientist **Warren McCulloch** and the logician **Walter Pitts** published a paper describing simplified **neurons** as switches that could compute logical functions. If brains were networks of such units, perhaps machines could be built from them too.

## A machine that learns

At Cornell Aeronautical Laboratory, the psychologist **Frank Rosenblatt** took the next step: a network that could **learn** from examples. He simulated his **perceptron** on an IBM 704 in **1957** and published it in **1958**. The later **Mark I Perceptron** hardware looked at images through a **20×20 grid of light sensors** and adjusted its connection strengths with electric motors as it learned to tell shapes apart.

## The headline

In 1958 the **New York Times** reported on a US Navy demonstration, describing the perceptron as “the embryo of an electronic computer that [the Navy] expects will be able to **walk, talk, see, write, reproduce itself and be conscious of its existence**.” That was a remarkable claim for a machine that could learn to tell left from right.

<!-- deep-dive -->

## The backlash

In **1969**, **Marvin Minsky** and **Seymour Papert** published *Perceptrons*, showing mathematically that a **single-layer** perceptron cannot learn some simple functions, most famously **XOR** (“one or the other, but not both”). Multi-layer networks could, in principle, but nobody yet had a good way to train them.

The book was widely read as a verdict against neural networks, and funding dried up. How much blame it deserves is still argued over in discussion forums and histories; the wider collapse in AI funding had several causes.

Rosenblatt died in a boating accident in **1971**. Training multi-layer networks became practical with backpropagation in the 1980s, and dominant in the 2010s. A 2019 Cornell article summed it up: his perceptron paved the way for AI “**60 years too soon**”.

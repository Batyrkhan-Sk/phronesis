---
title: "From a bedroom GPU to ChatGPT"
hook: "In 2012 a neural network trained on two gaming graphics cards in a student’s bedroom crushed an image-recognition contest. Ten years later, chatbots built on the same lineage reached the public."
short: "AlexNet, by Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton, won the 2012 ImageNet challenge by a wide margin, trained on two NVIDIA GTX 580 gaming GPUs at Krizhevsky’s parents’ house. It launched the deep-learning boom. In 2017 Google researchers introduced the Transformer in “Attention Is All You Need”, the architecture behind today’s large language models, including ChatGPT (2022) and Claude."
kind: event
era: "2012 · 2017 · 2022"
glyph: "∞"
topics: [ai, technology, history, people]
modes: [story, connections, conversation]
conversationStarter: "The network that started the modern AI boom was trained on two gaming graphics cards in a student’s bedroom at his parents’ house."
connections:
  - to: perceptron-hype
    kind: influenced
    why: "Deep learning is the many-layered descendant of Rosenblatt’s perceptron."
  - to: ai-winters
    kind: contrast
    why: "Neural network researchers kept going through the winters, and were eventually proved right."
  - to: eliza-effect
    kind: related
    why: "Today’s chatbots revive Weizenbaum’s worries at a far larger scale."
  - to: mechanical-turk
    kind: related
    why: "Modern AI is trained on huge amounts of data labelled by people, often through platforms like Amazon Mechanical Turk."
claims:
  - text: "AlexNet won ImageNet 2012 with a top-5 error of 15.3%, more than 10.8 points better than the runner-up."
    status: established
  - text: "It was trained on two NVIDIA GTX 580 GPUs in Krizhevsky’s bedroom at his parents’ house."
    status: established
  - text: "The Transformer architecture was introduced in the 2017 paper “Attention Is All You Need”."
    status: established
  - text: "Hinton, LeCun and Bengio received the 2018 Turing Award for their work on deep learning."
    status: established
sources:
  - title: "AlexNet"
    url: "https://en.wikipedia.org/wiki/AlexNet"
    type: reference
  - title: "ImageNet Classification with Deep Convolutional Neural Networks"
    author: "Krizhevsky, Sutskever & Hinton"
    year: 2012
    type: paper
  - title: "Attention Is All You Need"
    author: "Vaswani et al."
    year: 2017
    url: "https://papers.nips.cc/paper/7181-attention-is-all-you-need"
    type: paper
  - title: "Attention Is All You Need (discussion, 225 points)"
    url: "https://news.ycombinator.com/item?id=15938082"
    type: discussion
---

Through the AI winters, a small group kept working on **neural networks**, among them **Geoffrey Hinton**, **Yann LeCun** and **Yoshua Bengio**. By the 2000s three ingredients they lacked were arriving: **large datasets** (like **ImageNet**, millions of labelled photos), **fast parallel hardware** in the form of graphics cards built for video games, and better **training methods**.

## 2012: AlexNet

In **2012**, Hinton’s students **Alex Krizhevsky** and **Ilya Sutskever** entered the ImageNet image-recognition challenge with a deep neural network, **AlexNet**. It won with a top-5 error rate of **15.3%**, more than **10 points** ahead of the runner-up. It had been trained on **two NVIDIA GTX 580 gaming GPUs**, in Krizhevsky’s **bedroom at his parents’ house**.

Yann LeCun called it “an unequivocal turning point in the history of computer vision.” Within a few years, deep learning had taken over speech recognition, translation and much more. In **2018**, Hinton, LeCun and Bengio received the **Turing Award**, computing’s highest honour.

## 2017: the Transformer

In **2017**, eight researchers at Google published “**Attention Is All You Need**”, introducing the **Transformer**: an architecture that processes whole sequences at once and learns which parts to pay “**attention**” to. It trained efficiently on huge amounts of text.

Transformers became the basis of **large language models**: systems trained on vast text collections to predict the next word, which turned out to be capable of writing, summarising, coding and conversation. **ChatGPT**, released in November **2022**, brought them to the public, followed by other assistants such as **Claude**.

## The long arc

The idea under all of it goes back to the earlier ideas in this trail: Leibniz’s hope that reasoning could be calculation, Turing’s **child machine** that learns, Rosenblatt’s **perceptron**, and Weizenbaum’s warning about how readily we see minds in machines. What’s new is mostly **scale**. The old questions about what the systems understand, what they should decide and who benefits remain open.
